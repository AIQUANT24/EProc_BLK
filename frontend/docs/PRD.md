# NMICOV — Product Requirements Document (PRD)

## Document Control

| Field          | Value                                |
| -------------- | ------------------------------------ |
| Document Title | NMICOV Product Requirements Document |
| Version        | 1.1                                  |
| Status         | MVP Complete                         |
| Last Updated   | 2026-03-09                           |

---

## 1. Product Overview

**NMICOV** (National Make-in-India Compliance & Origin Verification Ledger) is a national digital platform that provides component-level origin verification, automated DVA scoring, blockchain-audited compliance records, and AI-driven fraud detection for India's public procurement ecosystem.

### 1.1 Product Vision

> _"To become the trusted national compliance infrastructure that ensures every rupee of government procurement genuinely supports domestic manufacturing."_

### 1.2 Target Users

| User Persona                     | Description                               | Primary Goals                                                 |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------------------- |
| **Supplier / Manufacturer**      | Companies bidding on government contracts | Register products, declare BOMs, get compliance certification |
| **Procurement Officer**          | Government officials evaluating bids      | Verify supplier compliance, assess risk                       |
| **Auditor (CAG/Internal)**       | Compliance auditors                       | Audit procurement decisions, trace compliance records         |
| **Policy Administrator (DPIIT)** | PPP-MII policy team                       | Monitor compliance, simulate policy changes                   |
| **Platform Integrator (GeM)**    | Procurement platform teams                | Integrate compliance verification via API                     |

---

## 2. Feature Specifications

### 2.1 Supplier Portal

#### 2.1.1 Supplier Onboarding

**Priority:** P0 (MVP)

| Feature              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| Registration         | Self-service registration with GST, PAN, Udyam            |
| KYC Verification     | Automated verification against government databases       |
| Factory Registration | Register manufacturing facilities with location, capacity |
| Digital Identity     | Issue cryptographic keys for blockchain participation     |
| Profile Management   | Update supplier details, manufacturing capabilities       |

**Acceptance Criteria:**

- Supplier can register in < 10 minutes
- GST verification completes within 30 seconds
- Factory location validated against license registry
- Digital identity issued upon successful KYC

#### 2.1.2 Product Registration

**Priority:** P0 (MVP)

| Feature            | Description                                      |
| ------------------ | ------------------------------------------------ |
| Product Creation   | Register products with HSN code, category, specs |
| Compliance Mapping | Auto-map to PPP-MII sector rules                 |
| Version Management | Track product changes over time                  |
| Bulk Upload        | CSV/Excel upload for large catalogs              |

#### 2.1.3 BOM Declaration

**Priority:** P0 (MVP)

| Feature         | Description                                |
| --------------- | ------------------------------------------ |
| BOM Editor      | Visual BOM tree editor                     |
| Component Entry | Add components with origin, supplier, cost |
| Multi-tier BOM  | Support nested sub-assemblies              |
| BOM Import      | Upload from ERP exports (CSV/JSON/XML)     |
| Version Control | Track BOM changes with timestamps          |
| Cost Breakdown  | Visual cost allocation chart               |

#### 2.1.4 Compliance Status View

**Priority:** P0 (MVP)

| Feature                | Description                              |
| ---------------------- | ---------------------------------------- |
| DVA Score Display      | Real-time DVA calculation                |
| Classification Badge   | Class I / Class II / Non-Local indicator |
| Verification Status    | Component-level verification status      |
| Compliance Certificate | Downloadable compliance certificate      |
| History                | Historical compliance records            |

---

### 2.2 DVA Calculation Engine

**Priority:** P0 (MVP)

#### Core Algorithm

```
DVA% = (Σ Domestic Component Costs / Σ Total Component Costs) × 100
```

#### Features

| Feature            | Description                                      |
| ------------------ | ------------------------------------------------ |
| Auto-calculation   | Real-time DVA from BOM data                      |
| Sector Rules       | Apply sector-specific DVA rules                  |
| Confidence Scoring | Score based on verification depth (0-1)          |
| What-if Analysis   | Simulate DVA impact of component changes         |
| Audit Trail        | Every calculation logged with inputs and outputs |

#### Confidence Score Factors

