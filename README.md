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
#Project Name: FitAi



A high-performance, commercially viable web system / cross-platform mobile application architected to solve automated athletic scheduling. Developed with a strict focus on rapid deployment pipelines, secure data handling, and fluid user experiences.

---

## 📱 App Previews & Production Layouts

| Main Dashboard / UI | Core Feature / Flow | System Settings / Database Interaction |
| --- | --- |---|
| <img  width="237" height="500" alt="Pinnochios-Homepage" src="https://github.com/user-attachments/assets/05c77e22-3c0a-421d-bee6-175b736d3fc0" /> | <img  width="237" height="500" alt="Selection-Page" src="https://github.com/user-attachments/assets/ff645ff0-29db-4d61-9b33-5caa0f178b46" /> | <img  width="237" height="500" alt="Pinnochios-stripe-payment" src="https://github.com/user-attachments/assets/ccd10bd8-6730-48ee-984b-cdab870cd53d" />


| 
| Backend Dashboard / UI | Core Feature / Flow | System Settings / Database Interaction |  
| --- | --- |---|
|

 

*💡 **Live Deployment:** [👉 Click here to view the live web preview / Expo layout](https://your-deployment-link.com)*

---

## 💼 Commercial Value & Core Use Case

As a developer with nearly a decade of retail operations and commercial management experience, this application was built with business logic at the forefront:

*   **Monetization Ready:** Features a secure, multi-tiered infrastructure handling [webhooks / Stripe subscription pipelines / Clerk role-based access management].
*   **User Retention:** Implements lightweight, global state synchronization using [Zustand / React Context] ensuring sub-100ms UI latency to prevent bounce rates.
*   **Data Integrity:** Fully relational [Supabase / PostgreSQL] schema structured with strict row-level security (RLS) policies to handle live user data securely.

---

## ⚡ AI Velocity & Workflow

This project highlights a modern, highly efficient development lifecycle utilizing **AI-augmented pair programming (Cursor)**:
*   Leveraged specialized LLM context prompts to accelerate the prototyping phase of the [database/geospatial API mapping] layer by an estimated 40%.
*   Maintained absolute engineering control over code quality by enforcing modular component structures, dry utility files, and explicit TypeScript declarations.

---

## 🛠 Tech Stack & Architecture

### Frontend & Core Interface
*   **Framework:** [React 19 / Next.js 15 / React Native via Expo]
*   **Type Safety:** TypeScript (Strict Null Checks)
*   **Styling:** Tailwind CSS / NativeWind

### Backend & Infrastructure
*   **Database & Auth:** Supabase (PostgreSQL), [Clerk Auth / NextAuth]
*   **State Management:** [Zustand / React Query]
*   **Third-Party APIs:** [Mapbox API / OpenAI API / Stripe Webhooks]

---

## 🚀 Technical Setup & Installation

Follow these steps to clone and run the application locally in a development environment.

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   Node.js (v18 or higher)
*   npm or yarn
*   [For Mobile Projects]: Expo Go app installed on your physical device, or an Android/iOS simulator configured via Android Studio / Xcode.
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

## Run everything with Turborepo (optional)

From the repo root (**`Pizza-Ai/`**), one command starts **backend + customer app + admin** in parallel (same processes as opening three terminals):

```bash
npm run dev
```

This runs **`turbo run dev`** across workspaces. Each **`dev`** script is **persistent**, so Convex, Expo, and Next all stay running.

| Workspace | `npm run dev` runs |
|-----------|---------------------|
| **`backend`** | `convex dev` |
| **`apps/frontend`** | `expo start` (Metro — press **`w`** for web, etc.) |
| **`apps/admin`** | `next dev --port 3001` → [http://localhost:3001](http://localhost:3001) |

You still need the **env files** and Convex deployment pairing described above; Turborepo only orchestrates the processes.

**Tips:** Logs from three servers are mixed in one terminal — use **Run locally** above (three separate terminals) if that’s harder to follow. Convex must already be **`npx convex` logged in / linked** the same way as when you run **`cd backend && npm run dev`** alone.

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
