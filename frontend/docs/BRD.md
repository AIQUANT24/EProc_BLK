# NMICOV — Business Requirements Document (BRD)

## Document Control

| Field | Value |
|-------|-------|
| Document Title | NMICOV Business Requirements Document |
| Version | 1.1 |
| Status | MVP Complete |
| Classification | Confidential — Government Use |
| Last Updated | 2026-03-09 |

---

## 1. Executive Summary

The **National Make-in-India Compliance & Origin Verification Ledger (NMICOV)** is a proposed national digital infrastructure to ensure verifiable enforcement of India's Public Procurement (Preference to Make in India) Order (PPP-MII). NMICOV replaces self-declaration-based compliance with a component-level, data-driven, blockchain-audited origin verification system.

---

## 2. Business Context

### 2.1 Policy Background

The PPP-MII Order mandates that government procurement must prioritize domestic manufacturers. Suppliers are classified based on **Domestic Value Addition (DVA)**:

| Supplier Class | Minimum Local Content |
|---|---|
| Class I Local Supplier | ≥ 50% |
| Class II Local Supplier | ≥ 20% and < 50% |
| Non Local Supplier | < 20% |

Class I suppliers receive **purchase preference** in government tenders. Class II suppliers are eligible but without preference. Non-local suppliers may be excluded from certain procurements.

### 2.2 Current State & Problems

| # | Problem | Impact |
|---|---------|--------|
| 1 | **False Domestic Claims** | Suppliers inflate local content percentages in self-declarations |
| 2 | **No Component Visibility** | Procurement agencies cannot verify Bill of Materials (BOM) origin |
| 3 | **Fragmented Verification** | Manual, inconsistent verification across agencies |
| 4 | **Weak Audit Trail** | Decisions cannot be independently validated post-procurement |
| 5 | **No Real-time Compliance** | GeM verifies eligibility but cannot validate origin authenticity |

### 2.3 Stakeholder Landscape

| Stakeholder | Role | Pain Point |
|------------|------|------------|
| DPIIT | PPP-MII policy owner | Cannot enforce compliance at scale |
| GeM | Government e-Marketplace | No origin verification capability |
| CAG | Comptroller & Auditor General | No auditable trail for procurement decisions |
| Nodal Ministries | Sector-specific rules | Manual compliance verification |
| DGFT | Import/export authority | Data not linked to procurement |
| GSTN | Tax/supplier verification | Supplier identity not procurement-linked |
| Customs (ICEGATE) | Import data | Import records not correlated with DVA claims |
| Suppliers | Bidders | Complex compliance paperwork |
| Domestic Manufacturers | Intended beneficiaries | Undercut by false claims from non-domestic suppliers |

---

## 3. Business Objectives

| # | Objective | Success Metric |
|---|-----------|---------------|
| BO-1 | Eliminate false domestic content claims | < 2% false positive rate in DVA scores |
| BO-2 | Automate DVA calculation | 100% of registered products have system-calculated DVA |
| BO-3 | Provide immutable audit trail | Every procurement decision traceable on blockchain |
| BO-4 | Enable real-time compliance verification | API response time < 2 seconds |
| BO-5 | Integrate with procurement ecosystem | GeM, CPPP integration within Phase 2 |
| BO-6 | Reduce compliance burden for genuine manufacturers | 60% reduction in compliance paperwork |
| BO-7 | Detect procurement fraud proactively | 90% detection rate for known fraud patterns |

---

## 4. Business Requirements

### BR-1: Supplier Identity & Verification

**Description:** The system must create a verified digital identity for every supplier participating in government procurement.

| Requirement | Detail |
|------------|--------|
| BR-1.1 | Onboard suppliers with GST, PAN, Udyam verification |
| BR-1.2 | Verify factory locations against license registries |
| BR-1.3 | Issue cryptographic identity for blockchain participation |
| BR-1.4 | Support MSME classification verification |
| BR-1.5 | Integrate with MCA21 for corporate entity verification |

### BR-2: Product Registration & Classification

| Requirement | Detail |
|------------|--------|
| BR-2.1 | Register products with HSN codes |
| BR-2.2 | Map products to PPP-MII sector-specific rules |
| BR-2.3 | Track product versions and manufacturing changes |
| BR-2.4 | Maintain minimum local content requirements per category |

### BR-3: Bill of Materials (BOM) Management

| Requirement | Detail |
|------------|--------|
| BR-3.1 | Support multi-tier BOM structures |
| BR-3.2 | Track component origin (domestic/imported) |
| BR-3.3 | Record cost contribution per component |
| BR-3.4 | Maintain BOM version history |
| BR-3.5 | Support bulk BOM upload via structured formats |

### BR-4: Domestic Value Addition (DVA) Calculation

| Requirement | Detail |
|------------|--------|
| BR-4.1 | Calculate DVA automatically from BOM data |
| BR-4.2 | Apply sector-specific DVA rules |
| BR-4.3 | Generate confidence scores based on verification depth |
| BR-4.4 | Classify suppliers automatically (Class I / Class II / Non-Local) |