| Factor                                  | Weight |
| --------------------------------------- | ------ |
| Component verified against customs data | 0.30   |
| Supplier GST verified                   | 0.20   |
| Manufacturing license confirmed         | 0.20   |
| Historical consistency                  | 0.15   |
| Third-party audit                       | 0.15   |

---

### 2.3 Supply Chain Verification Engine

**Priority:** P1 (Phase 2)

| Feature                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| Import Correlation        | Cross-reference with ICEGATE customs data      |
| GST Chain Analysis        | Trace component supply through GST invoices    |
| Manufacturer Verification | Verify component manufacturer registrations    |
| Origin Mismatch Detection | Flag discrepancies between claims and evidence |
| Verification Report       | Detailed per-component verification report     |

---

### 2.4 Fraud Detection Engine

#### Phase 1: Rule-Based (MVP)

| Rule ID | Rule                | Trigger                                         |
| ------- | ------------------- | ----------------------------------------------- |
| FR-01   | DVA Jump            | DVA changes > 15% between declarations          |
| FR-02   | Post-bid BOM Change | BOM modified after bid submission               |
| FR-03   | Import Mismatch     | Component claimed domestic, import record found |
| FR-04   | Cost Anomaly        | Component cost significantly below market rate  |
| FR-05   | Circular Supply     | Supplier and component supplier are same entity |

#### Phase 2: AI-Driven

| Model             | Purpose                  | Algorithm                  |
| ----------------- | ------------------------ | -------------------------- |
| Anomaly Detection | Unusual DVA patterns     | Isolation Forest           |
| Cost Manipulation | Inflated/deflated costs  | Bayesian Anomaly Detection |
| Network Analysis  | Collusive supplier rings | Graph Neural Networks      |
| Predictive Risk   | Future fraud probability | Gradient Boosted Trees     |

---

### 2.5 Blockchain Compliance Ledger

**Priority:** P0 (MVP — basic), P1 (full network)

#### On-Chain Records

| Record Type          | Data Stored                         |
| -------------------- | ----------------------------------- |
| Supplier Declaration | Hash of BOM + DVA declaration       |
| DVA Calculation      | Calculation result hash + timestamp |
| Verification Event   | Verification result hash            |
| Compliance Decision  | Compliance status hash              |
| Audit Event          | Auditor verification hash           |

#### Network Design

| Parameter       | Value                            |
| --------------- | -------------------------------- |
| Platform        | Hyperledger Fabric               |
| Consensus       | Raft (crash fault tolerant)      |
| Channels        | Per-sector compliance channels   |
| Smart Contracts | DVA validation, compliance rules |

#### Node Participants

| Organization         | Node Type        |
| -------------------- | ---------------- |
| DPIIT                | Orderer + Peer   |
| GeM                  | Peer             |
| CAG                  | Peer (audit)     |
| Sector Ministries    | Peer             |
| Independent Auditors | Peer (read-only) |

---

### 2.6 Procurement Verification API

**Priority:** P1 (Phase 2)

#### Endpoints

| Endpoint                       | Method | Description                                |
| ------------------------------ | ------ | ------------------------------------------ |
| `/api/v1/verify/supplier/{id}` | GET    | Verify supplier compliance status          |
| `/api/v1/verify/product/{id}`  | GET    | Verify product DVA and classification      |
| `/api/v1/verify/bid`           | POST   | Verify bid compliance (supplier + product) |
| `/api/v1/verify/batch`         | POST   | Batch verification for large tenders       |
| `/api/v1/certificate/{id}`     | GET    | Download compliance certificate            |

#### Response Schema

```json
{
  "supplier_id": "SUP-2026-00123",
  "product_id": "PRD-2026-00556",
  "dva_score": 58.3,
  "classification": "CLASS_I",
  "confidence_score": 0.87,
  "risk_score": 0.08,
  "compliance_status": "COMPLIANT",
  "verification_timestamp": "2026-03-06T10:30:00Z",
  "blockchain_tx_hash": "0xabc123...",
  "flags": [],
  "certificate_url": "/api/v1/certificate/CERT-2026-00789"
}
```

---

### 2.7 Compliance Dashboard

**Priority:** P0 (MVP — basic), P1 (full)

#### Dashboard Modules

