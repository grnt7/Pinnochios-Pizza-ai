# Pinnochios Pizza (Expo)

[Stack: Next.js / React Native](#-tech-stack--architecture)
[Workflow: AI-Augmented](#-ai-velocity--workflow)

A high-performance, commercially viable [web system / cross-platform mobile application] architected to solve [specific market problem, e.g., real-time real estate analytics / automated athletic scheduling]. Developed with a strict focus on rapid deployment pipelines, secure data handling, and fluid user experiences.

---


## 📱 App Previews & Production Layouts


| Main Dashboard / UI | Core Feature / Flow | System Settings / Database Interaction |
| ------------------- | ------------------- | -------------------------------------- |
|                     |                     |                                        |


*💡 **Live Deployment:** [👉 Click here to view the live web preview / Expo layout](https://your-deployment-link.com)*

---



## 💼 Commercial Value & Core Use Case

As a developer with nearly a decade of retail operations and commercial management experience, this application was built with business logic at the forefront:

- **Monetization Ready:** Features a secure, multi-tiered infrastructure handling [webhooks / Stripe subscription pipelines / Clerk role-based access management].
- **User Retention:** Implements lightweight, global state synchronization using [Zustand / React Context] ensuring sub-100ms UI latency to prevent bounce rates.
- **Data Integrity:** Fully relational [Supabase / PostgreSQL] schema structured with strict row-level security (RLS) policies to handle live user data securely.

---



## ⚡ AI Velocity & Workflow

This project highlights a modern, highly efficient development lifecycle utilizing **AI-augmented pair programming (Cursor)**:

- Leveraged specialized LLM context prompts to accelerate the prototyping phase of the [database/geospatial API mapping] layer by an estimated 40%.
- Maintained absolute engineering control over code quality by enforcing modular component structures, dry utility files, and explicit TypeScript declarations.

---



## 🛠 Tech Stack & Architecture



### Frontend & Core Interface

- **Framework:** [React 19 / Next.js 15 / React Native via Expo]
- **Type Safety:** TypeScript (Strict Null Checks)
- **Styling:** Tailwind CSS / NativeWind



### Backend & Infrastructure

- **Database & Auth:** Supabase (PostgreSQL), [Clerk Auth / NextAuth]
- **State Management:** [Zustand / React Query]
- **Third-Party APIs:** [Mapbox API / OpenAI API / Stripe Webhooks]

---



## 🚀 Technical Setup & Installation

Follow these steps to clone and run the application locally in a development environment.

### 1. Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v18 or higher)
- npm or yarn
- [For Mobile Projects]: Expo Go app installed on your physical device, or an Android/iOS simulator configured via Android Studio / Xcode.



### 2. Clone the Repository

```bash
git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)

cd your-repo-name

Customer mobile app in the monorepo (`apps/frontend`). Kitchen/admin UI is separate (**`apps/admin`**, Next); set **`EXPO_PUBLIC_ADMIN_URL`** in **`apps/frontend/.env`** so Clerk **`role: admin`** users get a Profile shortcut to open that URL.

## Prerequisites

Install dependencies from the **repository root** (npm workspaces hoist shared packages):

```bash
npm install
```

## Run on Android

```bash
cd apps/frontend
npm run android
```

This builds the native Android project (`expo run:android` with `expo-dev-client`). You need Android Studio / SDK and either an emulator or a device with USB debugging.

**Android Studio:** open the Gradle project folder `apps/frontend/android` (not the monorepo root). Autolinking uses the Expo JS root from `settings.gradle`; if Gradle still picks up stale paths after you move the repo, delete `android/build/generated/autolinking/` and sync/build again.

Start Metro only:

```bash
npm run dev
```

## Windows / Android native build (MAX_PATH)

Typical Gradle log:

```text
> Task :app:buildCMakeDebug[arm64-v8a] FAILED
ninja: error: Stat(... RNCSafeAreaViewShadowNode.cpp.o): Filename longer than 260 characters
```

CMake may also warn about `CMAKE_OBJECT_PATH_MAX` **(~250)** — same class of problem while building under **long paths** such as OneDrive `…\Pizza-Ai\…` plus New Architecture codegen.

**Check your machine** (from `apps/frontend`):

```bash
npm run android:path-check
```

**Verify OS long-path support**:

```powershell
reg query HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled
```

`0x1` means enabled. If missing or `0x0`, set it (Administrator PowerShell) as below, **reboot or sign out**, delete `android\app\.cxx` and `android\build`, then rebuild.

Prefer **not using OneDrive as the repo root for native Android** (sync/virtualization compounds pain); a clone under `C:\dev\…` often fixes this even without registry edits.

Shrinking paths or enabling long-path support fixes this reliably (`newArchEnabled=false` **is ignored on React Native 0.82+**, so you cannot disable New Arch to escape long paths.)

### 1. Enable Windows long paths (recommended)

Run **PowerShell as Administrator**:

```powershell
New-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name 'LongPathsEnabled' -Value 1 -PropertyType DWORD -Force
```

Sign out or reboot, then **delete CMake outputs** so the next build is clean:

```powershell
cd apps\frontend
Remove-Item -Recurse -Force android\app\.cxx,android\build,android\.gradle -ErrorAction SilentlyContinue
```

Run `npm run android` again.

### 2. Use a shorter project path

Move or clone the repo to something shallow, e.g. `C:\dev\Pizza-Ai`, **not** a long OneDrive tree. CMake paths embed the full path to `node_modules`, so shorter roots help a lot.

### 3. Build from a virtual drive (`subst`)

Map the repo root to a single-letter path before building:

```bat
subst P: "C:\Users\<you>\<full>\<path>\Pizza-Ai"
cd /d P:\apps\frontend
npm run android
```

Use `subst P: /d` later to remove the mapping.

---

## Stripe (native)

`app.json` configures the Stripe config plugin with a placeholder `merchantIdentifier` for Apple Pay. Replace `merchant.pinnochiospizza` with your **real** Apple Merchant ID before shipping iOS; Google Pay toggle is configured for Android builds.

---

## Functional app shell (tutorial-inspired)

Inspired by workflows like *[Let’s Vibe Code a Pizza Delivery App with AI — Ep 5](https://www.youtube.com/watch?v=0xktM8p-gTA)* (Sonny Sangha / Expo / Clerk):

- **Clerk**: email/password sign-in and sign-up (with optional email verification code screen).
- **Convex**: seeded **menu** (`pizzas` table via `seedDemoMenu` when empty).
- **Cart**: client-side cart with tab badge; **checkout** uses Stripe (Payment Sheet on native, Stripe Checkout redirect on web) with shared server-side cart validation. A legacy **manual** “pay at delivery” mutation exists for dev; set Convex `ALLOW_UNPAID_ORDERS=false` to disable it in production (`PINNOCHIOS_OPS.md`).

**Note:** Ep 5 also discusses a CMS; this repo loads the menu from **Convex** so it stays in sync with your deployment without wiring Sanity separately.

**Kitchen admin:** store staff runs the separate Next app `apps/admin` (dev: `npm run dev` → `http://localhost:3001`). In Expo, admins with Clerk `publicMetadata.role: "admin"` see **Kitchen dashboard** on **Profile** when `EXPO_PUBLIC_ADMIN_URL` is set in `apps/frontend/.env` (restart Metro with `npx expo start --clear`). If Clerk metadata changes in the dashboard, refresh the session (sign out/in) so `useUser` picks it up.

**If Profile still shows the dev hint “Set EXPO_PUBLIC_ADMIN_URL…”:** (1) stop Metro and restart with `--clear`; (2) confirm `apps/frontend/.env` sits next to `app.config.js` / `app.json`; (3) do **not** set `EXPO_NO_DOTENV=1` or `EXPO_NO_CLIENT_ENV_VARS=1` in your shell (they disable Expo’s `.env` load / client serialization); (4) on **Android Emulator** use `http://10.0.2.2:3001`, not `localhost`. Config `app.config.js` loads `@expo/env` from this package root and mirrors the URL into `expo.extra` as a fallback for `expo-constants`.