# Pinnochio’s Pizza — Pizza-Ai Monorepo

Customer ordering (**Expo**), kitchen admin (**Next.js**), and shared **`Convex`** backend. Use **one** Convex deployment URL across all clients.

---

## Prerequisites

| Tool | Purpose |
|------|---------|
| **Node.js** (current LTS) + **npm** | Workspaces hoisted install at repo root |
| **[Convex CLI](https://docs.convex.dev/cli)** (`npx convex`) | Backend dev & deploy |
| **Clerk** app | Auth for Expo + Next (same instance everywhere) |
| **Android Studio** / **Xcode** | Native `expo run:android` / `expo run:ios` (optional if you only use web / simulators you already use) |

---

## Install dependencies

Run once from **`Pizza-Ai/`** (the monorepo root):

```bash
npm install
```

Workspaces pick up **`apps/*`** and **`backend`**.

---

## Environment files (quick checklist)

| Location | Purpose |
|----------|---------|
| **`backend/.env.local`** | Your Convex deployment (`CONVEX_DEPLOYMENT`), local CLI pairing — **never commit**. |
| **`apps/frontend/.env`** | `EXPO_PUBLIC_*` → Convex URL, Clerk publishable key, Stripe **publishable**, admin URL shortcut. Template: **`apps/frontend/.env.example`**. |
| **`apps/admin/.env.local`** | `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, plus **`CLERK_SECRET_KEY`** (and anything else **`@clerk/nextjs`** needs). Template: **`apps/admin/.env.example`**. |

**Convex dashboard** secrets (Stripe, Clerk JWT issuer domain, webhooks): see **`backend/convex/PINNOCHIOS_OPS.md`**.

Restart dev servers after changing client env vars. For Expo env issues: `npx expo start -c` from **`apps/frontend`**.

---

## Run locally (recommended layout)

Three processes are usually simplest: Convex, customer app, admin.

### 1. Convex backend

```bash
cd backend
npm run dev
# i.e. npx convex dev — keep this running during local dev
```

### 2. Customer app — Expo (`apps/frontend`)

```bash
cd apps/frontend
npm run dev
# Metro: scan QR / open iOS or Android simulator / press `w` for web
```

**Platform-specific:**

| Goal | Command |
|------|---------|
| Web browser | `npm run web` (or Metro → **`w`**) |
| Native dev client Android | `npm run android` |
| Native dev client iOS | `npm run ios` |

Stripe / native Payment Sheet and dev client quirks: **`apps/frontend/README.md`** (also **Android `MAX_PATH` / OneDrive** notes).

### 3. Admin dashboard (`apps/admin`) — port **3001**

```bash
cd apps/admin
npm run dev
# opens http://localhost:3001
```

Point **`apps/frontend/.env`** → **`EXPO_PUBLIC_ADMIN_URL`** at this URL (`http://localhost:3001` on desktop/simulator). For Android emulators use **`http://10.0.2.2:3001`** as noted in **`apps/frontend/.env.example`**.

---

## Turbo: dev all workspaces at once (optional)

From **`Pizza-Ai/`**:

```bash
npm run dev
# turbo run dev — starts Convex, Expo Metro, Next in parallel (no cache, persistent tasks)
```

If logs are noisy, use separate terminals instead.

---

## Other scripts

```bash
# Typecheck Convex functions (backend)
cd backend && npm run lint

# Frontend lint (Expo)
cd apps/frontend && npm run lint

# Production build — admin Next
cd apps/admin && npm run build && npm run start
```

---

## Deeper docs

| Doc | Covers |
|-----|--------|
| **`backend/convex/PINNOCHIOS_OPS.md`** | Shared Convex deployment, Clerk ↔ Convex, Stripe, webhooks, admin roles |
| **`apps/frontend/README.md`** | Android native builds, Windows long paths, Gradle |
| **`backend/convex/README.md`** | Generic Convex scaffold notes |

---

## Production notes (short)

1. Convex: deploy from **`backend`** with **`npx convex deploy`** (never commit secrets).
2. **Expo**: EAS/dev builds bake env at build time; align **`EXPO_PUBLIC_*`** with production Convex, Clerk, and Stripe publishable keys.
3. **Next admin**: set production **`NEXT_PUBLIC_*`** and deploy; update **`EXPO_PUBLIC_ADMIN_URL`** in the customer app to that HTTPS URL for the Profile “kitchen dashboard” shortcut.
