# NAWI Type Evaluation Report System (OIML R 76)

> **Smart India Hackathon 2026 — Problem Statement ID 26035**  
> **Title:** Development of a Software Program/Application for Generation of Test Reports for Non-Automatic Weighing Instruments (NAWI) as per OIML Recommendation R 76  
> **Organization:** Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India.  

---

## 🌟 Overview

The **NAWI Type Evaluation Report System** is an enterprise-grade legal metrology web application built specifically for Indian and international weights and measures testing laboratories. It standardizes the pattern evaluation of Non-Automatic Weighing Instruments (NAWI) strictly in conformance with:
1. **OIML Recommendation R 76-1:2006 (E)** — Metrological and technical requirements; test procedures.
2. **OIML Recommendation R 76-2:1993 (E)** — Standard "Pattern Evaluation Report" form.
3. **Legal Metrology Act, 2009** & **Legal Metrology (General) Rules, 2011**.

The system automates the calculation of errors ($P, E, E_c$), evaluates Maximum Permissible Error (MPE) thresholds according to Table 6, executes Table 3 and Table 4 compatibility checks, enforces test applicability rules across all 4 accuracy classes (Class I, II, III, and IIII), and generates standardized evaluation reports and OIML type approval certificates.

---

## 🚀 Key Features

- **Decoupled TypeScript Rules Engine:** Zero UI dependencies. Evaluates all scale division calculations with arbitrary-precision arithmetic using `decimal.js`.
- **Versioned JSON Rulesets:** All statutory numeric limits (MPE factors, $n$ limits, temperature defaults, voltage tolerances) are defined in versioned JSON (`oiml-r76-1-2006.json`) with an interactive admin validator.
- **17-Module Test Evaluation Wizard:** Follows OIML R 76-2 section order with auto-computed parameters, equipment traceability warnings, and live error verification.
- **Tri-State Verdict & Pass/Fail Engine:** Tri-state outcome (`Passed`, `Failed`, or `Not Applicable` with statutory rationale) per row, per module, and for overall pattern certification.
- **Searchable Repository & Instrument History:** Multi-attribute filtering, date range queries, pagination, and CSV export, with chronological test timelines for each physical instrument.
- **5-Tier Role-Based Workflow:** `Draft` ➔ `Submitted` ➔ `Under Review` ➔ `Approved` / `Rejected` with immutable audit log.
- **OIML Certificate of Conformity Module:** Generates full Type Approval certificates featuring a 14-variant matrix (-A to -N) in 3-column layout, multi-revision history, and official disclaimers.
- **Public Cryptographic Verification:** Instant SHA-256 hash lookup and document validation without login at `/verify`.
- **Zero-Setup Mock Mode:** Fully functional offline out of the box using IndexedDB / LocalStorage, with optional production Supabase backend.

---

## 🔑 Demo Credentials

The application includes pre-configured demo accounts for all statutory roles (click "Use" on `/login` to auto-fill):

| Role | Email Address | Password | Permissions & Responsibilities |
|---|---|---|---|
| **Admin** | `admin@nawi.gov.in` | `Admin@123` | Full system access: manage users, import rule sets, system configuration |
| **Technician** | `technician@nawi.gov.in` | `Tech@123` | Enter instrument parameters, log observations, create & edit draft reports |
| **Reviewer** | `reviewer@nawi.gov.in` | `Review@123` | Peer review submitted evaluation data, check calibrations, audit tests |
| **Approver** | `approver@nawi.gov.in` | `Approve@123` | Final pattern evaluation approval, reject with feedback, issue OIML certificates |
| **Viewer** | `viewer@nawi.gov.in` | `View@123` | Read-only inspection of approved evaluation reports and certified instruments |

---

## 🛠️ Technology Stack

- **Framework:** Vite + React 18 + TypeScript (strict mode)
- **Styling:** Tailwind CSS with official DoCA national theme (Navy, Saffron, Ashoka Green)
- **Routing:** React Router v6 with role-guarded lazy loading
- **Forms & Validation:** React Hook Form + Zod
- **Arithmetic Engine:** `decimal.js` (floating-point-safe metrological calculations)
- **Data & Auth:** Dual-mode architecture (Offline IndexedDB/LocalStorage mock mode + Supabase Postgres with RLS)
- **Charts:** Recharts (verdict distribution, evaluation trends, span stability plot)
- **Testing:** Vitest with 100% engine test coverage

---

## 💻 Quick Start & Local Development

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Run Local Development Server
```bash
# 1. Install dependencies
npm install

# 2. Run unit test suite
npm test

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Verification & Test Suite

The engine test suite verifies all critical metrological requirements:
```bash
# Run Vitest test runner
npm test

# Run TypeScript strict typecheck
npm run typecheck

# Run production build
npm run build
```

---

## 📦 Deployment Guide

### Deploying to Vercel
1. Push the repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. The build configuration is pre-configured via `vercel.json`:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy! The SPA rewrite rules will automatically handle client-side routing.

### Optional Supabase Integration
To connect a live Supabase database instead of the offline mock mode:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Create `.env` from `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Run the application; it will automatically detect the keys and connect to live Postgres with Row Level Security.

---

## 📖 Metrological Documentation

Comprehensive technical documentation is provided in `/docs`:
- **[Architecture & ER Diagram](docs/ARCHITECTURE.md)**
- **[Calculation Methodology & Worked Examples](docs/CALCULATIONS.md)**
- **[Requirements & Test Applicability Matrix](docs/COMPLIANCE_MATRIX.md)**
