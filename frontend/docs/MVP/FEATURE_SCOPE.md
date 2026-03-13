# NMICOV MVP — Feature Scope Matrix

## Document Control

| Field          | Value             |
| -------------- | ----------------- |
| Document Title | MVP Feature Scope |
| Version        | 1.0               |
| Timeline       | 5 Days            |
| Last Updated   | 2026-03-09        |

---

## In-Scope Features (Week 1 MVP)

### Day 1: Foundation & Auth

| #   | Feature                                  | Module         | Complexity | Priority |
| --- | ---------------------------------------- | -------------- | ---------- | -------- |
| 1   | Supabase project setup                   | Infrastructure | Low        | P0       |
| 2   | Database schema migration                | Database       | Medium     | P0       |
| 3   | RLS policies for all tables              | Security       | High       | P0       |
| 4   | User signup (email + password)           | Auth           | Low        | P0       |
| 5   | Login page with role-based redirect      | Auth           | Low        | P0       |
| 6   | Protected route wrapper                  | Auth           | Low        | P0       |
| 7   | User profiles table                      | Database       | Low        | P0       |
| 8   | User roles table (separate for security) | Database       | Medium     | P0       |

### Day 2: Supplier Management

| #   | Feature                            | Module     | Complexity | Priority |
| --- | ---------------------------------- | ---------- | ---------- | -------- |
| 9   | Supplier registration form         | Suppliers  | Medium     | P0       |
| 10  | Supplier profile view              | Suppliers  | Low        | P0       |
| 11  | Edit supplier (admin + self)       | Suppliers  | Medium     | P0       |
| 12  | Supplier list with filters         | Suppliers  | Medium     | P0       |
| 13  | GST/PAN format validation          | Validation | Low        | P0       |
| 14  | Supplier status management (admin) | Suppliers  | Low        | P0       |

### Day 3: Product & BOM Management

| #   | Feature                                  | Module   | Complexity | Priority |
| --- | ---------------------------------------- | -------- | ---------- | -------- |
| 15  | Product registration form                | Products | Medium     | P0       |
| 16  | Product list (my products for suppliers) | Products | Low        | P0       |
| 17  | Edit/delete product (draft only)         | Products | Medium     | P0       |
| 18  | BOM component CRUD                       | BOM      | High       | P0       |
| 19  | BOM table view with totals               | BOM      | Medium     | P0       |
| 20  | Origin selector (domestic/imported)      | BOM      | Low        | P0       |

### Day 4: DVA Engine & Compliance

| #   | Feature                                     | Module         | Complexity | Priority |
| --- | ------------------------------------------- | -------------- | ---------- | -------- |
| 21  | DVA calculation engine (function)           | DVA            | Medium     | P0       |
| 22  | Auto-trigger DVA on BOM change              | DVA            | Medium     | P0       |
| 23  | PPP-MII classification logic                | Classification | Low        | P0       |
| 24  | Update product dva_score & classification   | DVA            | Low        | P0       |
| 25  | DVA calculation storage                     | Database       | Low        | P0       |
| 26  | Product status workflow (draft → submitted) | Products       | Low        | P0       |

### Day 5: Dashboards & Audit

| #   | Feature                                 | Module    | Complexity | Priority |
| --- | --------------------------------------- | --------- | ---------- | -------- |
| 27  | Admin dashboard (supplier stats)        | Dashboard | Medium     | P0       |
| 28  | Supplier dashboard (my products)        | Dashboard | Low        | P0       |
| 29  | Procurement dashboard (compliance view) | Dashboard | Medium     | P0       |
| 30  | Classification pie chart                | Analytics | Low        | P0       |
| 31  | Audit log capture (triggers)            | Audit     | Medium     | P0       |
| 32  | Audit log viewer (admin)                | Audit     | Low        | P0       |
| 33  | Basic responsive layout                 | UI        | Low        | P0       |
| 34  | Role-based sidebar navigation           | UI        | Medium     | P0       |

---

## Feature Comparison: Full vs MVP

