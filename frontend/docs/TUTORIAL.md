# NMICOV — User Tutorial Guide

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Platform Tutorial |
| Version | 1.1 |
| Last Updated | 2026-03-09 |

---

## Getting Started

### Step 1: Access the Platform

Navigate to **nmicov.gov.in** and click "Get Started."

### Step 2: Choose Your Role

NMICOV supports three login roles:

| Role | Access |
|------|--------|
| **Supplier** | Product registration, BOM declaration, DVA results |
| **Procurement Officer** | Compliance verification, risk alerts, verification API |
| **Administrator** | Full platform access, audit logs, settings |

---

## Tutorial: Supplier Workflow

### 1. Register a Product

1. Navigate to **Products** from the sidebar
2. Click **"+ New Product"**
3. Fill in:
   - Product Name
   - HSN Code
   - Category
   - Estimated Cost
4. Click **"Register Product"**
5. Product receives a unique ID (e.g., `PRD-001`)

### 2. Declare Bill of Materials (BOM)

1. Navigate to **BOM Management**
2. Select your product from the dropdown
3. Add components:
   - **Component Name** (e.g., "PCB Board")
   - **Origin** — Domestic or Imported
   - **Cost** (₹)
   - **Sub-supplier** (optional)
4. For multi-tier BOMs, click **"Add Sub-Assembly"**
5. Review the component list

### 3. Calculate DVA

1. In BOM Management, click **"Calculate DVA"**
2. The DVA Engine computes:
   - **DVA Score** (percentage)
   - **Classification** (Class I / Class II / Non-Local)
   - **Confidence Score** (0-1, based on verification depth)
   - **Risk Score** (based on confidence and threshold proximity)

### 4. Run Fraud Check

1. Click **"Run Fraud Check"**
2. The Fraud Engine scans for:
   - DVA jumps (>15% change)
   - Cost anomalies
   - Missing data
   - Import mismatches
3. Alerts appear in the **Risk Alerts** section

### 5. Submit & Lock BOM

1. Click **"Submit & Lock BOM"**
2. The BOM is:
   - Locked from further edits
   - Anchored to the blockchain ledger
   - Available for procurement verification

### 6. View DVA Results

1. Navigate to **DVA Results**
2. View all your products with:
   - DVA percentage
   - Classification badge
   - Confidence score
   - Blockchain transaction hash

### 7. What-If Analysis

1. In BOM Management, toggle **"What-If Mode"**
2. Experiment by:
   - Switching component origin (Domestic ↔ Imported)
   - Adjusting component costs
3. See real-time DVA impact
4. Exit What-If mode — no changes are saved

---

## Tutorial: Procurement Officer Workflow

### 1. Verify a Supplier

1. Navigate to **Verification**
2. Select the product to verify
3. Choose the requesting entity (e.g., "GeM Portal")
4. Click **"Run Verification"**
5. View the complete API response:
   - DVA Score, Classification, Confidence
   - Risk Score, Compliance Status
   - Blockchain Transaction Hash

### 2. Review Risk Alerts

1. Navigate to **Risk Alerts**
2. View active alerts with:
   - Rule ID (FR-01 through FR-06)
   - Severity (High / Medium / Low)
   - Affected product and details
3. Click **"Resolve"** to close an alert (anchored to blockchain)

### 3. Check Compliance Dashboard

1. Navigate to **Compliance**
2. View:
   - Total products and compliance rates
   - Average DVA scores
   - Class I / II / Non-Local distribution
   - Per-product confidence and risk scores

---

## Tutorial: Administrator Workflow

### 1. Monitor Audit Logs

1. Navigate to **Audit Logs**
2. View the complete blockchain ledger:
   - Block Number, Event Type
   - Entity, Timestamp
   - Transaction Hash, Data Hash
   - Previous Hash (chain linkage)

### 2. Manage Users

1. Navigate to **User Management**
2. View all platform users
3. Assign roles (Supplier / Procurement / Admin)

### 3. Configure Settings

1. Navigate to **Settings**
2. Adjust:
   - DVA thresholds
   - Fraud detection sensitivity
   - Notification preferences
   - API rate limits

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Quick search |
| `Ctrl+N` | New product |
| `Ctrl+D` | Calculate DVA |

---

## FAQ

**Q: Can I edit a BOM after submission?**
A: No. Submitted BOMs are locked and blockchain-anchored. Create a new version if changes are needed.

**Q: What happens if my DVA score drops below threshold?**
A: Your classification changes automatically. You'll be notified and can use What-If Analysis to plan improvements.

**Q: How is the confidence score calculated?**
A: It's a weighted average of 5 verification factors: GST verification (20%), Customs data (30%), Manufacturing license (20%), Historical consistency (15%), and Third-party audit (15%).

**Q: Can I export compliance certificates?**
A: Yes. Professional and Enterprise tiers can export PDF certificates with blockchain verification hashes.
