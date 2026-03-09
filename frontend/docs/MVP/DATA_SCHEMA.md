# NMICOV MVP — Exact Data Schema

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Exact Database Schema (Supabase/PostgreSQL) |
| Version | 1.0 |
| Database | PostgreSQL 16+ (Supabase) |
| Last Updated | 2026-03-09 |

---

## 1. Schema Overview

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ auth.users   │────────►│  profiles    │◄────────│ user_roles   │
│ (Supabase)   │         │              │         │              │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │
                                │
                        ┌───────▼───────┐
                        │   suppliers   │
                        └───────┬───────┘
                                │
                        ┌───────▼───────┐         ┌──────────────┐
                        │   products    │◄────────│  bom_items   │
                        └───┬───────────┘         └──────────────┘
                            │
                            │
                    ┌───────▼──────────┐
                    │ dva_calculations │
                    └──────────────────┘

                    ┌──────────────┐
                    │  audit_logs  │ (references all entities)
                    └──────────────┘
```

---

## 2. Tables

### 2.1 Profiles (extends auth.users)

```sql
-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

### 2.2 User Roles

```sql
-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'supplier', 'procurement');

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
```

---

### 2.3 Suppliers

```sql
-- Supplier status enum
CREATE TYPE public.supplier_status AS ENUM ('active', 'pending', 'suspended');

-- MSME status enum
CREATE TYPE public.msme_status AS ENUM ('Micro', 'Small', 'Medium', 'Large');

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gst_number TEXT NOT NULL UNIQUE,
  pan TEXT NOT NULL,
  udyam_number TEXT,
  msme_status public.msme_status NOT NULL DEFAULT 'Small',
  sector TEXT NOT NULL,
  state TEXT NOT NULL,
  location TEXT NOT NULL,
  status public.supplier_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT gst_format CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  CONSTRAINT pan_format CHECK (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Suppliers can view their own data"
  ON public.suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Suppliers can update their own data"
  ON public.suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all suppliers"
  ON public.suppliers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Procurement can view all suppliers"
  ON public.suppliers FOR SELECT
  USING (public.has_role(auth.uid(), 'procurement'));

CREATE POLICY "Admins can insert suppliers"
  ON public.suppliers FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all suppliers"
  ON public.suppliers FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_suppliers_gst ON public.suppliers(gst_number);
CREATE INDEX idx_suppliers_status ON public.suppliers(status);
CREATE INDEX idx_suppliers_sector ON public.suppliers(sector);
CREATE INDEX idx_suppliers_state ON public.suppliers(state);

-- Trigger for updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

### 2.4 Products

```sql
-- Product status enum
CREATE TYPE public.product_status AS ENUM ('draft', 'submitted', 'verified');

