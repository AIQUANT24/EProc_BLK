# NMICOV — Phase 2 Implementation Report

## Document Control

| Field          | Value                         |
| -------------- | ----------------------------- |
| Document Title | Phase 2 Implementation Report |
| Version        | 1.1                           |
| Status         | Complete                      |
| Last Updated   | 2026-03-09                    |

---

## 1. Phase 2 Overview

Phase 2 implements **real business logic** into the Phase 1 UI scaffolding. All modules now have functional engines powering them, with simulated blockchain anchoring and rule-based fraud detection.

### Modules Delivered

| Module                       | Status   | Engine                        |
| ---------------------------- | -------- | ----------------------------- |
| DVA Calculation Engine       | Complete | `src/lib/dva-engine.ts`       |
| Fraud Detection Engine       | Complete | `src/lib/fraud-engine.ts`     |
| Blockchain Ledger Simulation | Complete | `src/lib/blockchain-sim.ts`   |
| Verification API Simulation  | Complete | Integrated in MockDataContext |
| Compliance Classification    | Complete | Auto-classification from DVA  |
| What-If Analysis             | Complete | BOM Management page           |
| Confidence Scoring           | Complete | 5-factor weighted model       |

---

## 2. DVA Calculation Engine

**File:** `src/lib/dva-engine.ts`

### Formula

```
DVA% = (Σ Domestic Component Costs / Σ Total Component Costs) × 100
```

### Classification

| Category  | DVA Threshold   |
| --------- | --------------- |
| Class I   | ≥ 50%           |
| Class II  | ≥ 20% and < 50% |
| Non-Local | < 20%           |

### Confidence Score Model

The confidence score quantifies verification depth for each DVA calculation:

| Factor                   | Weight | Data Source      |
| ------------------------ | ------ | ---------------- |
| GST Verification         | 20%    | GSTN API         |
| Customs Data Correlation | 30%    | ICEGATE          |
| Manufacturing License    | 20%    | Factory Registry |
| Historical Consistency   | 15%    | Platform History |
| Third-Party Audit        | 15%    | Audit Records    |

**Confidence = Σ (factor_verification_ratio × factor_weight)**

### Risk Score

```
Risk = (1 - confidence) × 0.6 + (1 - threshold_proximity) × 0.4
```

Where `threshold_proximity` measures distance from classification boundaries (50% and 20%).

### What-If Analysis

Allows suppliers and officers to simulate DVA impact by changing:

- Component origin (domestic ↔ imported)
- Component cost

---

## 3. Fraud Detection Engine

**File:** `src/lib/fraud-engine.ts`

### Rule-Based Detection (6 Rules)

| Rule ID | Rule Name           | Severity | Trigger Condition                                 |
| ------- | ------------------- | -------- | ------------------------------------------------- |
| FR-01   | DVA Jump Detection  | High     | DVA changes > 15% between declarations            |
| FR-02   | Post-Bid BOM Change | High     | BOM modified after bid submission                 |
| FR-03   | Import Mismatch     | High     | Component claimed domestic, import evidence found |
| FR-04   | Cost Anomaly        | Medium   | Imported cost > 60% of total BOM                  |
| FR-05   | Circular Supply     | Medium   | 3+ components sourced in-house                    |
| FR-06   | Missing Cost Data   | Low      | Components with zero/missing cost                 |

### Alert Lifecycle

1. **Generated** — Rule triggers during fraud check
2. **Active** — Visible to procurement officers
3. **Resolved** — Officer marks resolved; anchored to blockchain

---

## 4. Blockchain Ledger Simulation

**File:** `src/lib/blockchain-sim.ts`

### Simulated Hyperledger Fabric Network

| Parameter  | Value                                     |
| ---------- | ----------------------------------------- |
| Platform   | Hyperledger Fabric (simulated)            |
| Peer Nodes | 5 (DPIIT, GeM, CAG, Ministries, Auditors) |
| Consensus  | Raft                                      |

