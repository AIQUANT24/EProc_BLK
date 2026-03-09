# NMICOV — Cloud Migration & Infrastructure Plan

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Cloud Migration Plan |
| Version | 1.1 |
| Last Updated | 2026-03-09 |

---

## 1. Current State

| Component | Current | Target |
|-----------|---------|--------|
| Frontend | React + Vite + Tailwind | Same (optimized) |
| Backend | Mock data (in-memory) | Lovable Cloud (PostgreSQL + Edge Functions) |
| Authentication | Simulated RBAC | Cloud Auth (email, Google, OTP) |
| Database | None (context state) | PostgreSQL via Cloud |
| Blockchain | In-memory simulation | Persisted ledger + future Hyperledger |
| File Storage | None | Cloud Storage (certificates, BOM imports) |
| API | Simulated | Edge Functions (serverless) |

---

## 2. Database Schema

### Core Tables

```sql
-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  gst_number TEXT,
  pan_number TEXT,
  udyam_number TEXT,
  organization_type TEXT,
  manufacturing_location TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hsn_code TEXT,
  category TEXT,
  estimated_cost NUMERIC,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Components (BOM items)
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('domestic', 'imported')),
  cost NUMERIC NOT NULL,
  supplier_name TEXT,
  parent_component_id UUID REFERENCES components(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DVA Results
CREATE TABLE dva_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  dva_score NUMERIC NOT NULL,
  classification TEXT NOT NULL,
  confidence_score NUMERIC,
  risk_score NUMERIC,
  calculation_details JSONB,
  blockchain_tx_hash TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Records
CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  dva_result_id UUID REFERENCES dva_results(id),
  status TEXT NOT NULL,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Risk Alerts
CREATE TABLE risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'active',
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blockchain Ledger
CREATE TABLE blockchain_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number BIGINT NOT NULL,
  event TEXT NOT NULL,
  entity TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  data_hash TEXT NOT NULL,
  previous_hash TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Verification Logs
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  requested_by TEXT NOT NULL,
  dva_score NUMERIC,
  classification TEXT,
  confidence_score NUMERIC,
  risk_score NUMERIC,
  compliance_status TEXT,
  blockchain_tx_hash TEXT,
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles (RBAC)
CREATE TYPE app_role AS ENUM ('admin', 'procurement', 'supplier');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

### Row-Level Security

```sql
-- Suppliers: users see their own, procurement/admin see all
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view own" ON suppliers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'procurement'));

-- Products: suppliers see own, others see all
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products visible to relevant roles" ON products
  FOR SELECT TO authenticated
  USING (
    supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'procurement')
  );
```

---

## 3. Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `calculate-dva` | Run DVA engine on product BOM | POST from BOM page |
| `run-fraud-check` | Execute fraud detection rules | POST from BOM page |
| `verify-compliance` | Verification API endpoint | POST from Verification page / external |
| `generate-certificate` | Create PDF compliance certificate | GET from Compliance page |
| `anchor-blockchain` | Record event to blockchain ledger | Internal (after DVA/verification) |

---

## 4. Migration Steps

### Step 1: Database Setup
- Create all tables via migrations
- Enable RLS on all tables
- Create `has_role` security definer function
- Seed initial data

### Step 2: Auth Migration
- Replace mock AuthContext with Cloud auth
- Implement signup/login/logout
- Implement role assignment on signup
- Add profile creation trigger

### Step 3: Data Layer Migration
- Replace MockDataContext with real database queries
- Use @tanstack/react-query for data fetching
- Implement optimistic updates

### Step 4: Edge Functions
- Deploy DVA calculation as edge function
- Deploy fraud detection as edge function
- Deploy verification API as public edge function
- Deploy certificate generation

### Step 5: Storage
- Set up Cloud Storage for BOM imports (CSV/Excel)
- Set up storage for compliance certificate PDFs
- Configure upload policies

---

## 5. Infrastructure Requirements

### Production Deployment

| Component | Specification |
|-----------|--------------|
| Database | PostgreSQL 15+ |
| Compute | Edge Functions (serverless) |
| Storage | Cloud Storage (S3-compatible) |
| CDN | Global edge network |
| SSL/TLS | Automatic certificate management |
| Monitoring | Built-in Cloud monitoring |
| Backup | Daily automated backups |
| Data Residency | India region |

### Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms (p95) |
| Dashboard Load | < 2s |
| DVA Calculation | < 500ms |
| Verification API | < 1s |
| Uptime | 99.9% |
| Concurrent Users | 10,000+ |
