# Shiftwell Certificate Validation Prototype

> **Healthcare Shift-Scheduling SaaS Case Study: CarePoint Clinics**  
> *Automated Professional Credential Enforcement for Multi-Location Clinical Operations in India*

---

## 1. Executive Summary & Problem Context

This repository contains an interactive single-page web prototype for **Shiftwell**, a healthcare workforce scheduling SaaS product used by multi-location clinic chains in India.

### Case Study Background (CarePoint Clinics)
- **Account Scale:** 40 outpatient and urgent care clinic locations across India.
- **Commercial Impact:** ₹60 Lakh Annual Recurring Revenue (ARR) with Shiftwell.
- **Contract Milestone:** Renewal due in **December 2026**.
- **Audit Incident:** A prior clinical audit discovered **two shifts covered by nurses with expired Basic Life Support (BLS) certificates**, creating legal liability, regulatory exposure, and clinical risk.
- **Root Cause & Workaround:** The clinic manager tracked credential expiry dates in an Excel spreadsheet and manually checked them during scheduling and swap approvals. When approvals occurred in fast-paced operational conditions, non-compliant staff slipped through.
- **Product Hypothesis:** Validating mandatory credentials automatically during shift allocation and swap approval eliminates reliance on error-prone manual spreadsheets and guarantees zero assignments to non-compliant staff.
- **Engineering Effort:** Approximately 1 Sprint (~2 weeks).

> [!NOTE]
> **Prototype Scope Disclaimer:** This prototype models automated frontend validation logic for a Product Manager internship case study. It does not claim that software validation alone guarantees regulatory compliance or eliminates all clinical staffing risks without strict offline document verification and audit governance.

---

## 2. Key Features

- **Automated Credential Engine:**
  - Evaluates compliance against a fixed demo date: **18 October 2026 (`2026-10-18`)**.
  - Enforces mandatory credentials for the **Nurse** role:
    1. **Basic Life Support (BLS) Certificate**
    2. **State Nursing Council Registration**
  - Flags credentials as **Expired**, **Missing**, or **Pending Verification**.
- **Zero Stale State & No-Override Enforcement:**
  - Dynamically revalidates whenever candidate staff, shift date, or role changes.
  - Manager overrides are intentionally omitted to maintain strict clinical compliance.
- **Shared Workflow for Scheduling & Peer Swaps:**
  - Enforces the same mandatory rules whether scheduling an open shift or approving a peer shift swap.
- **Staff Credential Registry with Simulation Drawer:**
  - Searchable, filterable staff roster (*All, Valid, Expired, Missing, Unverified*).
  - Slide-over drawer with simulated credential updates to model certificate renewals and audits.
- **Simulated Validation Audit Trail:**
  - Chronological activity log capturing both approved assignments and blocked validation attempts with full diagnostic failure reasons.
- **1-Click Acceptance Test Presets:**
  - Top banner with dedicated runners for all 8 mandatory acceptance test scenarios.

---

## 3. Technology Stack

- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Build Tool:** Vite 8
- **Architecture:** Pure functional validation engine ([`src/utils/validationEngine.ts`](src/utils/validationEngine.ts)) decoupled from presentation components.

---

## 4. Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Local Run
```bash
# Clone the repository
git clone <repository-url>
cd "HugoHub Case Study"

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 5. Acceptance Test Matrix

| Test ID | Candidate & Scenario | Action | Expected Verdict |
| :---: | :--- | :--- | :---: |
| **T1** | **Ananya Deshmukh** (Valid BLS & Reg) | Schedule Shift | **PASS:** Eligible for Assignment; Confirmation enabled |
| **T2** | **Rohan Patil** (BLS expired 30 Sep 2026) | Schedule Shift | **BLOCK:** Assignment blocked; Explains BLS expired; Confirmation disabled |
| **T3** | **Meera Shah** (Registration expired 30 Sep 2026) | Schedule Shift | **BLOCK:** Assignment blocked; Explains Council Reg expired; Confirmation disabled |
| **T4** | **Kavya Joshi** (BLS missing) | Schedule Shift | **BLOCK:** Missing mandatory credential blocks assignment |
| **T5** | **Swap Approval** (Rohan Patil) | Approve Shift Swap | **BLOCK:** Same mandatory rules applied; cannot bypass via swap |
| **T6** | **Changed Selection** (Ananya $\rightarrow$ Rohan) | Dynamic Switch | **PASS $\rightarrow$ BLOCK:** Previous success clears immediately without stale state |
| **T7** | **Unverified Credential** (Priya Nair) | Schedule Shift | **BLOCK:** Unverified credential blocked until manager reviews |
| **T8** | **Audit Trail Verification** | Activity Log Review | **PASS:** Both approved and blocked attempts appear with timestamps |

---

## 6. Project Structure

```
.
├── src/
│   ├── types/
│   │   └── index.ts                 # TypeScript types (Staff, Credentials, Validation, ActivityLog)
│   ├── data/
│   │   └── mockData.ts              # Mock staff, clinics, and initial audit logs
│   ├── utils/
│   │   └── validationEngine.ts      # Pure business logic validation engine
│   ├── components/
│   │   ├── Header.tsx               # Top navigation, clinic switcher, demo badges
│   │   ├── Overview.tsx             # Executive operations dashboard with 4 KPI cards
│   │   ├── StaffCredentials.tsx     # Staff table, status filters, slide-over detail/simulation drawer
│   │   ├── ShiftAssignment.tsx      # 4-step workflow, live validation card, test presets
│   │   ├── ValidationActivity.tsx   # Filterable audit trail table
│   │   ├── CaseStudyModal.tsx       # Business context modal (₹60L ARR, 40 clinics, hypothesis)
│   │   └── AcceptanceTestModal.tsx  # Full acceptance test suite runner
│   ├── App.tsx                      # Root component orchestrating application state
│   ├── index.css                    # Tailwind CSS v4 design tokens
│   └── main.tsx                     # Entry point
├── index.html                       # HTML template with Inter typography
└── package.json
```

---

## 7. License

Built for demonstration and educational case-study purposes.
