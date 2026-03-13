# NMICOV MVP — Product Requirements Document

## Document Control

| Field          | Value                           |
| -------------- | ------------------------------- |
| Document Title | NMICOV MVP Product Requirements |
| Version        | 1.0                             |
| Status         | Planning                        |
| Timeline       | 1 Week (5 Working Days)         |
| Last Updated   | 2026-03-09                      |

---

## 1. Executive Summary

The NMICOV MVP is a **minimum viable product** designed to be built in **5 working days** that demonstrates the core value proposition of automated Make-in-India compliance verification. This MVP focuses on the essential workflow: **Supplier → Product → BOM → DVA → Compliance Status**.

### MVP Objective

Build a functional, database-backed application that allows:

- Suppliers to register products and declare Bill of Materials
- Automatic DVA calculation and PPP-MII classification
- Procurement officers to view and verify supplier compliance
- Admins to manage users and view audit logs

---

## 2. Scope Definition

### In Scope (MVP)

| #   | Feature                                            | Priority |
| --- | -------------------------------------------------- | -------- |
| 1   | Real authentication with Supabase (email/password) | P0       |
| 2   | 3 user roles: Admin, Supplier, Procurement Officer | P0       |
| 3   | Supplier registration with basic KYC fields        | P0       |
| 4   | Product registration with HSN code                 | P0       |
| 5   | Single-tier BOM declaration                        | P0       |
| 6   | Automatic DVA calculation                          | P0       |
| 7   | PPP-MII classification (Class I/II/Non-Local)      | P0       |
| 8   | Compliance dashboard with basic analytics          | P0       |
| 9   | Supplier/Product CRUD operations                   | P0       |
| 10  | Basic audit trail (user actions logged)            | P0       |
| 11  | Role-based access control (RLS policies)           | P0       |
| 12  | Responsive UI with Tailwind + Shadcn               | P0       |

### ❌ Out of Scope (Post-MVP)

| Feature                | Reason                       | Future Phase |
| ---------------------- | ---------------------------- | ------------ |
| Multi-tier BOM         | Complexity                   | Phase 2      |
| Fraud detection engine | Advanced logic               | Phase 2      |
| Blockchain ledger      | Integration overhead         | Phase 3      |
| Confidence scoring     | Requires external APIs       | Phase 2      |
| What-if analysis       | Secondary feature            | Phase 2      |
| Verification API       | External integration         | Phase 3      |
| Risk alerts            | Derived from fraud detection | Phase 2      |
| Multi-language support | i18n setup                   | Phase 2      |
| Email notifications    | Infrastructure setup         | Phase 2      |
| BOM import (CSV/Excel) | File processing              | Phase 2      |
| PDF certificate export | Report generation            | Phase 2      |

---

## 3. User Personas (Simplified)

### 3.1 Admin User

**Goal:** Manage platform users and monitor overall compliance

- Create/edit/delete users
- Assign roles
- View audit logs
- Access full compliance dashboard

### 3.2 Supplier

**Goal:** Register products, declare BOM, get compliance certification

- Register supplier profile (one-time)
- Add products with specifications
- Declare BOM components with origin
- View DVA score and classification

### 3.3 Procurement Officer

**Goal:** Verify supplier compliance

- View all registered suppliers
- Filter by classification, sector
- View product DVA scores
- Access compliance reports

---

## 4. Core Features Specification

### 4.1 Authentication & Authorization

**Technology:** Supabase Auth

| Feature            | Description                         |
| ------------------ | ----------------------------------- |
| Sign Up            | Email + password registration       |
| Login              | Email + password authentication     |
| Role Assignment    | Admin assigns role on user creation |
| Session Management | JWT-based sessions                  |
| Protected Routes   | Role-based route protection         |

**Roles:**

- `admin` — Full platform access
- `supplier` — Product/BOM management only
- `procurement` — Read-only compliance view

### 4.2 Supplier Management

**Table:** `suppliers`