| Module                | Users                | Features                                 |
| --------------------- | -------------------- | ---------------------------------------- |
| **Supplier Overview** | All                  | Registered suppliers, compliance rates   |
| **Product Registry**  | Procurement Officers | Product compliance status, search        |
| **DVA Analytics**     | Policy Admins        | Sector-wise DVA distribution, trends     |
| **Fraud Alerts**      | Officers, Auditors   | Active alerts, investigation queue       |
| **Supply Chain Map**  | Auditors             | Visual supply chain with risk indicators |
| **Verification Logs** | Auditors             | API call logs, verification history      |
| **Policy Simulator**  | Policy Admins        | DVA threshold impact analysis            |

---

### 2.8 National Component Registry

**Priority:** P2 (Phase 3)

| Feature                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| Component Database      | Verified domestic components                |
| Search & Discovery      | Find verified components by category        |
| Supplier Mapping        | Components linked to verified manufacturers |
| BOM Auto-fill           | Pre-populate BOMs with verified components  |
| Component Certification | Third-party verified origin                 |

---

## 3. Non-Functional Requirements

| Category           | Requirement                                       |
| ------------------ | ------------------------------------------------- |
| **Performance**    | API response < 2s; Dashboard load < 3s            |
| **Scalability**    | Support 100K suppliers, 1M products               |
| **Availability**   | 99.9% uptime                                      |
| **Security**       | PKI, encryption at rest/transit, RBAC             |
| **Data Residency** | All data within India                             |
| **Accessibility**  | WCAG 2.1 AA compliance                            |
| **Localization**   | Hindi + English; extensible to regional languages |
| **Audit**          | Complete audit trail for all operations           |

---

## 4. Release Plan

### MVP (Phase 1) — Weeks 1-2 COMPLETE

| Feature                                       | Status   |
| --------------------------------------------- | -------- |
| Supplier Portal (onboarding, product, BOM)    | Complete |
| DVA Calculation Engine                        | Complete |
| Basic Fraud Rules (6 rules)                   | Complete |
| Blockchain Ledger (simulation)                | Complete |
| Compliance Dashboard (analytics)              | Complete |
| Mock GeM API                                  | Complete |
| Role-based Authentication (5 roles)           | Complete |
| Supplier CRUD (Add/View/Edit/Delete)          | Complete |
| User CRUD (Invite/Edit/Delete)                | Complete |
| Advanced Pagination (20/50/100 rows)          | Complete |
| Date Range Filtering                          | Complete |
| CSV Export                                    | Complete |
| Audit Trail with Blockchain Explorer          | Complete |
| 50 Suppliers, 50 Products, 30 Users Mock Data | Complete |
| 42-Test Comprehensive Test Suite              | Complete |

### Phase 2 — Months 2-6 (Current)

| Feature                           | Status     |
| --------------------------------- | ---------- |
| Lovable Cloud Backend Integration | Enabled    |
| Real Authentication (Supabase)    | 🔄 Planned |
| Persistent Data Storage           | 🔄 Planned |
| BOM Import (CSV/Excel/XML)        | 🔄 Planned |
| PDF Compliance Certificate Export | 🔄 Planned |
| Email Notifications               | 🔄 Planned |
| Supply Chain Verification         | 🔄 Planned |
| GeM Live Integration              | 🔄 Planned |

### Phase 3 — Months 6-12

| Feature                        | Status     |
| ------------------------------ | ---------- |
| AI Fraud Detection (ML models) | 🔄 Planned |
| Full Blockchain Network        | 🔄 Planned |
| National Component Registry    | 🔄 Planned |
| ICEGATE Customs Integration    | 🔄 Planned |
| GSTN Supply Chain Validation   | 🔄 Planned |
| Policy Simulation Engine       | 🔄 Planned |
| Cross-sector Adoption          | 🔄 Planned |

---

## 5. Metrics & KPIs

| Metric                      | Target (Year 1)               |
| --------------------------- | ----------------------------- |
| Registered Suppliers        | 10,000                        |
| Products Registered         | 50,000                        |
| DVA Calculations/Month      | 100,000                       |
| Fraud Alerts Generated      | Track & report                |
| API Verifications/Month     | 500,000                       |
| Compliance Rate             | > 85% of registered suppliers |
| False Positive Rate (Fraud) | < 5%                          |
| User Satisfaction (NPS)     | > 40                          |
