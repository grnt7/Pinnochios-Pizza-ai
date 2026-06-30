import { useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LoadingScreen from "@/components/loading-screen";
import { palette, radii } from "@/theme";

function formatClerkError(err: unknown): string | null {
  if (err == null) return null;
  if (typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m.length > 0) return m;
    if (Array.isArray(m) && m.length > 0) {
      const first = m[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object" && "message" in first) {
        const msg = (first as { message?: unknown }).message;
        if (typeof msg === "string") return msg;
      }
    }
  }
  return String(err);
}

type VerifyMode =
  | "none"
  | "first_factor_email"
  | "client_trust_email"
  | "mfa_totp"
  | "mfa_phone"
  | "mfa_email"
  | "mfa_backup";

/**
 * Email/password sign-in using Clerk’s `signIn.password` flow, with follow-up
 * steps for email codes, MFA (TOTP / SMS / email), and backup codes.
 * @see https://clerk.com/docs/guides/development/custom-flows/authentication/email-password
 */
export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifyMode, setVerifyMode] = useState<VerifyMode>("none");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!signIn || fetchStatus === "fetching") {
    return <LoadingScreen message="Connecting to Clerk…" />;
  }

  async function finishIfComplete(): Promise<boolean> {
    if (signIn.status !== "complete" || !signIn.createdSessionId) {
      return false;
    }
    const fin = await signIn.finalize();
    const finErr = formatClerkError(fin.error);
    if (finErr) {
      setError(finErr);
      return true;
    }
    setVerifyMode("none");
    setCode("");
    router.replace("/(tabs)");
    return true;
  }

  async function afterPasswordOrPartialSignIn(): Promise<void> {
    if (await finishIfComplete()) return;

    // First factor: e.g. email OTP before password is considered done
    if (signIn.status === "needs_first_factor") {
      const factors = signIn.supportedFirstFactors ?? [];
      const emailCode = factors.find((f) => f.strategy === "email_code");

      if (emailCode) {
        const sendParams =
          "emailAddressId" in emailCode &&
          typeof (emailCode as { emailAddressId?: string }).emailAddressId ===
            "string"
            ? {
                emailAddressId: (emailCode as { emailAddressId: string })
                  .emailAddressId,
              }
            : { emailAddress: email.trim() };

        const prep = await signIn.emailCode.sendCode(sendParams);
        if (prep.error) {
          setError(
            formatClerkError(prep.error) ?? "Could not send email verification code.",
          );
          return;
        }
        setVerifyMode("first_factor_email");
        return;
      }
    }

    // New-device / risk checks — often email OTP via second factors
    if (signIn.status === "needs_client_trust") {
      const emailCode = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === "email_code",
      );
      if (emailCode && signIn.mfa) {
        const send = await signIn.mfa.sendEmailCode();
        if (send.error) {
          setError(formatClerkError(send.error) ?? "Could not send email code.");
          return;
        }
        setVerifyMode("client_trust_email");
        return;
      }
    }

    if (signIn.status === "needs_second_factor" && signIn.mfa) {
      const factors = signIn.supportedSecondFactors ?? [];
      if (factors.some((f) => f.strategy === "totp")) {
        setVerifyMode("mfa_totp");
        return;
      }
      if (factors.some((f) => f.strategy === "phone_code")) {
        const send = await signIn.mfa.sendPhoneCode();
        if (send.error) {
          setError(formatClerkError(send.error) ?? "Could not send SMS code.");
          return;
        }
        setVerifyMode("mfa_phone");
        return;
      }
      if (factors.some((f) => f.strategy === "email_code")) {
        const send = await signIn.mfa.sendEmailCode();
        if (send.error) {
          setError(formatClerkError(send.error) ?? "Could not send email code.");
          return;
        }
        setVerifyMode("mfa_email");
        return;
      }
      if (factors.some((f) => f.strategy === "backup_code")) {
        setVerifyMode("mfa_backup");
        return;
      }
    }

    setError(
      "This sign-in needs an extra step this build does not handle yet (e.g. OAuth-only account). Try another sign-in method or contact support.",
    );
  }

  async function handleSignIn() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter email and password.");
      return;
    }
    setBusy(true);
    try {
      const res = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (res.error) {
        setError(formatClerkError(res.error) ?? "Sign-in failed.");
        return;
      }

      await afterPasswordOrPartialSignIn();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode() {
    setError(null);
    if (!code.trim()) {
      setError("Enter the code.");
      return;
    }
    setBusy(true);
    try {
      const trimmed = code.trim();

      if (verifyMode === "first_factor_email") {
        const att = await signIn.emailCode.verifyCode({ code: trimmed });
        if (att.error) {
          setError(formatClerkError(att.error) ?? "Invalid code.");
          return;
        }
        await afterPasswordOrPartialSignIn();
        return;
      }

      if (!signIn.mfa) {
        setError("Verification unavailable. Start over and try again.");
        return;
      }

      let mfaErr: unknown = undefined;
      if (verifyMode === "client_trust_email" || verifyMode === "mfa_email") {
        const r = await signIn.mfa.verifyEmailCode({ code: trimmed });
        mfaErr = r.error;
      } else if (verifyMode === "mfa_phone") {
        const r = await signIn.mfa.verifyPhoneCode({ code: trimmed });
        mfaErr = r.error;
      } else if (verifyMode === "mfa_totp") {
        const r = await signIn.mfa.verifyTOTP({ code: trimmed });
        mfaErr = r.error;
      } else if (verifyMode === "mfa_backup") {
        const r = await signIn.mfa.verifyBackupCode({ code: trimmed });
        mfaErr = r.error;
      }

      if (mfaErr) {
        setError(formatClerkError(mfaErr) ?? "Verification failed.");
        return;
      }

      if (await finishIfComplete()) return;
      await afterPasswordOrPartialSignIn();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendCode() {
    if (!signIn.mfa) return;
    setBusy(true);
    setError(null);
    try {
      if (
        verifyMode === "client_trust_email" ||
        verifyMode === "mfa_email"
      ) {
        const send = await signIn.mfa.sendEmailCode();
        if (send.error) {
          setError(formatClerkError(send.error) ?? "Could not resend.");
        }
      } else if (verifyMode === "mfa_phone") {
        const send = await signIn.mfa.sendPhoneCode();
        if (send.error) {
          setError(formatClerkError(send.error) ?? "Could not resend.");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function handleStartOver() {
    void signIn.reset();
    setVerifyMode("none");
    setCode("");
    setError(null);
  }

  const verificationTitle =
    verifyMode === "mfa_totp"
      ? "Authenticator code"
      : verifyMode === "mfa_backup"
        ? "Backup code"
        : "Verification code";

  const verificationHint =
    verifyMode === "mfa_totp"
      ? "Enter the 6-digit code from your authenticator app."
      : verifyMode === "mfa_backup"
        ? "Enter a one-time backup code."
      : verifyMode === "mfa_phone"
        ? "Enter the code we sent by SMS."
        : "Enter the code we emailed you.";

  if (verifyMode !== "none") {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
        >
          <Text style={styles.title}>{verificationTitle}</Text>
          <Text style={styles.subtitle}>{verificationHint}</Text>

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={
              verifyMode === "mfa_totp"
                ? "123456"
                : verifyMode === "mfa_backup"
                  ? "XXXXXXXX"
                  : "Code"
            }
            value={code}
            onChangeText={setCode}
            keyboardType="default"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.cta, busy && styles.ctaDisabled]}
            onPress={() => void handleVerifyCode()}
            disabled={busy}
          >
            <Text style={styles.ctaLabel}>
              {busy ? "Please wait…" : "Continue"}
            </Text>
          </Pressable>

          {(verifyMode === "client_trust_email" ||
            verifyMode === "mfa_email" ||
            verifyMode === "mfa_phone") && (
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void handleResendCode()}
              disabled={busy}
            >
              <Text style={styles.secondaryLabel}>Send code again</Text>
            </Pressable>
          )}

          <Pressable style={styles.secondaryBtn} onPress={handleStartOver}>
            <Text style={styles.secondaryLabel}>Start over</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <Text style={styles.title}>Pinnochio&apos;s Pizza</Text>
        <Text style={styles.subtitle}>Sign in to browse the menu.</Text>

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.cta, busy && styles.ctaDisabled]}
          onPress={() => void handleSignIn()}
          disabled={busy}
        >
          <Text style={styles.ctaLabel}>{busy ? "Please wait…" : "Sign in"}</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.muted}>No account? </Text>
          <Link href="/(auth)/sign-up">
            <Text style={styles.link}>Sign up</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.cream },
  keyboard: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
    color: "#171717",
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 16,
    textAlign: "center",
    color: "#737373",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { color: "#b91c1c", marginTop: -4 },
  cta: {
    marginTop: 8,
    backgroundColor: palette.headerRed,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.65 },
  ctaLabel: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: { paddingVertical: 12, alignItems: "center" },
  secondaryLabel: {
    fontSize: 15,
    color: "#737373",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    flexWrap: "wrap",
    gap: 4,
  },
  muted: { color: "#737373", fontSize: 15 },
  link: {
    fontSize: 15,
    color: palette.headerRed,
    fontWeight: "700",
  },
});