| Field        | Type | Required | Notes                    |
| ------------ | ---- | -------- | ------------------------ |
| id           | UUID | Yes      | Primary key              |
| user_id      | UUID | Yes      | FK to profiles           |
| name         | Text | Yes      | Legal entity name        |
| gst_number   | Text | Yes      | 15-char GST format       |
| pan          | Text | Yes      | 10-char PAN format       |
| udyam_number | Text | No       | MSME registration        |
| msme_status  | Enum | Yes      | Micro/Small/Medium/Large |
| sector       | Text | Yes      | Industry sector          |
| state        | Text | Yes      | Registered state         |
| location     | Text | Yes      | City/district            |
| status       | Enum | Yes      | active/pending/suspended |

**Operations:**

- Supplier self-registration (one supplier per user)
- Admin can edit/suspend supplier
- View supplier profile with products

### 4.3 Product Registration

**Table:** `products`

| Field          | Type    | Required | Notes                    |
| -------------- | ------- | -------- | ------------------------ |
| id             | UUID    | Yes      | Primary key              |
| supplier_id    | UUID    | Yes      | FK to suppliers          |
| name           | Text    | Yes      | Product name             |
| hsn_code       | Text    | Yes      | 4-8 digit HSN            |
| category       | Text    | Yes      | Product category         |
| estimated_cost | Numeric | Yes      | Total product cost       |
| status         | Enum    | Yes      | draft/submitted/verified |
| dva_score      | Numeric | No       | Auto-calculated          |
| classification | Enum    | No       | Class I/II/Non-Local     |

**Operations:**

- Supplier creates product
- Edit product (if draft)
- Submit for verification
- View DVA score and classification

### 4.4 Bill of Materials (Single-Tier)

**Table:** `bom_items`

| Field          | Type    | Required | Notes                 |
| -------------- | ------- | -------- | --------------------- |
| id             | UUID    | Yes      | Primary key           |
| product_id     | UUID    | Yes      | FK to products        |
| component_name | Text    | Yes      | Component description |
| origin         | Enum    | Yes      | domestic/imported     |
| cost           | Numeric | Yes      | Component cost        |
| supplier_name  | Text    | No       | Component supplier    |

**Operations:**

- Add component to product BOM
- Edit component (cost, origin)
- Delete component
- View BOM summary

**Constraints:**

- Sum of component costs should approximately match product estimated cost
- At least 1 component required to calculate DVA

### 4.5 DVA Calculation Engine

**Formula:**

```
DVA% = (Σ Domestic Component Costs / Σ Total Component Costs) × 100
```

**Classification Rules:**
| DVA Range | Classification |
|-----------|----------------|
| ≥ 50% | Class I Local Supplier |
| ≥ 20% and < 50% | Class II Local Supplier |
| < 20% | Non-Local Supplier |

**Trigger:**

- Auto-calculate when BOM is modified
- Store result in `dva_calculations` table
- Update `products.dva_score` and `products.classification`

### 4.6 Compliance Dashboard

**Admin Dashboard:**

- Total suppliers count
- Breakdown by classification (Class I/II/Non-Local)
- Pie chart showing distribution
- Recent submissions list

**Supplier Dashboard:**

- My products status
- DVA scores at a glance
- Pending actions

**Procurement Dashboard:**

- Supplier directory with filters
- Product compliance status
- Search by supplier name, GST, sector

### 4.7 Audit Trail

**Table:** `audit_logs`

| Field       | Type        | Notes                   |
| ----------- | ----------- | ----------------------- |
| id          | UUID        | Primary key             |
| user_id     | UUID        | FK to profiles          |
| action      | Text        | e.g., "created_product" |
| entity_type | Text        | e.g., "product"         |
| entity_id   | Text        | Entity UUID             |
| details     | JSONB       | Additional metadata     |
| created_at  | Timestamptz | Event timestamp         |

**Logged Actions:**

- User signup
- Supplier registration
- Product creation/update
- BOM modification
- DVA calculation

---

## 5. User Workflows

### 5.1 Supplier Onboarding Flow

```
1. User signs up (email + password)
   ↓
2. Admin assigns "supplier" role
   ↓
3. Supplier completes profile (GST, PAN, sector, etc.)
   ↓
4. Supplier profile status → "active"
```

### 5.2 Product Compliance Flow

