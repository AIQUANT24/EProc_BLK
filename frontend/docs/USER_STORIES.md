# NMICOV — User Stories & Acceptance Criteria

## Document Control

| Field | Value |
|-------|-------|
| Document Title | User Stories with Acceptance Criteria |
| Version | 1.1 |
| Last Updated | 2026-03-09 |

---

## Epic 1: Supplier Registration & Identity

### US-1.1: Supplier Self-Registration

**As a** supplier/manufacturer,
**I want to** register on the NMICOV platform with my business details,
**So that** I can declare my products and obtain Make-in-India compliance certification.

**Priority:** P0 | **Sprint:** 1

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|---------|-------------|
| AC-1 | Supplier can enter GST number, PAN, legal name, trade name | Form validation |
| AC-2 | System validates GST format (15 characters, valid checksum) | Unit test |
| AC-3 | System validates PAN format (AAAAA0000A) | Unit test |
| AC-4 | System checks for duplicate GST registration | Database constraint |
| AC-5 | Supplier receives confirmation email upon registration | Integration test |
| AC-6 | Registration completes within 10 minutes for standard cases | Performance test |
| AC-7 | All fields marked mandatory are enforced | UI/API validation |
| AC-8 | Registration data is encrypted in transit and at rest | Security test |

---

### US-1.2: Automated KYC Verification

**As a** supplier,
**I want** my GST and PAN to be automatically verified against government databases,
**So that** my identity is confirmed without manual document submission.

**Priority:** P0 | **Sprint:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | System calls GSTN API to verify GST number |
| AC-2 | System calls PAN verification service |
| AC-3 | Verification result (pass/fail/pending) displayed within 30 seconds |
| AC-4 | Failed verification provides specific reason |
| AC-5 | Supplier can retry verification after correcting details |
| AC-6 | Manual verification fallback available if API is unavailable |
| AC-7 | Verification status stored with timestamp |
| AC-8 | Verified suppliers receive "Verified" badge on profile |

---

### US-1.3: Factory Registration

**As a** supplier,
**I want to** register my manufacturing facilities with location and capacity details,
**So that** my domestic manufacturing capability is documented.

**Priority:** P0 | **Sprint:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier can add multiple factory locations |
| AC-2 | Each factory requires: name, full address, pincode, state |
| AC-3 | GPS coordinates auto-populated from address (optional manual entry) |
| AC-4 | Manufacturing capacity captured as structured data (product types, volume) |
| AC-5 | Factory license number captured and validated against registry |
| AC-6 | Factory location displayed on map view |
| AC-7 | Factory can be marked active/inactive |

---

### US-1.4: MSME Verification

**As a** supplier registered as an MSME,
**I want** my Udyam registration to be verified,
**So that** I receive applicable MSME benefits in procurement.

**Priority:** P1 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier can enter Udyam registration number |
| AC-2 | System verifies against Udyam database |
| AC-3 | MSME category (Micro/Small/Medium) auto-populated |
| AC-4 | MSME status displayed on supplier profile |
| AC-5 | MSME status considered in procurement preference calculations |

---

### US-1.5: Digital Identity Issuance

**As a** verified supplier,
**I want to** receive a digital identity (cryptographic keys),
**So that** my declarations are digitally signed and verifiable on blockchain.

**Priority:** P1 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Digital identity issued only after successful KYC |
| AC-2 | PKI key pair generated securely (RSA-2048 or ECDSA P-256) |
| AC-3 | Public key registered on blockchain network |
| AC-4 | Private key stored in hardware security module or secure vault |
| AC-5 | Supplier can sign declarations using digital identity |
| AC-6 | Digital identity can be revoked if supplier is deregistered |

---

## Epic 2: Product Registration

### US-2.1: Register New Product

**As a** supplier,
**I want to** register a product with its specifications and HSN code,
**So that** it can be evaluated for Make-in-India compliance.

**Priority:** P0 | **Sprint:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier can create a product with: name, HSN code, category, description |
| AC-2 | HSN code validated against standard HSN taxonomy |
| AC-3 | Product auto-mapped to applicable PPP-MII sector rules |
| AC-4 | Minimum local content requirement displayed based on sector |
| AC-5 | Manufacturing location linked to registered factory |
| AC-6 | Product assigned unique product ID |
| AC-7 | Product versioning starts at v1 |