### BR-5: Supply Chain Origin Verification

| Requirement | Detail |
|------------|--------|
| BR-5.1 | Cross-reference BOM origins against customs import data |
| BR-5.2 | Verify component supplier GST and manufacturing records |
| BR-5.3 | Flag origin mismatches (claimed domestic, evidence of import) |
| BR-5.4 | Score verification confidence per component |

### BR-6: Blockchain Compliance Ledger

| Requirement | Detail |
|------------|--------|
| BR-6.1 | Record all compliance declarations immutably |
| BR-6.2 | Support multi-agency node participation |
| BR-6.3 | Store data hashes on-chain, full data off-chain |
| BR-6.4 | Enable independent audit verification |

### BR-7: Fraud Detection

| Requirement | Detail |
|------------|--------|
| BR-7.1 | Rule-based fraud detection (DVA jumps, post-bid BOM changes) |
| BR-7.2 | AI-based anomaly detection for cost manipulation |
| BR-7.3 | Graph analysis for collusive supplier networks |
| BR-7.4 | Real-time fraud alerts to procurement officers |

### BR-8: Procurement Verification API

| Requirement | Detail |
|------------|--------|
| BR-8.1 | REST API for GeM and procurement platforms |
| BR-8.2 | Real-time supplier compliance verification |
| BR-8.3 | Return DVA score, classification, risk score, compliance status |
| BR-8.4 | Support batch verification for large tenders |

### BR-9: Compliance Dashboard

| Requirement | Detail |
|------------|--------|
| BR-9.1 | Supplier compliance tracker |
| BR-9.2 | Product compliance registry |
| BR-9.3 | Fraud alert management |
| BR-9.4 | Supply chain risk visualization |
| BR-9.5 | Procurement verification logs |

---

## 5. Regulatory & Compliance Requirements

| # | Requirement |
|---|------------|
| RC-1 | Comply with IT Act 2000 and amendments |
| RC-2 | Adhere to Government of India data classification standards |
| RC-3 | Support MeitY security guidelines for government applications |
| RC-4 | Data residency — all data stored within India |
| RC-5 | Right to audit by CAG and designated authorities |
| RC-6 | Comply with Personal Data Protection Act requirements |

---

## 6. Business Rules

| # | Rule |
|---|------|
| BRL-1 | DVA = (Sum of Domestic Component Costs / Total Product Cost) × 100 |
| BRL-2 | Class I: DVA ≥ 50%; Class II: 20% ≤ DVA < 50%; Non-Local: DVA < 20% |
| BRL-3 | BOM modifications after bid submission trigger fraud alert |
| BRL-4 | DVA changes > 15% between consecutive declarations require manual review |
| BRL-5 | Imported components with no customs correlation are flagged as unverified |
| BRL-6 | Supplier re-verification required every 12 months |

---

## 7. Constraints & Assumptions

### Constraints

- Must integrate with existing government infrastructure (GeM, GSTN)
- Must operate within NIC/government cloud infrastructure
- Blockchain network limited to permissioned government participants
- Budget and timeline governed by government procurement cycles

### Assumptions

- Government agencies will provide API access to their datasets
- Suppliers will adopt the platform due to procurement mandate
- Blockchain consensus among government nodes will be achievable
- Existing HSN code taxonomy is sufficient for product classification

---

## 8. Success Criteria

| Metric | Target |
|--------|--------|
| Supplier onboarding rate | 10,000 suppliers in Year 1 |
| Product registrations | 50,000 products in Year 1 |
| DVA calculation accuracy | > 95% correlation with manual audits |
| Fraud detection rate | > 90% for known fraud patterns |
| API response time | < 2 seconds for compliance checks |
| System uptime | 99.9% |
| Procurement platform integrations | GeM + 3 state platforms in Phase 2 |

---

## 9. Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| R-1 | Government API access delays | High | High | Early MoU engagement with agencies |
| R-2 | Supplier resistance to adoption | Medium | High | Mandate through procurement policy |
| R-3 | Data quality from external sources | High | Medium | Confidence scoring, manual fallback |
| R-4 | Blockchain scalability | Medium | Medium | Off-chain data storage pattern |
| R-5 | Inter-ministry coordination | High | High | DPIIT as nodal coordinating body |

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| DVA | Domestic Value Addition |
| PPP-MII | Public Procurement (Preference to Make in India) |
| BOM | Bill of Materials |
| GeM | Government e-Marketplace |
| GSTN | Goods and Services Tax Network |
| DGFT | Directorate General of Foreign Trade |
| ICEGATE | Indian Customs Electronic Gateway |
| HSN | Harmonized System of Nomenclature |
| DPIIT | Department for Promotion of Industry and Internal Trade |
| CAG | Comptroller and Auditor General |
| MCA21 | Ministry of Corporate Affairs portal |
| Udyam | MSME registration system |