```
1. Supplier creates product (name, HSN, category, cost)
   ↓
2. Supplier adds BOM components (name, origin, cost)
   ↓
3. System calculates DVA% automatically
   ↓
4. System assigns classification (Class I/II/Non-Local)
   ↓
5. Product status → "submitted"
   ↓
6. Procurement officer views compliance on dashboard
```

---

## 6. Non-Functional Requirements

| Category            | Requirement                                    |
| ------------------- | ---------------------------------------------- |
| **Performance**     | Page load < 2s; DVA calculation < 1s           |
| **Scalability**     | Support 100 suppliers, 500 products (MVP)      |
| **Security**        | RLS policies on all tables; role-based access  |
| **Data Residency**  | Supabase hosted in India region (if available) |
| **Accessibility**   | WCAG 2.1 AA compliance (basic)                 |
| **Browser Support** | Chrome, Firefox, Safari (latest versions)      |

---

## 7. Technical Constraints

| Constraint           | Details                            |
| -------------------- | ---------------------------------- |
| **Backend**          | Supabase (PostgreSQL + Auth + RLS) |
| **Frontend**         | React 18 + TypeScript + Vite       |
| **UI Framework**     | Tailwind CSS + Shadcn/UI           |
| **State Management** | TanStack Query (React Query)       |
| **Deployment**       | Lovable Cloud / Vercel             |
| **Database**         | PostgreSQL 16+ via Supabase        |

---

## 8. Success Criteria

The MVP is considered **successful** if:

1.  A supplier can register, create a product, and declare BOM in < 5 minutes
2.  DVA calculation is automatic and displays correct classification
3.  Procurement officer can view and filter suppliers by compliance status
4.  All user actions are logged in audit trail
5.  RLS policies prevent unauthorized data access
6.  UI is responsive on desktop and tablet

---

## 9. Out of Scope (Explicitly Deferred)

- Google/OAuth login (use email/password only)
- Password reset flow (Supabase default)
- Profile picture upload
- Advanced search/filters
- Data export (CSV/PDF)
- Real-time notifications
- Email notifications
- GSTN/ICEGATE integration
- Blockchain integration
- Multi-language support
- Mobile app

---

## 10. Post-MVP Roadmap

### Week 2-3: Enhanced Features

- Multi-tier BOM support
- Confidence scoring
- What-if analysis
- Fraud detection (basic rules)

### Week 4-6: Integration

- Verification API for GeM
- Email notifications
- BOM CSV import
- PDF compliance certificate

### Month 2+: Advanced

- Blockchain integration
- AI fraud detection
- GSTN integration
- Policy simulation

---

## 11. Acceptance Criteria

| #     | Criteria                                    | Verification Method  |
| ----- | ------------------------------------------- | -------------------- |
| AC-1  | User can sign up and log in                 | Manual test          |
| AC-2  | Admin can create supplier users             | Manual test          |
| AC-3  | Supplier can register profile with GST/PAN  | Form validation test |
| AC-4  | Supplier can create product and add BOM     | CRUD test            |
| AC-5  | DVA calculates automatically on BOM change  | Unit test            |
| AC-6  | Classification is correct per PPP-MII rules | Unit test            |
| AC-7  | Procurement officer can view all suppliers  | UI test              |
| AC-8  | RLS policies prevent cross-role data access | Security test        |
| AC-9  | Audit log captures all critical actions     | Database query       |
| AC-10 | UI is responsive on tablet/desktop          | Visual test          |

---

## Appendix A: Assumptions

1. Supabase project is provisioned with Lovable Cloud
2. Admin user is seeded manually or via migration
3. Suppliers are verified externally (KYC deferred)
4. HSN codes are validated via format, not API
5. Component costs are self-declared (no verification)
6. DVA calculation is synchronous (no async queue)
7. No email verification required for signup

---

## Appendix B: Risks & Mitigations

| Risk                        | Impact | Mitigation                                 |
| --------------------------- | ------ | ------------------------------------------ |
| Supabase RLS complexity     | High   | Use architecture agent for secure policies |
| DVA calculation edge cases  | Medium | Comprehensive unit tests                   |
| User role confusion         | Medium | Clear onboarding flow                      |
| Data validation errors      | Low    | Client + server validation                 |
| Performance with large BOMs | Low    | Limit BOM items (MVP: max 50)              |
