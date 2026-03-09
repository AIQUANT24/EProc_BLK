# NMICOV MVP — 1-Week Sprint Plan

## Document Control

| Field | Value |
|-------|-------|
| Document Title | 1-Week Sprint Plan |
| Version | 1.0 |
| Sprint Duration | 5 Working Days |
| Team Size | 1-2 Developers |
| Last Updated | 2026-03-09 |

---

## Sprint Overview

**Sprint Goal:** Deliver a functional, database-backed NMICOV MVP with core supplier compliance workflow

**Sprint Duration:** 5 working days (Monday - Friday)

**Definition of Done:**
- All features deployed to Lovable Cloud
- Database schema migrated with RLS policies
- 20+ tests passing
- Manual end-to-end test completed
- Documentation updated

---

## Day 1 (Monday): Foundation & Auth

### Morning (9 AM - 12 PM)

#### Task 1.1: Database Setup (2 hours)
- [ ] Create Supabase migration file
- [ ] Define all 7 tables (profiles, user_roles, suppliers, products, bom_items, dva_calculations, audit_logs)
- [ ] Create enums (app_role, supplier_status, msme_status, product_status, classification_type, origin_type)
- [ ] Create helper functions (update_updated_at_column, has_role)
- [ ] Apply migration via Lovable Cloud

**Deliverable:** Database schema live with all tables

#### Task 1.2: RLS Policies (1 hour)
- [ ] Write RLS policies for all 7 tables
- [ ] Test policies with multiple user scenarios
- [ ] Document policy logic

**Deliverable:** Secure database with row-level security

### Afternoon (1 PM - 5 PM)

#### Task 1.3: Authentication Pages (2 hours)
- [ ] Update Login page (connect to Supabase Auth)
- [ ] Update Signup page (email + password)
- [ ] Create auth context/hooks
- [ ] Implement protected route wrapper
- [ ] Test signup → login flow

**Deliverable:** Working authentication

#### Task 1.4: User Roles System (1.5 hours)
- [ ] Implement has_role function
- [ ] Create admin role assignment (manual for first user)
- [ ] Update AuthContext to fetch user role
- [ ] Role-based dashboard routing

**Deliverable:** Role-based access control

#### Task 1.5: Base Layout (0.5 hours)
- [ ] Update AppLayout with Supabase auth
- [ ] Sidebar navigation (role-based menu items)
- [ ] Logout functionality

**Deliverable:** Authenticated app shell

### End of Day 1 Checklist
- [ ] Database migrated with 7 tables
- [ ] RLS policies active
- [ ] Users can sign up and log in
- [ ] Roles assigned and checked
- [ ] App shell renders for authenticated users

---

## Day 2 (Tuesday): Supplier Management

### Morning (9 AM - 12 PM)

#### Task 2.1: Profiles Table Integration (1 hour)
- [ ] Create profile on signup (trigger or manual)
- [ ] Profile view page
- [ ] Edit profile form
- [ ] Update profile API calls

**Deliverable:** User profile management

#### Task 2.2: Supplier Registration (2 hours)
- [ ] Supplier registration form component
- [ ] GST/PAN validation (regex)
- [ ] Connect to suppliers table
- [ ] Create supplier on form submit
- [ ] Link supplier to user_id

**Deliverable:** Suppliers can register

### Afternoon (1 PM - 5 PM)

#### Task 2.3: Supplier List View (1.5 hours)
- [ ] Supplier list page (admin + procurement)
- [ ] DataTable component with Supabase query
- [ ] Filters (status, sector, state)
- [ ] Search by name, GST

**Deliverable:** Supplier directory

#### Task 2.4: Supplier Detail View (1 hour)
- [ ] Supplier profile detail page
- [ ] Display all supplier fields
- [ ] List products by supplier
- [ ] Edit supplier (admin only)

**Deliverable:** Supplier detail view

#### Task 2.5: Supplier CRUD (1.5 hours)
- [ ] Edit supplier dialog
- [ ] Update supplier status (admin)
- [ ] Validation on edit
- [ ] Toast notifications

**Deliverable:** Full supplier CRUD

