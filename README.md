# 🤖 AgentQA — Autonomous AI Testing & QA Automation Agent

<div align="center">

![AgentQA Banner](https://img.shields.io/badge/AgentQA-Autonomous_AI_Testing-6366f1?style=for-the-badge&logo=probot&logoColor=white)

**An intelligent end-to-end testing platform powered by Google Gemini AI and Playwright that automatically generates, runs, debugs, and reports web application test cases.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-testing-automation-agent-seven.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Automated_Testing-green?style=flat-square&logo=playwright)](https://playwright.dev/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00e599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-Authentication-6c47ff?style=flat-square)](https://clerk.com/)

[Explore Live Demo](https://ai-testing-automation-agent-seven.vercel.app) · [Report Bug](https://github.com/KishanTiwari96/ai-testing-automation-agent/issues) · [Request Feature](https://github.com/KishanTiwari96/ai-testing-automation-agent/issues)

</div>

---

## 🌟 Overview

**AgentQA** bridges the gap between AI code generation and reliable QA validation. It connects directly to your GitHub repositories, analyzes the codebase structure, and leverages **Google Gemini 2.5 Flash** to automatically generate comprehensive end-to-end test plans. 

Tests are executed using a **real Playwright browser engine** (with automated cloud fallback), performing smart dynamic form filling, deep UI assertions, visual error snapshotting, and detailed telemetry.

---

## ✨ Key Features

- 🧠 **AI-Powered Test Generation**
  - Analyzes repository source code, routes, and components to synthesize realistic test scenarios.
  - Generates step-by-step instructions, input payloads, and expected outcomes automatically.

- 🎭 **Real Playwright Automation Engine**
  - Runs tests inside authentic Chromium instances (local browser + Browserbase cloud fallback).
  - Smart field discovery: Automatically locates and fills `Name`, `Email`, `Password`, `Checkboxes`, and `Submit` buttons without hardcoded selectors.

- 🎯 **Strict & Accurate Assertions (Zero False-Passes)**
  - Detects failed authentications (error toasts, alerts, and uncompleted redirects).
  - Validates catalog/category views against empty states, stuck skeleton loaders, and API 500/404 failures.
  - Distinguishes between sidebar filter menus and real product listings.

- 📸 **Visual Snapshots & Execution Telemetry**
  - Captures full-page screenshots at the point of failure.
  - Detailed step-by-step logs with execution timestamps and failure reason diagnosis.

- 🛠️ **Interactive Test Suite Management**
  - Full CRUD operations: Create, View, Edit, and Delete test cases on the fly.
  - Single-click re-runs and historical test run timelines.

- 🔗 **GitHub Repository Integration**
  - Seamless GitHub OAuth connectivity to browse personal/organizational repositories.
  - Explores project file trees directly from the workspace.

- 🔐 **Secure Multi-Tenant SaaS Architecture**
  - User authentication powered by **Clerk**.
  - Serverless PostgreSQL with **Neon** and **Drizzle ORM**.
  - Subscription management with **Stripe**.

---

## 🏗️ Architecture & Workflow

```mermaid
flowchart TD
    A[User / Developer] -->|1. Connects GitHub & Selects Repo| B(AgentQA Workspace)
    B -->|2. Scans Codebase Tree| C[Google Gemini 2.5 Flash]
    C -->|3. Synthesizes Test Scenarios| D[Neon PostgreSQL / Drizzle]
    
    B -->|4. Trigger Test Run| E[Playwright Execution Engine]
    E -->|Chromium / Browserbase| F[Target Web Application]
    
    F -->|Telemetry, Screenshots & Status| E
    E -->|Smart Assertions: Auth, Errors, Skeletons| G{Pass / Fail?}
    
    G -->|Pass| H[Log Success & Record Metrics]
    G -->|Fail| I[Capture Failure Screenshot & Root Cause]
    
    H --> J[Test Run Summary & History]
    I --> J
    J --> A
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Lucide Icons, Shadcn UI Components |
| **AI / LLM** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Automation** | Playwright Chromium, Browserbase Cloud Execution |
| **Database** | Neon Serverless PostgreSQL, Drizzle ORM |
| **Authentication** | Clerk Auth, GitHub OAuth App |
| **Payments** | Stripe Payments & Webhooks |
| **Deployment** | Vercel Serverless Platform |

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: `v18.18+` or `v20+`
- **npm** / **pnpm** / **yarn**
- **Git**
- Accounts for: [Clerk](https://clerk.com), [Neon Postgres](https://neon.tech), [Google AI Studio](https://aistudio.google.com), [GitHub Developer](https://github.com/settings/developers)

### 2. Clone the Repository

```bash
git clone https://github.com/KishanTiwari96/ai-testing-automation-agent.git
cd ai-testing-automation-agent
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Neon Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# GitHub OAuth Integration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URL=http://localhost:3000/api/github/callback

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# Optional: Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Browserbase (Cloud Browser Fallback)
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...
```

### 5. Push Database Schema

```bash
npm run db:push
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure

```
ai-testing-automation-agent/
├── app/
│   ├── (auth)/             # Clerk Sign-In & Sign-Up routes
│   ├── api/                # API Endpoints
│   │   ├── github/         # OAuth & Repo inspection endpoints
│   │   ├── run-test/       # Playwright test execution API
│   │   ├── test-cases/     # Test case management (CRUD)
│   │   └── user-repo/      # User repository bindings
│   ├── project/[id]/       # Project detail & test runner dashboard
│   ├── workspace/          # Main user workspace
│   ├── layout.tsx          # Root app layout
│   └── page.tsx            # Landing page
├── components/
│   ├── custom/             # AgentQA UI components (Cards, Modals, Headers)
│   └── ui/                 # Shadcn base primitives
├── db/
│   ├── schema.ts           # Drizzle database tables & relations
│   └── index.ts            # Neon DB client connection
├── lib/
│   ├── test-runner.ts      # Core Playwright & assertion engine
│   └── stripe.ts           # Stripe client setup
└── public/                 # Assets and AgentQA logos
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">
  <sub>Built with ❤️ by Kishan Tiwari</sub>
</div>
