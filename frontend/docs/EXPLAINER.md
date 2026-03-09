# NMICOV — Product Explainer

## What is NMICOV?

**NMICOV** (National Make-in-India Compliance & Origin Verification Ledger) is India's first digital infrastructure for verifying domestic manufacturing compliance in public procurement.

It answers one critical question: **"Is this product genuinely Made in India?"**

---

## The Problem

India's government spends ₹88 lakh crore annually on procurement. The PPP-MII Order 2017 requires preference for domestically manufactured goods. But:

- ❌ Suppliers self-certify DVA percentages — no automated verification
- ❌ Procurement officers manually review claims — slow, error-prone
- ❌ No component-level origin tracking — aggregate claims hide imported content
- ❌ No immutable audit trail — records can be altered
- ❌ No fraud detection — suspicious patterns go unnoticed
- ❌ No real-time verification API — GeM can't auto-verify during bidding

---

## The Solution

NMICOV provides **six core capabilities:**

### 1. Component-Level BOM Declaration
Suppliers declare every component in their product — origin country, cost, and sub-supplier. Multi-tier BOMs with nested sub-assemblies are supported.

### 2. Automated DVA Calculation
```
DVA% = (Domestic Component Cost ÷ Total Product Cost) × 100
```
Real-time, auditable calculation with confidence scoring based on 5 verification factors.

### 3. PPP-MII Classification
Automatic classification per the latest PPP-MII order:
- **Class I:** ≥50% DVA (full purchase preference)
- **Class II:** ≥20% DVA (secondary preference)
- **Non-Local:** <20% DVA

### 4. AI-Powered Fraud Detection
Six rule-based detection algorithms (Phase 1) with ML models planned:
- DVA jump detection (>15% change between declarations)
- Post-bid BOM manipulation
- Import mismatch detection
- Cost anomaly flagging
- Circular supply chain detection
- Missing data identification

### 5. Blockchain Compliance Ledger
Every declaration, DVA calculation, and verification event is cryptographically hashed and recorded on a permissioned Hyperledger Fabric network — creating immutable proof accessible to DPIIT, GeM, CAG, and sector ministries.

### 6. Verification API
External systems (GeM, CPPP, state procurement portals) verify supplier compliance in real-time:
```json
POST /api/v1/verify
→ { "dva_score": 62.8, "classification": "Class I", "confidence": 0.87, "blockchain_tx": "0xabc..." }
```

---

## Who Uses NMICOV?

| User | What They Do | What They Get |
|------|-------------|---------------|
| **Supplier** | Register products, declare BOMs | Automated compliance certificate |
| **Procurement Officer** | Verify bids | One-click compliance verification |
| **Auditor (CAG)** | Audit procurement | Blockchain-backed audit trail |
| **Policy Admin (DPIIT)** | Monitor compliance | National analytics & policy simulation |
| **Platform (GeM)** | Integrate verification | Real-time API for bid verification |

---

## Why NMICOV?

| Before NMICOV | After NMICOV |
|---------------|-------------|
| Self-certification (trust-based) | Component-level verification (evidence-based) |
| Manual audit (weeks) | Automated verification (seconds) |
| No fraud detection | AI-powered anomaly detection |
| Paper trail (alterable) | Blockchain proof (immutable) |
| No cross-referencing | GSTN + ICEGATE + Factory Registry correlation |
| Siloed per department | National compliance infrastructure |

---

## Scale

Designed for India-scale deployment:
- 100,000+ suppliers
- 1,000,000+ products
- 500,000 API verifications/month
- 22 languages
- 99.9% uptime
- Full data residency within India

---

## Get Started

1. **Suppliers:** Register at nmicov.gov.in → Declare products → Submit BOMs → Get certified
2. **Procurement Officers:** Log in → Search supplier → Verify compliance → Download certificate
3. **Platforms (GeM):** Integrate API → Auto-verify bids → Reduce manual review

**NMICOV — Verify. Trust. Procure.**