### End of Day 2 Checklist
- [ ] Suppliers can register profile
- [ ] Admin can view all suppliers
- [ ] Filters and search work
- [ ] Edit supplier functional
- [ ] Data persisted in Supabase

---

## Day 3 (Wednesday): Product & BOM Management

### Morning (9 AM - 12 PM)

#### Task 3.1: Product Registration (2 hours)
- [ ] Product creation form
- [ ] HSN code validation
- [ ] Connect to products table
- [ ] Link to logged-in supplier
- [ ] Product status workflow (draft → submitted)

**Deliverable:** Suppliers can create products

#### Task 3.2: Product List (1 hour)
- [ ] My Products page (supplier view)
- [ ] Product list with filters (status)
- [ ] Product status badges
- [ ] Link to product detail

**Deliverable:** Product list view

### Afternoon (1 PM - 5 PM)

#### Task 3.3: BOM Management UI (2.5 hours)
- [ ] Product detail page with BOM section
- [ ] Add BOM component form
- [ ] BOM items table (component name, origin, cost)
- [ ] Edit BOM component
- [ ] Delete BOM component
- [ ] Real-time BOM cost totals

**Deliverable:** BOM CRUD interface

#### Task 3.4: Product CRUD Complete (1.5 hours)
- [ ] Edit product dialog
- [ ] Delete product (draft only)
- [ ] Validation (HSN format, cost > 0)
- [ ] Toast notifications

**Deliverable:** Full product CRUD

### End of Day 3 Checklist
- [ ] Suppliers can create products
- [ ] BOM components can be added/edited/deleted
- [ ] Product list shows all user products
- [ ] Data persisted in Supabase
- [ ] Total BOM cost calculated

---

## Day 4 (Thursday): DVA Engine & Compliance

### Morning (9 AM - 12 PM)

#### Task 4.1: DVA Calculation Function (2 hours)
- [ ] Create calculate_dva SQL function
- [ ] Test with sample data
- [ ] Handle edge cases (zero components, zero cost)
- [ ] Verify classification logic

**Deliverable:** DVA calculation function

#### Task 4.2: Auto-trigger DVA on BOM Change (1 hour)
- [ ] Create trigger function (trigger_dva_calculation)
- [ ] Attach to bom_items INSERT/UPDATE/DELETE
- [ ] Update products.dva_score and classification
- [ ] Insert record in dva_calculations table
- [ ] Test trigger with live data

**Deliverable:** Automatic DVA calculation

### Afternoon (1 PM - 5 PM)

#### Task 4.3: DVA Display (1.5 hours)
- [ ] Show DVA score on product detail page
- [ ] Classification badge (Class I/II/Non-Local)
- [ ] DVA calculation history
- [ ] Cost breakdown (domestic vs imported)

**Deliverable:** DVA results visible to suppliers

#### Task 4.4: Product Submission Workflow (1 hour)
- [ ] "Submit for Verification" button
- [ ] Update product status to "submitted"
- [ ] Prevent editing after submission
- [ ] Confirmation dialog

**Deliverable:** Product submission flow

#### Task 4.5: Compliance View (1.5 hours)
- [ ] Procurement officer compliance page
- [ ] Product list with DVA scores
- [ ] Filter by classification
- [ ] Supplier compliance summary

**Deliverable:** Procurement compliance view

### End of Day 4 Checklist
- [ ] DVA auto-calculates on BOM change
- [ ] Classification assigned correctly
- [ ] Products can be submitted
- [ ] Procurement can view compliance status
- [ ] DVA calculations logged

---

## Day 5 (Friday): Dashboards, Audit, Polish

### Morning (9 AM - 12 PM)

#### Task 5.1: Admin Dashboard (1.5 hours)
- [ ] Supplier count stats
- [ ] Classification pie chart (Class I/II/Non-Local)
- [ ] Recent submissions table
- [ ] Product compliance breakdown

**Deliverable:** Admin analytics dashboard

#### Task 5.2: Supplier Dashboard (1 hour)
- [ ] My products summary
- [ ] DVA score at a glance
- [ ] Pending actions (incomplete BOMs)

**Deliverable:** Supplier dashboard

#### Task 5.3: Procurement Dashboard (0.5 hours)
- [ ] Compliance overview
- [ ] Quick search
- [ ] Filter by classification