### Ledger Entry Structure

| Field         | Description                                       |
| ------------- | ------------------------------------------------- |
| Block Number  | Monotonically incrementing                        |
| Event         | Action type (BOM Submitted, DVA Calculated, etc.) |
| Entity        | Product/Supplier ID                               |
| Tx Hash       | Simulated transaction hash                        |
| Data Hash     | SHA-256 simulation of payload                     |
| Previous Hash | Chain linkage to previous entry                   |
| Timestamp     | ISO 8601                                          |

### Anchored Events

- Supplier Registration
- Product Creation
- BOM Submission
- DVA Calculation
- Classification Assignment
- Verification Request/Completion
- Alert Generation/Resolution

---

## 5. Verification API

### Endpoint Simulation

```
POST /api/v1/verify
```

### Request

```json
{
  "product_id": "PRD-001",
  "requested_by": "GeM Portal"
}
```

### Response

```json
{
  "supplier_id": "Vikram Industries",
  "product_id": "PRD-001",
  "dva_score": 62.8,
  "classification": "Class I",
  "confidence_score": 0.87,
  "risk_score": 0.08,
  "compliance_status": "VERIFIED",
  "verification_timestamp": "2026-03-08T10:30:00Z",
  "blockchain_tx_hash": "0xabc123...def",
  "flags": []
}
```

### Status Mapping

| Condition                | Status     |
| ------------------------ | ---------- |
| Non-Local classification | `FAILED`   |
| Risk score > 0.3         | `PENDING`  |
| Otherwise                | `VERIFIED` |

---

## 6. Test Suite

### Coverage: 42 Tests, 5 Test Files

| Test File                  | Tests | Scope                                                |
| -------------------------- | ----- | ---------------------------------------------------- |
| `dva-engine.test.ts`       | 15    | DVA calculation, classification, confidence, what-if |
| `fraud-engine.test.ts`     | 11    | All 6 fraud rules, multi-rule triggering             |
| `blockchain-sim.test.ts`   | 7     | Ledger entry creation, chain linkage, uniqueness     |
| `integration-flow.test.ts` | 8     | DVA → Classification → Compliance flow               |
| `example.test.ts`          | 1     | Setup verification                                   |

### Key Test Scenarios

- DVA boundary conditions (0%, 20%, 50%, 100%)
- Empty BOM handling
- What-if origin switching and cost changes
- Fraud rule firing individually and simultaneously
- Blockchain hash chain integrity
- Confidence factor weight validation (sums to 1.0)

---

## 7. Enhanced Pages

| Page               | Phase 2 Enhancements                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| **BOM Management** | Calculate DVA button, Run Fraud Check, Submit & Lock BOM, What-If Analysis mode, confidence breakdown |
| **DVA Results**    | Confidence scores, blockchain tx hashes, DVA vs Confidence chart                                      |
| **Compliance**     | Confidence/risk columns, average confidence stat, blockchain tx hashes                                |
| **Risk Alerts**    | Fraud rule reference panel, resolve button with ledger anchoring, rule IDs, details                   |
| **Verification**   | Product selector, requester dropdown, full API response with blockchain hash                          |
| **Audit Logs**     | Dynamic ledger from all actions, block numbers, data hashes, previous hash chain                      |

---

## 8. Phase 3 Roadmap

| Feature                        | Priority | Dependency                  |
| ------------------------------ | -------- | --------------------------- |
| GeM Live Integration           | P1       | API access                  |
| GSTN Supply Chain Validation   | P1       | GSTN API                    |
| Customs ICEGATE Correlation    | P1       | ICEGATE access              |
| AI Fraud Detection (ML models) | P2       | Training data               |
| Supply Chain Graph Analytics   | P2       | Graph DB                    |
| Policy Simulation Engine       | P2       | Threshold config            |
| National Component Registry    | P3       | Multi-ministry coordination |