---

### US-2.2: Bulk Product Upload

**As a** supplier with a large product catalog,
**I want to** upload multiple products via CSV/Excel,
**So that** I can register my entire catalog efficiently.

**Priority:** P1 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | System provides downloadable CSV/Excel template |
| AC-2 | System validates all rows before import |
| AC-3 | Invalid rows clearly identified with error messages |
| AC-4 | Valid rows imported; invalid rows skipped with report |
| AC-5 | Upload supports up to 10,000 products per batch |
| AC-6 | Progress indicator shown during import |
| AC-7 | Import summary report downloadable after completion |

---

### US-2.3: Product Version Management

**As a** supplier,
**I want to** create new versions of my product when specifications change,
**So that** compliance is re-evaluated for the updated product.

**Priority:** P1 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier can create a new version of an existing product |
| AC-2 | Previous versions remain accessible for audit |
| AC-3 | Version change triggers DVA recalculation |
| AC-4 | Version history shows changes between versions |
| AC-5 | Active bids reference the specific product version |

---

## Epic 3: Bill of Materials (BOM) Management

### US-3.1: Create BOM Declaration

**As a** supplier,
**I want to** declare the Bill of Materials for my product,
**So that** domestic value addition can be calculated.

**Priority:** P0 | **Sprint:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier can add components to a product's BOM |
| AC-2 | Each component requires: name, origin (Domestic/Imported), cost, quantity |
| AC-3 | Component supplier name and GST are optional but recommended |
| AC-4 | BOM displayed as a tree structure |
| AC-5 | Total cost auto-calculated from components |
| AC-6 | DVA percentage auto-calculated and displayed in real-time |
| AC-7 | BOM can be saved as draft before final submission |
| AC-8 | Submitted BOM is immutable (new version required for changes) |

---

### US-3.2: Multi-Tier BOM Support

**As a** supplier with complex products,
**I want to** declare sub-assemblies within my BOM,
**So that** the full supply chain depth is captured.

**Priority:** P0 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Components can contain sub-components (nested BOM) |
| AC-2 | BOM tree supports at least 5 levels of nesting |
| AC-3 | DVA calculation traverses all levels |
| AC-4 | Sub-assembly origin determined by its own component composition |
| AC-5 | Visual tree view clearly shows hierarchy |
| AC-6 | Expand/collapse functionality for large BOMs |

---

### US-3.3: BOM Import from File

**As a** supplier,
**I want to** import my BOM from an ERP export (CSV/JSON/XML),
**So that** I don't have to manually re-enter component data.

**Priority:** P1 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | System accepts CSV, JSON, and XML BOM formats |
| AC-2 | System provides format templates for each file type |
| AC-3 | Import maps columns/fields to NMICOV BOM schema |
| AC-4 | Validation errors shown per row with clear messages |
| AC-5 | Preview of imported BOM before confirmation |
| AC-6 | Import handles up to 5,000 components per BOM |

---

### US-3.4: BOM Cost Visualization

**As a** supplier,
**I want to** see a visual breakdown of my BOM costs by origin,
**So that** I understand my domestic vs. imported cost distribution.

**Priority:** P1 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Pie chart showing domestic vs. imported cost split |
| AC-2 | Bar chart showing cost by component category |
| AC-3 | Table view with sortable columns |
| AC-4 | Export visualization as PDF |
| AC-5 | Color coding: green for domestic, red for imported |

---

## Epic 4: DVA Calculation & Classification

### US-4.1: Automatic DVA Calculation

**As a** supplier,
**I want** the system to automatically calculate my Domestic Value Addition percentage,
**So that** I know my supplier classification.

**Priority:** P0 | **Sprint:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | DVA calculated as: (Domestic Cost / Total Cost) × 100 |
| AC-2 | Calculation considers all BOM levels (recursive) |
| AC-3 | Result displayed with 2 decimal places |
| AC-4 | Calculation logged with timestamp and all input values |
| AC-5 | DVA updates automatically when BOM changes |
| AC-6 | Calculation completes within 5 seconds for BOMs up to 5,000 components |

---

### US-4.2: Supplier Classification

