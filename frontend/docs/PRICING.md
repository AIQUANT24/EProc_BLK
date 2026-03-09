# NMICOV — Pricing & Revenue Model

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Pricing Strategy |
| Version | 1.1 |
| Last Updated | 2026-03-09 |

---

## 1. Pricing Philosophy

NMICOV follows a **Freemium + API Metering** model designed to:
- Remove adoption barriers for MSMEs (free tier)
- Monetize high-volume enterprise and government usage
- Create network effects through broad supplier adoption
- Generate recurring revenue via subscriptions + usage-based API fees

---

## 2. Subscription Tiers

### Free (Starter)

**Price:** ₹0/month

| Feature | Limit |
|---------|-------|
| Supplier Registration | 1 entity |
| Product Registration | 10 products |
| BOM Declaration | 10 BOMs |
| DVA Calculation | Unlimited |
| Compliance Certificate (Basic) | ✅ |
| API Calls | 100/month |
| Support | Community forum |

**Target:** Small MSMEs, first-time GeM sellers

---

### Professional

**Price:** ₹9,999/month (₹99,990/year — 2 months free)

| Feature | Limit |
|---------|-------|
| Everything in Free | ✅ |
| Products | Unlimited |
| BOMs | Unlimited |
| Fraud Alert Dashboard | ✅ |
| What-If Analysis | ✅ |
| Blockchain Compliance Certificates | ✅ |
| Export Reports (PDF/CSV/Excel) | ✅ |
| API Calls | 10,000/month |
| Support | Email (24hr SLA) |

**Target:** Mid-size manufacturers, regular GeM suppliers

---

### Enterprise

**Price:** ₹49,999/month (₹4,99,990/year — 2 months free)

| Feature | Limit |
|---------|-------|
| Everything in Professional | ✅ |
| Multi-entity Management | Up to 50 entities |
| Custom API Integrations | ✅ |
| Dedicated Account Manager | ✅ |
| Custom Fraud Rules | ✅ |
| White-label Reports | ✅ |
| SLA 99.99% Uptime | ✅ |
| API Calls | 100,000/month |
| Support | Phone + Email (4hr SLA) |

**Target:** Large manufacturers, OEMs, conglomerates

---

### Government

**Price:** Custom (Contact Sales)

| Feature | Limit |
|---------|-------|
| Everything in Enterprise | ✅ |
| Unlimited API Calls | ✅ |
| On-premise / Sovereign Cloud Deployment | ✅ |
| GeM / ICEGATE / GSTN Integration | ✅ |
| Policy Simulation Engine | ✅ |
| National Analytics Dashboard | ✅ |
| Multi-language (22 scheduled languages) | ✅ |
| Blockchain Audit Node Access | ✅ |
| Data Residency (India-only) | ✅ |
| Support | 24/7 dedicated team |

**Target:** DPIIT, GeM, CAG, State Governments, Defence

---

## 3. API Metering (Usage-Based)

Beyond tier-included calls:

| Monthly Volume | Price per Verification Call |
|----------------|---------------------------|
| 1 – 1,000 | ₹2.00 |
| 1,001 – 10,000 | ₹1.50 |
| 10,001 – 100,000 | ₹1.00 |
| 100,001 – 1,000,000 | ₹0.50 |
| 1,000,000+ | ₹0.25 (volume contract) |

### API Products

| API Endpoint | Credits per Call |
|-------------|-----------------|
| `/verify/supplier` | 1 credit |
| `/verify/product` | 1 credit |
| `/verify/bid` | 2 credits |
| `/verify/batch` | 1 credit per item |
| `/certificate/generate` | 3 credits |
| `/analytics/sector` | 5 credits |

---

## 4. Revenue Projections

### Year 1

| Revenue Stream | Assumptions | Annual Revenue |
|---------------|-------------|----------------|
| Professional Subscriptions | 500 subscribers × ₹99,990 | ₹5.0 Cr |
| Enterprise Subscriptions | 50 subscribers × ₹4,99,990 | ₹2.5 Cr |
| Government Contracts | 3 contracts × avg ₹2 Cr | ₹6.0 Cr |
| API Metering | 5M calls × avg ₹1.00 | ₹0.5 Cr |
| **Total Year 1** | | **₹14.0 Cr** |

### Year 3

| Revenue Stream | Assumptions | Annual Revenue |
|---------------|-------------|----------------|
| Professional Subscriptions | 5,000 × ₹99,990 | ₹50.0 Cr |
| Enterprise Subscriptions | 300 × ₹4,99,990 | ₹15.0 Cr |
| Government Contracts | 15 contracts × avg ₹3 Cr | ₹45.0 Cr |
| API Metering | 50M calls × avg ₹0.75 | ₹3.75 Cr |
| **Total Year 3** | | **₹113.75 Cr** |

---

## 5. Unit Economics

| Metric | Value |
|--------|-------|
| CAC (Government) | ₹5,00,000 |
| CAC (Enterprise) | ₹1,00,000 |
| CAC (Professional) | ₹10,000 |
| LTV (Government) | ₹2,00,00,000 (5-year) |
| LTV (Enterprise) | ₹30,00,000 (5-year) |
| LTV (Professional) | ₹5,00,000 (5-year) |
| LTV:CAC (Government) | 40:1 |
| LTV:CAC (Enterprise) | 30:1 |
| LTV:CAC (Professional) | 50:1 |
| Gross Margin | 85% |
| Payback Period | 3-6 months |
