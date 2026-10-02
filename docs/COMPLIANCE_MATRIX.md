# Requirement Traceability & Test Applicability Matrix

> **SIH 2026 Problem Statement ID 26035:**  
> "Development of a Software Program/Application for Generation of Test Reports for Non-Automatic Weighing Instruments (NAWI) as per OIML Recommendation R 76"

---

## 1. Problem Statement Requirements Traceability

| PS Requirement | Solution Feature | Route / Module | Implementation File |
|---|---|---|---|
| **OIML R 76-1 Test Procedures & Limit Verification** | Pure TypeScript calculation engine with decimal-safe arithmetic | `/engine/*` | `src/engine/mpe.ts`, `src/engine/tableValidation.ts`, `src/engine/calculations.ts` |
| **Numeric Limits in Versioned JSON** | Version-controlled JSON rule sets with Zod schema verification | `/rulesets` | `src/rulesets/oiml-r76-1-2006.json`, `src/pages/admin/RulesetManagerPage.tsx` |
| **Standard R 76-2 Pattern Evaluation Report Order** | 17-Module Test Wizard with general info, test equipment, environment, and checklist | `/reports/new`, `/reports/:id` | `src/pages/reports/NewEvaluationPage.tsx`, `src/pages/reports/ReportDetailPage.tsx` |
| **Automated Error & MPE Calculation** | Automatic calculation of $P$, $E$, $E_c$, and Table 6 MPE with formula popover | Evaluation forms | `src/engine/calculations.ts`, `src/pages/reports/NewEvaluationPage.tsx` |
| **Tri-State Verdict & Pass/Fail Decisions** | Per-row, per-test, and overall tri-state verdict (Passed / Failed / Not Applicable) | Test review | `src/engine/applicability.ts`, `src/pages/reports/ReportDetailPage.tsx` |
| **Searchable Repository with History** | Multi-attribute search, filtering, pagination, and CSV export | `/repository`, `/instruments/:id/history` | `src/pages/repository/RepositoryPage.tsx`, `src/pages/instruments/InstrumentHistoryPage.tsx` |
| **Multi-Stage Workflow & Audit Trail** | Draft → Submitted → Reviewed → Approved / Rejected with immutable audit log | `/reports/:id` | `src/types/index.ts`, `src/pages/reports/ReportDetailPage.tsx` |
| **Role-Based Access Control** | 5 distinct metrological roles (Admin, Tech, Reviewer, Approver, Viewer) | Route guards | `src/contexts/AuthContext.tsx`, `src/components/auth/ProtectedRoute.tsx` |
| **DoCA / Ministry Visual Style** | Government portal theme, navy/saffron accents, emblem, statutory section | `/` (Landing) | `src/pages/LandingPage.tsx`, `src/index.css` |
| **OIML Type Approval Certificate** | Certificate generator with 14 variants (-A to -N), 3-col matrix, revision history | `/certificates`, `/certificates/:id` | `src/pages/certificates/CertificatesPage.tsx`, `src/pages/certificates/CertificateDetailPage.tsx` |
| **Public Authenticity Verification** | Cryptographic verification by certificate/report number and SHA-256 hash | `/verify` | `src/pages/public/VerifyPage.tsx` |
| **Zero-Setup Mock Mode & Supabase** | Works immediately out of the box with IndexedDB/LocalStorage mock mode | `/lib/*` | `src/lib/supabase.ts`, `src/lib/mockAuth.ts`, `src/data/mockDb.ts` |

---

## 2. Test Module Applicability Matrix by Accuracy Class

Per OIML R 76-1:2006 and R 76-2:1993:

| Section | Test Module | Class I | Class II | Class III | Class IIII | Statutory Justification |
|---|---|:---:|:---:|:---:|:---:|---|
| **1** | Weighing Performance | **M** | **M** | **M** | **M** | Mandatory for all classes (A.4.4, A.5.3.1) |
| **2** | Temperature Effect on Zero | **M** | **M** | **M** | **M** | Mandatory ($1e/1^\circ\text{C}$ for I; $1e/5^\circ\text{C}$ for II, III, IIII) |
| **3.1** | Eccentricity (Weights) | **M** | **M** | **M** | **M** | Mandatory ($1/3 (\text{Max} + \text{Tare})$) |
| **3.2** | Eccentricity (Rolling Load) | **O** | **O** | **O** | **O** | Applicable to vehicle/track platform scales |
| **4.1** | Discrimination (Digital) | **M** | **M** | **M** | **M** | Mandatory when $d \ge 5\text{ mg}$ (A.4.8.2) |
| **4.2** | Sensitivity | **N/A** | **N/A** | **N/A** | **N/A** | Mandatory only for non-self-indicating instruments |
| **5** | Repeatability | **M** | **M** | **M** | **M** | Mandatory ($50\%$ and $100\%$ Max; $\Delta P \le |\text{mpe}|$) |
| **6.1** | Zero Return | **N/A** | **M** | **M** | **M** | Excluded for Class I; required for II, III, IIII (A.4.11.2) |
| **6.2** | Creep Test | **N/A** | **M** | **M** | **M** | Excluded for Class I; required for II, III, IIII (A.4.11.1) |
| **7** | Stability of Equilibrium | **M** | **M** | **M** | **M** | Mandatory (A.4.12, 4.5.2, 4.6.3) |
| **8** | Tilting Test | **N/A** | **M** | **M** | **M** | Class I requires level indicator instead (A.5.1) |
| **9** | Tare Weighing Test | **Cond.** | **Cond.** | **Cond.** | **Cond.** | Mandatory if tare device is present; N/A otherwise |
| **10** | Warm-up Time | **Cond.** | **Cond.** | **Cond.** | **Cond.** | Mandatory for electronic instruments; N/A if mechanical |
| **11** | Voltage Variations | **Cond.** | **Cond.** | **Cond.** | **Cond.** | Mandatory for AC/DC mains and battery instruments |
| **12.1-4**| Electrical Disturbances (EMC) | **Cond.** | **Cond.** | **Cond.** | **Cond.** | Mandatory for electronic instruments |
| **13** | Damp Heat, Steady State | **N/A** | **Cond.** | **M** | **M** | Excluded for Class I; N/A for Class II if $e < 1\text{ g}$ |
| **14** | Span Stability | **N/A** | **M** | **M** | **M** | Excluded for Class I; mandatory for II, III, IIII (B.4) |
| **15** | Endurance Test | **N/A** | **Cond.** | **Cond.** | **Cond.** | Excluded for Class I; applicable only if $\text{Max} \le 100\text{ kg}$ |
| **16** | Examination of Construction | **M** | **M** | **M** | **M** | Mandatory visual and physical check |
| **17** | Statutory Checklist | **M** | **M** | **M** | **M** | Sections 17.1 (All), 17.2 (Retail only), 17.3 (Electronic) |

*Legend: **M** = Mandatory; **O** = Optional; **N/A** = Not Applicable; **Cond.** = Conditional on declared features.*