| Feature                  | Full App                                                    | MVP                                    | Reason for Scope            |
| ------------------------ | ----------------------------------------------------------- | -------------------------------------- | --------------------------- |
| **User Roles**           | 5 roles (Superadmin, Admin, Procurement, Supplier, Auditor) | 3 roles (Admin, Supplier, Procurement) | Simplify RBAC               |
| **BOM Structure**        | Multi-tier (5 levels)                                       | Single-tier only                       | Reduce complexity           |
| **DVA Calculation**      | With 5-factor confidence scoring                            | Basic formula only                     | Defer external integrations |
| **Fraud Detection**      | 6 rules + AI models                                         | None (deferred)                        | Advanced logic              |
| **Blockchain**           | Simulated Hyperledger Fabric                                | None (basic audit log)                 | Infrastructure overhead     |
| **What-If Analysis**     | Origin/cost simulation                                      | None (deferred)                        | Secondary feature           |
| **Verification API**     | Mock API simulation                                         | None (deferred)                        | External integration        |
| **Risk Alerts**          | Full alert dashboard                                        | None (deferred)                        | Depends on fraud detection  |
| **Compliance Dashboard** | 7+ analytics modules                                        | 3 basic dashboards                     | Focus on core metrics       |
| **Data Table**           | Advanced (pagination 20/50/100, date filter)                | Basic (pagination 10/25/50)            | Simplified UX               |
| **User Management**      | Full CRUD with invite flow                                  | Admin creates users directly           | Simplified workflow         |
| **Supplier CRUD**        | Add/View/Edit/Delete with dialogs                           | Add/Edit only                          | Core operations             |
| **Product CRUD**         | Full CRUD                                                   | Add/Edit/Delete                        | Core operations             |
| **Audit Logs**           | Blockchain-style hash chain                                 | Simple timestamped log                 | Defer blockchain            |
| **Settings**             | Full platform settings                                      | None (hardcoded defaults)              | Defer configuration         |
| **Notifications**        | Email + in-app                                              | None (deferred)                        | Infrastructure setup        |
| **File Upload**          | BOM CSV/Excel import                                        | None (deferred)                        | File processing             |
| **Export**               | CSV + PDF certificates                                      | None (deferred)                        | Report generation           |
| **Authentication**       | Email, Google OAuth, Demo login                             | Email/password only                    | Simplified auth             |

---

## Out of Scope (Post-MVP)

### Phase 2 Features (Week 2-3)

| #   | Feature                            | Complexity | Timeline |
| --- | ---------------------------------- | ---------- | -------- |
| 35  | Multi-tier BOM (nested components) | High       | Week 2   |
| 36  | Confidence scoring (5 factors)     | Medium     | Week 2   |
| 37  | What-if analysis (simulation)      | Medium     | Week 2   |
| 38  | Basic fraud detection (3 rules)    | High       | Week 3   |
| 39  | Risk alert dashboard               | Medium     | Week 3   |
| 40  | Email notifications                | Medium     | Week 3   |
| 41  | BOM CSV import                     | Medium     | Week 3   |
| 42  | PDF compliance certificate         | Medium     | Week 3   |

### Phase 3 Features (Month 2)

| #   | Feature                      | Complexity | Timeline |
| --- | ---------------------------- | ---------- | -------- |
| 43  | Verification API (REST)      | High       | Month 2  |
| 44  | Google OAuth login           | Medium     | Month 2  |
| 45  | Advanced analytics (trends)  | Medium     | Month 2  |
| 46  | User activity tracking       | Medium     | Month 2  |
| 47  | Platform settings management | Low        | Month 2  |
| 48  | Multi-language support       | High       | Month 2  |

### Phase 4 Features (Month 3+)

| #   | Feature                              | Complexity | Timeline |
| --- | ------------------------------------ | ---------- | -------- |
| 49  | Blockchain integration (Hyperledger) | Very High  | Month 3+ |
| 50  | AI fraud detection (ML models)       | Very High  | Month 3+ |
| 51  | GSTN integration                     | High       | Month 3+ |
| 52  | ICEGATE customs integration          | High       | Month 3+ |
| 53  | Real-time collaboration              | High       | Month 4+ |
| 54  | Mobile app (React Native)            | Very High  | Month 6+ |

---

## Technical Scope

### pIn Scope

| Component        | Technology               | Notes             |
| ---------------- | ------------------------ | ----------------- |
| Frontend         | React 18 + TypeScript    | Existing setup    |
| UI Framework     | Tailwind CSS + Shadcn/UI | Reuse components  |
| Backend          | Supabase (PostgreSQL)    | Lovable Cloud     |
| Authentication   | Supabase Auth            | Email/password    |
| State Management | TanStack Query           | For server state  |
| Routing          | React Router v6          | Existing setup    |
| Form Handling    | React Hook Form + Zod    | Validation        |
| Database         | PostgreSQL 16            | Via Supabase      |
| Security         | Row Level Security (RLS) | Supabase policies |
| Deployment       | Lovable Cloud            | Auto-deploy       |