**As a** supplier,
**I want to** see my automatic classification (Class I / Class II / Non-Local),
**So that** I know my eligibility for government procurement.

**Priority:** P0 | **Sprint:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Classification rules: Class I (DVA ≥ 50%), Class II (20-50%), Non-Local (<20%) |
| AC-2 | Classification displayed prominently on product page |
| AC-3 | Classification badge color-coded (green/yellow/red) |
| AC-4 | Classification considers sector-specific rules if applicable |
| AC-5 | Historical classification changes tracked |

---

### US-4.3: DVA Confidence Score

**As a** procurement officer,
**I want to** see a confidence score alongside the DVA percentage,
**So that** I know how reliable the DVA calculation is.

**Priority:** P1 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Confidence score ranges from 0.0 to 1.0 |
| AC-2 | Score factors: customs verification (0.30), GST verification (0.20), manufacturing license (0.20), historical consistency (0.15), third-party audit (0.15) |
| AC-3 | Score displayed with visual indicator (low/medium/high) |
| AC-4 | Breakdown of score factors viewable on demand |
| AC-5 | Low confidence (< 0.5) triggers advisory for manual review |

---

### US-4.4: DVA What-If Simulation

**As a** supplier,
**I want to** simulate how changing components would affect my DVA score,
**So that** I can plan sourcing decisions to improve my classification.

**Priority:** P2 | **Sprint:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier can create a simulation copy of their BOM |
| AC-2 | Changes to simulation do not affect actual BOM |
| AC-3 | DVA recalculated in real-time as simulation changes are made |
| AC-4 | Side-by-side comparison of current vs. simulated DVA |
| AC-5 | Simulation results are not recorded on blockchain |

---

## Epic 5: Supply Chain Verification

### US-5.1: Import Data Correlation

**As the** system,
**I want to** cross-reference BOM component origins against customs import data,
**So that** components falsely declared as domestic are detected.

**Priority:** P1 | **Sprint:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | System queries ICEGATE for import records matching component supplier GST |
| AC-2 | If supplier imported the declared-domestic component, origin mismatch flagged |
| AC-3 | Flag severity: HIGH for exact product match, MEDIUM for category match |
| AC-4 | Verification result stored per component |
| AC-5 | Procurement officer can view import evidence |
| AC-6 | False positive handling: supplier can provide explanation |

---

### US-5.2: GST Supply Chain Trace

**As the** system,
**I want to** trace the GST invoice chain for declared components,
**So that** the supply chain authenticity is verified.

**Priority:** P2 | **Sprint:** 5

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | System traces GST invoices from component supplier to product manufacturer |
| AC-2 | Missing invoice chain raises verification warning |
| AC-3 | Invoice amounts correlated with declared BOM costs (±10% tolerance) |
| AC-4 | Supply chain depth traced up to 3 tiers |
| AC-5 | Results displayed as supply chain graph |

---

## Epic 6: Fraud Detection

### US-6.1: DVA Jump Detection

**As a** compliance officer,
**I want** the system to flag suppliers whose DVA scores change drastically between declarations,
**So that** potential manipulation is investigated.

**Priority:** P0 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Alert triggered when DVA changes > 15% between consecutive declarations |
| AC-2 | Alert includes: previous DVA, current DVA, change delta |
| AC-3 | Alert severity: MEDIUM for 15-25% change, HIGH for >25% |
| AC-4 | Alert appears on compliance dashboard within 5 minutes |
| AC-5 | Officer can mark alert as: Investigating, Resolved, False Positive |

---

### US-6.2: Post-Bid BOM Modification Detection

**As a** compliance officer,
**I want** the system to detect if a supplier modifies their BOM after submitting a bid,
**So that** bid integrity is maintained.

**Priority:** P0 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | System tracks bid submission timestamps |
| AC-2 | BOM modifications after bid submission date trigger CRITICAL alert |
| AC-3 | Alert includes: bid reference, modification details, timestamp |
| AC-4 | Blockchain record of original BOM at bid time is preserved |
| AC-5 | Supplier's active bids flagged for review |

---

### US-6.3: Import Origin Mismatch Alert

**As a** compliance officer,
**I want** the system to alert when a component declared as domestic has import evidence,
**So that** false origin claims are caught.