**Deliverable:** Procurement dashboard

### Afternoon (1 PM - 5 PM)

#### Task 5.4: Audit Trail (1.5 hours)
- [ ] Create audit log triggers (suppliers, products, BOM)
- [ ] Audit log viewer page (admin only)
- [ ] Filter by entity type, user, date
- [ ] Detail view with JSON diff

**Deliverable:** Audit log system

#### Task 5.5: Testing & Bug Fixes (1.5 hours)
- [ ] Write 20+ unit/integration tests
  - DVA calculation (5 tests)
  - Classification logic (3 tests)
  - RLS policies (5 tests)
  - BOM CRUD (4 tests)
  - Auth flow (3 tests)
- [ ] Run all tests
- [ ] Fix bugs found during testing

**Deliverable:** Test suite passing

#### Task 5.6: Polish & Deploy (1 hour)
- [ ] UI polish (spacing, colors, responsiveness)
- [ ] Add loading states
- [ ] Error handling
- [ ] Deploy to Lovable Cloud
- [ ] Smoke test on production

**Deliverable:** Production-ready MVP

### End of Day 5 Checklist
- [ ] All 3 dashboards functional
- [ ] Audit trail working
- [ ] 20+ tests passing
- [ ] App deployed
- [ ] End-to-end manual test completed

---

## Daily Standups (9 AM)

**Format:**
- What did I complete yesterday?
- What am I working on today?
- Any blockers?

---

## Testing Checklist (End of Sprint)

### Functional Testing

- [ ] User can sign up
- [ ] User can log in
- [ ] Admin can assign roles
- [ ] Supplier can register profile
- [ ] Supplier can create product
- [ ] Supplier can add BOM components
- [ ] DVA calculates automatically
- [ ] Classification is correct
- [ ] Procurement can view suppliers
- [ ] Admin can view dashboards
- [ ] Audit logs capture events

### Security Testing

- [ ] RLS policies prevent unauthorized access
- [ ] Supplier cannot view other supplier data
- [ ] Procurement cannot edit supplier data
- [ ] Admin can access all data
- [ ] SQL injection protection (Supabase client)

### Performance Testing

- [ ] Page load < 2 seconds
- [ ] DVA calculation < 1 second
- [ ] Queries optimized (use indexes)

### Responsiveness

- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Sidebar collapses on mobile

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| RLS policies too complex | Medium | High | Use architecture agent, test thoroughly |
| DVA trigger fails | Low | High | Unit test trigger, handle edge cases |
| Auth integration issues | Low | Medium | Use Supabase docs, test early |
| Time overrun on BOM UI | Medium | Medium | Simplify UI if needed |
| Performance issues | Low | Medium | Add indexes, optimize queries |

---

## Sprint Success Metrics

| Metric | Target |
|--------|--------|
| Features Completed | 34/34 |
| Tests Passing | 20+ |
| RLS Policies | 28/28 |
| Database Tables | 7/7 |
| Pages Functional | 12/12 |
| Manual Test Pass Rate | 100% |

---

## Post-Sprint Activities

### Code Freeze (Friday Evening)
- [ ] Final commit and deploy
- [ ] Tag release (v1.0.0-mvp)

### Demo Preparation (Weekend)
- [ ] Seed realistic test data
- [ ] Prepare demo script
- [ ] Screenshot key screens

### Sprint Retrospective (Monday)
- What went well?
- What could be improved?
- Action items for next sprint

---

## Appendix: Daily Time Breakdown

| Day | Hours | Focus Area |
|-----|-------|-----------|
| Day 1 | 8 hours | Database + Auth |
| Day 2 | 8 hours | Supplier Management |
| Day 3 | 8 hours | Products + BOM |
| Day 4 | 8 hours | DVA Engine + Compliance |
| Day 5 | 8 hours | Dashboards + Testing + Deploy |
| **Total** | **40 hours** | **Full MVP** |

---

## Tools & Resources

- **Database:** Supabase Dashboard
- **Version Control:** Git + GitHub
- **Testing:** Vitest
- **Deployment:** Lovable Cloud
- **Documentation:** This repo (`docs/MVP/`)
- **Communication:** Slack / Discord
