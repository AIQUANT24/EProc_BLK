# NMICOV MVP — User Stories

## Document Control

| Field | Value |
|-------|-------|
| Document Title | MVP User Stories with Acceptance Criteria |
| Version | 1.0 |
| Sprint | Week 1 MVP |
| Last Updated | 2026-03-09 |

---

## Epic 1: Authentication & User Management

### US-1.1: User Signup

**As a** new user,
**I want to** sign up with my email and password,
**So that** I can access the NMICOV platform.

**Priority:** P0 | **Day:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | User can navigate to signup page from login screen |
| AC-2 | Email validation prevents invalid formats |
| AC-3 | Password must be at least 6 characters |
| AC-4 | Successful signup creates auth.users record and profiles record |
| AC-5 | Error message displayed if email already exists |
| AC-6 | User redirected to login after successful signup |

---

### US-1.2: User Login

**As a** registered user,
**I want to** log in with my email and password,
**So that** I can access my account.

**Priority:** P0 | **Day:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | User enters email and password |
| AC-2 | Supabase Auth validates credentials |
| AC-3 | JWT issued on successful login |
| AC-4 | User role fetched from user_roles table |
| AC-5 | User redirected to role-specific dashboard |
| AC-6 | Invalid credentials show error message |

---

### US-1.3: Role-Based Access Control

**As an** admin,
**I want to** assign roles to users,
**So that** they have appropriate access levels.

**Priority:** P0 | **Day:** 1

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Admin can assign role (admin/supplier/procurement) to user |
| AC-2 | User role stored in user_roles table |
| AC-3 | User session includes role information |
| AC-4 | Routes enforce role-based access |
| AC-5 | Unauthorized users redirected to dashboard |

---

## Epic 2: Supplier Management

### US-2.1: Supplier Registration

**As a** user with supplier role,
**I want to** register my company profile,
**So that** I can start adding products.

**Priority:** P0 | **Day:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Form includes: name, GST, PAN, sector, state, location |
| AC-2 | GST format validated (15 characters, valid pattern) |
| AC-3 | PAN format validated (10 characters, AAAAA0000A) |
| AC-4 | Supplier record linked to user_id |
| AC-5 | Success toast shown on registration |
| AC-6 | User can only register one supplier profile per account |

---

### US-2.2: View All Suppliers (Admin/Procurement)

**As an** admin or procurement officer,
**I want to** view a directory of all registered suppliers,
**So that** I can assess compliance across the ecosystem.

**Priority:** P0 | **Day:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier list displayed in data table |
| AC-2 | Columns: Name, GST, Sector, State, MSME Status, Status |
| AC-3 | Filter by sector, state, status |
| AC-4 | Search by supplier name or GST |
| AC-5 | Pagination (10/25/50 rows per page) |
| AC-6 | Click supplier row to view detail page |

---

### US-2.3: Edit Supplier Profile

**As a** supplier or admin,
**I want to** edit my supplier profile,
**So that** I can update company information.

**Priority:** P0 | **Day:** 2

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier can edit their own profile |
| AC-2 | Admin can edit any supplier profile |
| AC-3 | Changes saved to suppliers table |
| AC-4 | Updated_at timestamp updated |
| AC-5 | Success toast on save |

---

## Epic 3: Product Management

### US-3.1: Register Product

**As a** supplier,
**I want to** register a new product,
**So that** I can declare its Bill of Materials and get DVA certification.

**Priority:** P0 | **Day:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Form includes: product name, HSN code, category, estimated cost |
| AC-2 | HSN code validated (4-8 digits) |
| AC-3 | Estimated cost must be positive number |
| AC-4 | Product status defaults to 'draft' |
| AC-5 | Product linked to logged-in supplier |
| AC-6 | Product saved to products table |
| AC-7 | Redirect to product detail page after creation |

---

### US-3.2: View My Products

**As a** supplier,
**I want to** see a list of all my registered products,
**So that** I can manage them.

**Priority:** P0 | **Day:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Product list shows only products owned by logged-in supplier |
| AC-2 | Columns: Name, HSN, Category, Status, DVA Score, Classification |
| AC-3 | Filter by status (draft/submitted/verified) |
| AC-4 | Click product to open detail page |
| AC-5 | "Add Product" button visible |

---

### US-3.3: Edit Product (Draft Only)

**As a** supplier,
**I want to** edit product details before submission,
**So that** I can correct any mistakes.

**Priority:** P0 | **Day:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Edit button visible only for draft products |
| AC-2 | Form pre-populated with existing data |
| AC-3 | Save updates products table |
| AC-4 | Cannot edit submitted/verified products |

---

## Epic 4: BOM Management

### US-4.1: Add BOM Component

**As a** supplier,
**I want to** add a component to my product's BOM,
**So that** DVA can be calculated.

**Priority:** P0 | **Day:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Form includes: component name, origin (domestic/imported), cost |
| AC-2 | Origin selector shows "Domestic" and "Imported" options |
| AC-3 | Cost must be positive number |
| AC-4 | Component saved to bom_items table |
| AC-5 | BOM table updates immediately after save |
| AC-6 | DVA auto-calculated via trigger |

---

### US-4.2: View BOM with Totals

**As a** supplier,
**I want to** see my product's BOM with cost totals,
**So that** I can verify component costs.

**Priority:** P0 | **Day:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | BOM displayed as table (Component, Origin, Cost) |
| AC-2 | Total cost displayed at bottom |
| AC-3 | Domestic cost and imported cost shown separately |
| AC-4 | Empty state message if no components |

---

### US-4.3: Edit/Delete BOM Component

**As a** supplier,
**I want to** edit or delete BOM components,
**So that** I can correct my BOM.