**Priority:** P0 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Alert triggered when customs data shows import record for declared-domestic component |
| AC-2 | Alert includes: component details, customs record, supplier info |
| AC-3 | Severity: CRITICAL |
| AC-4 | Alert auto-assigned to sector compliance team |
| AC-5 | Supplier notified and given 7 days to respond with evidence |

---

### US-6.4: Cost Anomaly Detection

**As a** compliance officer,
**I want** the system to flag components with suspiciously low or high costs,
**So that** cost manipulation to inflate DVA is detected.

**Priority:** P1 | **Sprint:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | System maintains baseline cost ranges per component category |
| AC-2 | Components priced >2x or <0.5x the baseline flagged |
| AC-3 | Alert includes: declared cost, baseline range, deviation |
| AC-4 | Baseline updated quarterly from aggregate data |
| AC-5 | New categories without baseline are not flagged (data collection mode) |

---

### US-6.5: AI-Based Fraud Pattern Detection

**As a** policy administrator,
**I want** AI models to detect complex fraud patterns across suppliers,
**So that** sophisticated manipulation is caught.

**Priority:** P2 | **Sprint:** 6

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Isolation Forest model detects anomalous DVA patterns |
| AC-2 | Graph Neural Network identifies collusive supplier networks |
| AC-3 | Model predictions include confidence score |
| AC-4 | Models retrained monthly with new data |
| AC-5 | Model performance tracked (precision, recall, F1) |
| AC-6 | Human review required before action on AI-generated alerts |

---

## Epic 7: Blockchain Compliance Ledger

### US-7.1: Record DVA Declaration on Blockchain

**As the** system,
**I want to** record every DVA declaration hash on the blockchain,
**So that** an immutable audit trail exists.

**Priority:** P0 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | DVA declaration hash recorded on Hyperledger Fabric |
| AC-2 | On-chain data: declaration ID, supplier ID, product ID, DVA score, classification, data hash, timestamp |
| AC-3 | Full declaration data stored off-chain in PostgreSQL |
| AC-4 | Blockchain transaction hash stored in off-chain record |
| AC-5 | Recording completes within 30 seconds |
| AC-6 | Blockchain unavailability does not block DVA calculation (queued for retry) |

---

### US-7.2: Verify Compliance Record on Blockchain

**As an** auditor,
**I want to** verify a compliance record against the blockchain,
**So that** I can confirm the record has not been tampered with.

**Priority:** P1 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Auditor can query a compliance record by declaration ID |
| AC-2 | System computes hash of off-chain record and compares to on-chain hash |
| AC-3 | Match result displayed: "Verified" (green) or "Mismatch Detected" (red) |
| AC-4 | Verification details include: on-chain hash, computed hash, block number, timestamp |
| AC-5 | Mismatch triggers automatic investigation alert |

---

## Epic 8: Procurement Verification API

### US-8.1: Single Bid Verification

**As** GeM/procurement platform,
**I want to** verify a supplier's compliance for a specific product via API,
**So that** bid eligibility is automatically determined.

**Priority:** P1 | **Sprint:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | API accepts supplier_id and product_id |
| AC-2 | Response includes: DVA score, classification, confidence, risk score, compliance status |
| AC-3 | Response time < 2 seconds |
| AC-4 | API authenticated via OAuth 2.0 client credentials |
| AC-5 | Rate limited to 1000 requests/minute per client |
| AC-6 | API call logged for audit trail |
| AC-7 | 404 returned for unregistered supplier/product |

---

### US-8.2: Batch Bid Verification

**As** GeM/procurement platform,
**I want to** verify multiple bids in a single API call,
**So that** large tender evaluations are efficient.

**Priority:** P1 | **Sprint:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | API accepts array of {supplier_id, product_id} pairs |
| AC-2 | Batch size limited to 500 per request |
| AC-3 | Response includes individual results for each pair |
| AC-4 | Batch processing completes within 30 seconds |
| AC-5 | Partial failures don't block successful verifications |
| AC-6 | Summary statistics included (compliant count, non-compliant count, errors) |

---

## Epic 9: Compliance Dashboard

### US-9.1: Supplier Compliance Overview

