# NAWI Type Evaluation Report System — Architecture Specification

> **Smart India Hackathon 2026** — Problem Statement ID 26035  
> **Organization:** Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India.  
> **Standard:** OIML R 76-1:2006 & OIML R 76-2:1993  

---

## 1. High-Level System Architecture

The application is architected as an offline-first, client-side, zero-latency Web Application built with Vite, React 18, Strict TypeScript, and Tailwind CSS. It features a completely decoupled rules engine with zero UI dependencies, versioned JSON rule sets, dual-layer persistence (automatic local storage/IndexedDB mock mode with optional Supabase backend), and cryptographic SHA-256 document verification.

```mermaid
flowchart TD
    subgraph UI ["Presentation Layer (React + Tailwind CSS)"]
        Landing["Landing Page (DoCA Portal)"]
        Dashboard["Analytics Dashboard"]
        Wizard["17-Module Test Evaluation Wizard"]
        Repo["Searchable Report Repository"]
        CertModule["OIML Certificate & Variant Manager"]
        AdminRules["Rule Set Manager"]
        PublicVerify["Public Cryptographic Verification Portal"]
    end

    subgraph CoreEngine ["Pure TypeScript Calculation & Compliance Engine (Zero UI Deps)"]
        MPE["mpe.ts (Table 6 MPE Lookup & e-division bounds)"]
        TableVal["tableValidation.ts (Table 3 & Table 4 Validation)"]
        AppEngine["applicability.ts (Class-based Module Applicability)"]
        CalcEngine["calculations.ts (E, Ec, P, Creep, Repeatability, Temp, Span)"]
        DecimalLib["decimal.js (Arbitrary-Precision Arithmetic)"]
    end

    subgraph RuleSets ["Versioned Metrological Rule Sets"]
        R76_2006["oiml-r76-1-2006.json (Statutory Numeric Limits)"]
        CustomJSON["Custom National Ruleset (Admin Imported)"]
    end

    subgraph DataLayer ["Persistence & Auth Abstraction"]
        AuthCtx["AuthContext & Role Guard (5 Metrological Roles)"]
        MockDB["IndexedDB / LocalStorage Mock Mode (Zero Setup Demo)"]
        SupaDB["Supabase Postgres with Row Level Security (Production)"]
    end

    subgraph OutputEngines ["Document & Verification Generation"]
        PDFGen["Standardized R 76-2 Layout Exporter"]
        DOCXGen["Editable DOCX Model Exporter"]
        CryptoSubtle["Web Crypto API (SHA-256 Canonical Hashing)"]
    end

    UI --> CoreEngine
    CoreEngine --> RuleSets
    CoreEngine --> DecimalLib
    UI --> DataLayer
    UI --> OutputEngines
    DataLayer --> CryptoSubtle
```

---

## 2. Entity-Relationship Data Model

The data layer models every metrological pattern evaluation, instrument variation, test result, and statutory certificate under OIML R 76.

```mermaid
erDiagram
    LAB ||--o{ INSTRUMENT : registers
    LAB ||--o{ REPORT : conducts
    USER ||--o{ REPORT : creates
    INSTRUMENT ||--o{ REPORT : evaluated_in
    REPORT ||--o{ TEST_MODULE_RESULT : contains
    REPORT ||--o{ REFERENCE_STANDARD : employs
    REPORT ||--o{ AUDIT_LOG_ENTRY : logs
    REPORT ||--o| CERTIFICATE : results_in
    CERTIFICATE ||--o{ CERTIFICATE_VARIANT : encompasses
    CERTIFICATE ||--o{ CERTIFICATE_REVISION : versioned_by

    LAB {
        string id PK
        string name
        string accreditationNo
        string address
        string contactEmail
    }

    USER {
        string id PK
        string email
        string name
        string role
        string labId FK
    }

    INSTRUMENT {
        string id PK
        string manufacturer
        string applicant
        string model
        string type_designation
        string serial_no
        string accuracy_class
        float max_capacity
        float min_capacity
        float e
        float d
        int n
        float tare_capacity
        float temp_min
        float temp_max
        string power_supply
    }

    REPORT {
        string id PK
        string reportNo
        string instrumentId FK
        string labId FK
        string createdBy FK
        string status
        string rulesetVersion
        boolean overallPass
        string remarks
        string reportHash
        timestamp createdAt
    }

    TEST_MODULE_RESULT {
        string id PK
        string reportId FK
        string moduleId
        string moduleName
        string status
        boolean pass
        json rows
        json computedValues
        string remarks
    }

    CERTIFICATE {
        string id PK
        string certNo
        string scheme
        int edition
        string typeDesignation
        string applicant
        string manufacturer
        string reportRef FK
        string status
        date issueDate
    }

    CERTIFICATE_VARIANT {
        string id PK
        string certificateId FK
        string variantId
        string accuracyClass
        string minRange
        string maxRange
        string eRange
        string dRange
        int nMax
        string tare
        string panSize
    }

    CERTIFICATE_REVISION {
        int rev PK
        string certificateId FK
        date revDate
        string description
    }
```

---

## 3. Rules Engine Architecture

The rules engine resides in `/src/engine` and is strictly decoupled from the UI:
1. **Decimal-Safe Arithmetic:** Floating point issues (e.g. `0.1 + 0.2 !== 0.3`) are prohibited. All divisions, subtractions, and comparisons in scale interval units $e$ and $d$ are evaluated using `decimal.js` with 20 decimal places of precision.
2. **Versioned Rule Sets:** Numeric parameters (Table 3 $n_{min}, n_{max}$, Table 6 MPE limits, voltage thresholds, tilt bounds, creep tolerances) are loaded from `/src/rulesets/oiml-r76-1-2006.json`. No hardcoded statutory limits exist in component code.
3. **Zod Schema Validation:** New rulesets uploaded by administrators are validated at runtime against `RulesetSchema` before activation.
4. **Tri-State Verdict Logic:** Tests compute a tri-state outcome: `Passed`, `Failed`, or `Not Applicable` (with statutory justification). An overall report cannot be approved if any applicable test fails or remains unverified.