-- Classification enum
CREATE TYPE public.classification_type AS ENUM ('Class I', 'Class II', 'Non-Local');

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hsn_code TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_cost NUMERIC(15, 2) NOT NULL CHECK (estimated_cost > 0),
  status public.product_status NOT NULL DEFAULT 'draft',
  dva_score NUMERIC(5, 2) CHECK (dva_score >= 0 AND dva_score <= 100),
  classification public.classification_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT hsn_format CHECK (hsn_code ~ '^[0-9]{4,8}$')
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Suppliers can view their own products"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = products.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = products.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update their own products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = products.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can delete their own draft products"
  ON public.products FOR DELETE
  USING (
    status = 'draft' AND
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = products.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Procurement can view all products"
  ON public.products FOR SELECT
  USING (public.has_role(auth.uid(), 'procurement'));

CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_classification ON public.products(classification);
CREATE INDEX idx_products_hsn_code ON public.products(hsn_code);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

### 2.5 BOM Items

```sql
-- Origin enum
CREATE TYPE public.origin_type AS ENUM ('domestic', 'imported');

-- BOM items table
CREATE TABLE public.bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  origin public.origin_type NOT NULL,
  cost NUMERIC(15, 2) NOT NULL CHECK (cost > 0),
  supplier_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Suppliers can view their product BOM items"
  ON public.bom_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.suppliers ON suppliers.id = products.supplier_id
      WHERE products.id = bom_items.product_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can insert BOM items for their products"
  ON public.bom_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.suppliers ON suppliers.id = products.supplier_id
      WHERE products.id = bom_items.product_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update their product BOM items"
  ON public.bom_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.suppliers ON suppliers.id = products.supplier_id
      WHERE products.id = bom_items.product_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can delete their product BOM items"
  ON public.bom_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.suppliers ON suppliers.id = products.supplier_id
      WHERE products.id = bom_items.product_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Procurement can view all BOM items"
  ON public.bom_items FOR SELECT
  USING (public.has_role(auth.uid(), 'procurement'));

CREATE POLICY "Admins can view all BOM items"
  ON public.bom_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_bom_items_product_id ON public.bom_items(product_id);
CREATE INDEX idx_bom_items_origin ON public.bom_items(origin);

-- Trigger for updated_at
CREATE TRIGGER update_bom_items_updated_at
  BEFORE UPDATE ON public.bom_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

### 2.6 DVA Calculations

```sql
-- DVA calculations table
CREATE TABLE public.dva_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_cost NUMERIC(15, 2) NOT NULL,
  domestic_cost NUMERIC(15, 2) NOT NULL,
  dva_percentage NUMERIC(5, 2) NOT NULL CHECK (dva_percentage >= 0 AND dva_percentage <= 100),
  classification public.classification_type NOT NULL,
  calculated_by UUID REFERENCES public.profiles(id),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dva_calculations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Suppliers can view their product DVA calculations"
  ON public.dva_calculations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.suppliers ON suppliers.id = products.supplier_id
      WHERE products.id = dva_calculations.product_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert DVA calculations"
  ON public.dva_calculations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Procurement can view all DVA calculations"
  ON public.dva_calculations FOR SELECT
  USING (public.has_role(auth.uid(), 'procurement'));

CREATE POLICY "Admins can view all DVA calculations"
  ON public.dva_calculations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_dva_calculations_product_id ON public.dva_calculations(product_id);
CREATE INDEX idx_dva_calculations_classification ON public.dva_calculations(classification);
CREATE INDEX idx_dva_calculations_calculated_at ON public.dva_calculations(calculated_at);
```

---

### 2.7 Audit Logs

```sql
-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
```

---

## 3. Helper Functions

### 3.1 Update Timestamp Trigger Function

```sql
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### 3.2 DVA Calculation Function

```sql
-- Function to calculate DVA for a product
CREATE OR REPLACE FUNCTION public.calculate_dva(p_product_id UUID)
RETURNS TABLE (
  dva_percentage NUMERIC,
  classification TEXT,
  total_cost NUMERIC,
  domestic_cost NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_cost NUMERIC := 0;
  v_domestic_cost NUMERIC := 0;
  v_dva_percentage NUMERIC := 0;
  v_classification TEXT;
BEGIN
  -- Calculate total and domestic costs
  SELECT 
    COALESCE(SUM(cost), 0),
    COALESCE(SUM(CASE WHEN origin = 'domestic' THEN cost ELSE 0 END), 0)
  INTO v_total_cost, v_domestic_cost
  FROM public.bom_items
  WHERE product_id = p_product_id;
  
  -- Calculate DVA percentage
  IF v_total_cost > 0 THEN
    v_dva_percentage := (v_domestic_cost / v_total_cost) * 100;
  ELSE
    v_dva_percentage := 0;
  END IF;
  
  -- Determine classification
  IF v_dva_percentage >= 50 THEN
    v_classification := 'Class I';
  ELSIF v_dva_percentage >= 20 THEN
    v_classification := 'Class II';
  ELSE
    v_classification := 'Non-Local';
  END IF;
  
  RETURN QUERY SELECT 
    v_dva_percentage,
    v_classification,
    v_total_cost,
    v_domestic_cost;
END;
$$;
```

---

## 4. Database Triggers

### 4.1 Auto-calculate DVA on BOM Change

```sql
-- Trigger to auto-calculate DVA when BOM is modified
CREATE OR REPLACE FUNCTION public.trigger_dva_calculation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dva_result RECORD;
BEGIN
  -- Calculate DVA
  SELECT * INTO v_dva_result
  FROM public.calculate_dva(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.product_id
      ELSE NEW.product_id
    END
  );
  
  -- Update product table
  UPDATE public.products
  SET 
    dva_score = v_dva_result.dva_percentage,
    classification = v_dva_result.classification::public.classification_type,
    updated_at = now()
  WHERE id = (
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.product_id
      ELSE NEW.product_id
    END
  );
  
  -- Insert calculation record
  INSERT INTO public.dva_calculations (
    product_id,
    total_cost,
    domestic_cost,
    dva_percentage,
    classification,
    calculated_by
  ) VALUES (
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.product_id
      ELSE NEW.product_id
    END,
    v_dva_result.total_cost,
    v_dva_result.domestic_cost,
    v_dva_result.dva_percentage,
    v_dva_result.classification::public.classification_type,
    auth.uid()
  );
  
  RETURN NEW;
END;
$$;

-- Attach trigger to bom_items table
CREATE TRIGGER auto_calculate_dva_on_bom_insert
  AFTER INSERT ON public.bom_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_dva_calculation();

CREATE TRIGGER auto_calculate_dva_on_bom_update
  AFTER UPDATE ON public.bom_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_dva_calculation();

CREATE TRIGGER auto_calculate_dva_on_bom_delete
  AFTER DELETE ON public.bom_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_dva_calculation();
```

### 4.2 Audit Log Triggers

```sql
-- Function to log supplier changes
CREATE OR REPLACE FUNCTION public.log_supplier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    'supplier',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_supplier_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_supplier_change();

-- Function to log product changes
CREATE OR REPLACE FUNCTION public.log_product_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    'product',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_product_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.log_product_change();
```

---

## 5. Seed Data

### 5.1 Admin User

```sql
-- Insert admin role for first user (manual setup after first signup)
-- Replace 'USER_UUID_HERE' with actual UUID from auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'admin');
```

### 5.2 Test Data

```sql
-- Sample supplier
INSERT INTO public.suppliers (user_id, name, gst_number, pan, msme_status, sector, state, location, status)
VALUES (
  'SUPPLIER_USER_UUID',
  'Test Industries Pvt Ltd',
  '27AABCU9603R1ZM',
  'AABCU9603R',
  'Medium',
  'Electrical Equipment',
  'Maharashtra',
  'Pune',
  'active'
);
```

---

## 6. Migration Summary

```sql
-- Complete migration script order:
-- 1. Create enums
-- 2. Create update_updated_at_column function
-- 3. Create profiles table
-- 4. Create user_roles table + has_role function
-- 5. Create suppliers table
-- 6. Create products table
-- 7. Create bom_items table
-- 8. Create dva_calculations table
-- 9. Create audit_logs table
-- 10. Create calculate_dva function
-- 11. Create trigger functions (DVA, audit)
-- 12. Attach triggers

-- Total Tables: 7
-- Total Functions: 6
-- Total Triggers: 8
-- Total Policies: 28
```

---

## 7. Data Types Summary

| Table | Enums Used |
|-------|-----------|
| `user_roles` | `app_role` |
| `suppliers` | `supplier_status`, `msme_status` |
| `products` | `product_status`, `classification_type` |
| `bom_items` | `origin_type` |
| `dva_calculations` | `classification_type` |

---

## 8. Storage Requirements (Estimated)

| Table | Rows (MVP) | Avg Row Size | Total Size |
|-------|-----------|--------------|------------|
| `profiles` | 20 | 500 bytes | 10 KB |
| `user_roles` | 20 | 100 bytes | 2 KB |
| `suppliers` | 10 | 800 bytes | 8 KB |
| `products` | 30 | 600 bytes | 18 KB |
| `bom_items` | 150 | 400 bytes | 60 KB |
| `dva_calculations` | 30 | 300 bytes | 9 KB |
| `audit_logs` | 200 | 500 bytes | 100 KB |

**Total MVP Database Size:** ~200 KB (excluding indexes)