**As a** procurement officer,
**I want to** see an overview of supplier compliance across all registered suppliers,
**So that** I can assess the compliance landscape.

**Priority:** P0 | **Sprint:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Dashboard shows: total suppliers, Class I count, Class II count, Non-Local count |
| AC-2 | Pie chart of supplier classification distribution |
| AC-3 | Trend line showing classification changes over time |
| AC-4 | Filters by: sector, state, MSME status |
| AC-5 | Search by supplier name or GST |
| AC-6 | Dashboard loads within 3 seconds |

---

### US-9.2: Fraud Alert Management

**As a** compliance officer,
**I want to** manage fraud alerts from a central dashboard,
**So that** I can investigate and resolve potential compliance violations.

**Priority:** P0 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Alert list with: severity, type, supplier, product, status, date |
| AC-2 | Filters by: severity, status, type, date range |
| AC-3 | Alert detail view with full evidence and context |
| AC-4 | Officer can update status: Open → Investigating → Resolved/False Positive |
| AC-5 | Resolution notes required when closing alert |
| AC-6 | Alert assignment to specific officers |
| AC-7 | Notification when new HIGH/CRITICAL alert created |

---

### US-9.3: Supply Chain Risk Map

**As an** auditor,
**I want to** see a visual map of supply chains with risk indicators,
**So that** I can identify high-risk supply chain patterns.

**Priority:** P2 | **Sprint:** 5

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Interactive graph showing supplier → component → sub-component relationships |
| AC-2 | Nodes color-coded by risk level |
| AC-3 | Click on node shows detailed supplier/component info |
| AC-4 | Filter by product category, risk level |
| AC-5 | Export graph as image or PDF |
| AC-6 | Highlight clusters of interconnected suppliers |

---

### US-9.4: Procurement Verification Logs

**As an** auditor,
**I want to** see a log of all verification API calls,
**So that** I can audit procurement decisions.

**Priority:** P1 | **Sprint:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Log shows: timestamp, requesting platform, supplier, product, result |
| AC-2 | Searchable by date range, supplier, platform |
| AC-3 | Detail view shows full request and response payloads |
| AC-4 | Logs retained for minimum 7 years |
| AC-5 | Export logs as CSV |
| AC-6 | Logs are immutable (append-only) |

---

## Epic 10: Policy Administration

### US-10.1: DVA Threshold Configuration

**As a** DPIIT policy administrator,
**I want to** configure DVA classification thresholds per sector,
**So that** sector-specific rules are enforced.

**Priority:** P1 | **Sprint:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Admin can set Class I and Class II thresholds per sector |
| AC-2 | Default thresholds: Class I ≥ 50%, Class II ≥ 20% |
| AC-3 | Threshold changes effective from a specified date |
| AC-4 | Historical thresholds preserved for audit |
| AC-5 | Impact preview shows how many suppliers change classification |
| AC-6 | Threshold change requires dual approval |

---

### US-10.2: Policy Impact Simulation

**As a** policy administrator,
**I want to** simulate the impact of changing DVA thresholds,
**So that** I can make informed policy decisions.

**Priority:** P2 | **Sprint:** 6

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Admin can set hypothetical threshold values |
| AC-2 | System calculates: number of suppliers affected, classification changes |
| AC-3 | Results shown as before/after comparison |
| AC-4 | Breakdown by sector, state, MSME status |
| AC-5 | Simulation results exportable as report |
| AC-6 | Simulation does not affect production data |

---

## Priority Matrix

| Priority | Count | Sprint Target |
|----------|-------|--------------|
| P0 (Must Have) | 14 stories | Sprint 1-2 |
| P1 (Should Have) | 13 stories | Sprint 3-4 |
| P2 (Nice to Have) | 5 stories | Sprint 5-6 |

---

## Definition of Done (Global)

All user stories must meet the following criteria to be considered "Done":

- [ ] Code implemented and peer-reviewed
- [ ] Unit tests written with > 80% coverage
- [ ] Integration tests passing
- [ ] API documentation updated (if applicable)
- [ ] Security review completed for sensitive features
- [ ] Performance tested against SLOs
- [ ] Accessibility checked (WCAG 2.1 AA)
- [ ] Deployed to staging and tested
- [ ] Product owner sign-off obtained