### ❌ Out of Scope

| Component              | Reason                  | Phase   |
| ---------------------- | ----------------------- | ------- |
| Edge Functions         | Not needed for MVP      | Phase 2 |
| Storage Buckets        | No file upload in MVP   | Phase 2 |
| Realtime Subscriptions | Not critical for MVP    | Phase 2 |
| Email Service          | Deferred notifications  | Phase 2 |
| External APIs          | No GSTN/ICEGATE yet     | Phase 3 |
| Blockchain             | Infrastructure overhead | Phase 4 |
| AI/ML                  | Advanced features       | Phase 4 |

---

## Data Scope

### Tables (6 Core Tables)

| #   | Table              | Rows (MVP) | Purpose                            |
| --- | ------------------ | ---------- | ---------------------------------- |
| 1   | `profiles`         | ~20        | User profiles (extends auth.users) |
| 2   | `user_roles`       | ~20        | RBAC (separate for security)       |
| 3   | `suppliers`        | ~10        | Supplier entities                  |
| 4   | `products`         | ~30        | Products registered                |
| 5   | `bom_items`        | ~150       | BOM components (avg 5 per product) |
| 6   | `dva_calculations` | ~30        | DVA calculation results            |
| 7   | `audit_logs`       | ~200       | User action logs                   |

**Total:** 7 tables, ~460 rows (test data)

### Deferred Tables

- `fraud_alerts` (Phase 2)
- `compliance_records` (Phase 2)
- `verification_logs` (Phase 3)
- `blockchain_ledger` (Phase 4)
- `component_registry` (Phase 3)

---

## UI Scope

### pPages Included (MVP)

| #   | Route            | Role Access        | Purpose              |
| --- | ---------------- | ------------------ | -------------------- |
| 1   | `/`              | Public             | Landing page         |
| 2   | `/login`         | Public             | Login form           |
| 3   | `/signup`        | Public             | Signup form          |
| 4   | `/dashboard`     | All authenticated  | Role-based dashboard |
| 5   | `/suppliers`     | Admin, Procurement | Supplier directory   |
| 6   | `/suppliers/new` | Admin              | Register supplier    |
| 7   | `/products`      | Supplier           | My products list     |
| 8   | `/products/new`  | Supplier           | Create product       |
| 9   | `/products/:id`  | Supplier           | Product detail + BOM |
| 10  | `/compliance`    | Procurement        | Compliance view      |
| 11  | `/audit`         | Admin              | Audit log viewer     |
| 12  | `/users`         | Admin              | User management      |

**Total:** 12 pages/routes

### ❌ Pages Deferred

- `/bom-management` (advanced BOM editor)
- `/dva-results` (detailed analytics)
- `/risk-alerts` (fraud alerts)
- `/verification` (verification API console)
- `/settings` (platform configuration)
- `/reports` (custom reports)

---

## Testing Scope

### pIn Scope

| Type              | Coverage                        | Tools                    |
| ----------------- | ------------------------------- | ------------------------ |
| Unit Tests        | DVA calculation, classification | Vitest                   |
| Integration Tests | Auth flow, CRUD operations      | Vitest + Testing Library |
| Manual Testing    | End-to-end user flows           | Manual                   |
| Security Testing  | RLS policy validation           | Manual + SQL             |

**Target:** 20+ tests covering core logic

### ❌ Out of Scope

- E2E tests (Playwright/Cypress)
- Performance tests
- Load testing
- Accessibility automated tests
- Cross-browser automated tests

---

## Deployment Scope

### pIn Scope

- Lovable Cloud auto-deployment
- Supabase hosted database
- Environment variables via Lovable Cloud
- Production build optimization

### ❌ Out of Scope

- Custom domain setup
- SSL certificate management (handled by platform)
- CDN configuration
- Multi-region deployment
- Database backups (Supabase handles)

---

## Summary: MVP Feature Count

| Category             | Full App  | MVP    | Reduction |
| -------------------- | --------- | ------ | --------- |
| **Pages**            | 18        | 12     | -33%      |
| **Tables**           | 12        | 7      | -42%      |
| **User Roles**       | 5         | 3      | -40%      |
| **Features**         | 55+       | 34     | -38%      |
| **Test Files**       | 5         | 3      | -40%      |
| **Development Time** | 3-4 weeks | 1 week | -75%      |

**MVP Delivery:** 34 core features in 5 days = ~7 features per day