**Priority:** P0 | **Day:** 3

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Edit icon on each BOM row |
| AC-2 | Edit dialog pre-populated with component data |
| AC-3 | Save updates bom_items table |
| AC-4 | Delete icon on each BOM row |
| AC-5 | Delete confirmation dialog shown |
| AC-6 | DVA recalculated after edit/delete |

---

## Epic 5: DVA Calculation & Classification

### US-5.1: Automatic DVA Calculation

**As the** system,
**I want to** automatically calculate DVA when BOM changes,
**So that** suppliers always see up-to-date compliance status.

**Priority:** P0 | **Day:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | DVA calculated via database trigger |
| AC-2 | Formula: DVA% = (Domestic Cost / Total Cost) × 100 |
| AC-3 | products.dva_score updated automatically |
| AC-4 | Record inserted into dva_calculations table |
| AC-5 | Calculation completes in < 1 second |

---

### US-5.2: Automatic Classification

**As the** system,
**I want to** assign PPP-MII classification based on DVA,
**So that** procurement can identify compliant suppliers.

**Priority:** P0 | **Day:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | DVA ≥ 50% → "Class I" |
| AC-2 | DVA ≥ 20% and < 50% → "Class II" |
| AC-3 | DVA < 20% → "Non-Local" |
| AC-4 | products.classification updated via trigger |
| AC-5 | Classification displayed on product page |

---

### US-5.3: View DVA Score & Breakdown

**As a** supplier,
**I want to** see my product's DVA score with cost breakdown,
**So that** I understand my compliance status.

**Priority:** P0 | **Day:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | DVA score displayed prominently (e.g., "62.5%") |
| AC-2 | Classification badge (Class I/II/Non-Local) |
| AC-3 | Cost breakdown: Total, Domestic, Imported |
| AC-4 | Color-coded: green (Class I), yellow (Class II), red (Non-Local) |

---

### US-5.4: Submit Product for Verification

**As a** supplier,
**I want to** submit my product for verification,
**So that** procurement officers can review it.

**Priority:** P0 | **Day:** 4

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | "Submit for Verification" button visible on draft products |
| AC-2 | At least 1 BOM component required to submit |
| AC-3 | Confirmation dialog before submission |
| AC-4 | Product status changed to 'submitted' |
| AC-5 | Product becomes read-only after submission |

---

## Epic 6: Compliance Dashboard

### US-6.1: Admin Dashboard

**As an** admin,
**I want to** see overall platform compliance statistics,
**So that** I can monitor the ecosystem.

**Priority:** P0 | **Day:** 5

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Total suppliers count |
| AC-2 | Breakdown by classification (Class I/II/Non-Local) |
| AC-3 | Pie chart showing classification distribution |
| AC-4 | Recent submissions list (last 10 products) |
| AC-5 | Filter by date range |

---

### US-6.2: Supplier Dashboard

**As a** supplier,
**I want to** see my products summary,
**So that** I can track my compliance status.

**Priority:** P0 | **Day:** 5

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Total products count |
| AC-2 | Products by status (draft/submitted/verified) |
| AC-3 | Average DVA score across products |
| AC-4 | List of pending actions (incomplete BOMs) |
| AC-5 | Quick link to add new product |

---

### US-6.3: Procurement Compliance View

**As a** procurement officer,
**I want to** view supplier compliance,
**So that** I can verify bids.

**Priority:** P0 | **Day:** 5

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | All suppliers list with classification |
| AC-2 | Filter by classification, sector |
| AC-3 | Search by supplier name, GST |
| AC-4 | Click supplier to view products |
| AC-5 | Product DVA scores visible |

---

## Epic 7: Audit Trail

### US-7.1: Audit Log Capture

**As the** system,
**I want to** log all critical user actions,
**So that** there is an immutable audit trail.

**Priority:** P0 | **Day:** 5

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Supplier creation logged |
| AC-2 | Product creation/update logged |
| AC-3 | BOM modifications logged |
| AC-4 | DVA calculations logged |
| AC-5 | Audit log includes: user_id, action, entity_type, entity_id, timestamp |

---

### US-7.2: View Audit Logs (Admin)

**As an** admin,
**I want to** view audit logs,
**So that** I can track platform activity.

**Priority:** P0 | **Day:** 5

**Acceptance Criteria:**

| # | Criteria |
|---|---------|
| AC-1 | Audit log page accessible to admin only |
| AC-2 | Logs displayed in table (timestamp, user, action, entity) |
| AC-3 | Filter by entity type, user, date range |
| AC-4 | Search by entity ID |
| AC-5 | Detail view shows full JSON payload |

---

## Priority Summary

| Priority | Stories | Day(s) |
|----------|---------|--------|
| P0 (Must Have) | 20 stories | Day 1-5 |

---

## Definition of Done (All Stories)

- [ ] Code implemented and committed
- [ ] Manual test passed
- [ ] RLS policies enforce security
- [ ] No console errors
- [ ] Responsive on desktop/tablet
- [ ] Success/error messages shown to user
- [ ] Data persisted in Supabase

---

## User Flow Summary

### Supplier Flow
```
1. Signup → Login
   ↓
2. Register supplier profile
   ↓
3. Create product
   ↓
4. Add BOM components
   ↓
5. DVA auto-calculated
   ↓
6. Submit for verification
   ↓
7. View DVA score & classification
```

### Procurement Flow
```
1. Login (admin assigns role)
   ↓
2. View compliance dashboard
   ↓
3. Filter suppliers by classification
   ↓
4. Review product DVA scores
   ↓
5. Verify compliance
```

### Admin Flow
```
1. Login
   ↓
2. Assign user roles
   ↓
3. View admin dashboard (analytics)
   ↓
4. Manage suppliers (edit/suspend)
   ↓
5. View audit logs
```
