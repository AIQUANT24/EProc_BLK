# NMICOV — Complete Feature Scope

## Document Control

| Field          | Value                |
| -------------- | -------------------- |
| Document Title | Feature Scope Matrix |
| Version        | 1.1                  |
| Last Updated   | 2026-03-09           |

---

## Feature Matrix by Phase

### Phase 1 — MVP (Delivered)

| #   | Feature                                                                            | Module         | Status |
| --- | ---------------------------------------------------------------------------------- | -------------- | ------ |
| 1   | Role-based authentication (5 roles: Superadmin/Admin/Procurement/Supplier/Auditor) | Auth           |        |
| 2   | Quick-access demo login with role switcher                                         | Auth           |        |
| 3   | Role-specific dashboards with analytics                                            | Dashboard      |        |
| 4   | Supplier registry with search/filter                                               | Suppliers      |        |
| 5   | **Supplier CRUD (Add/View/Edit/Delete dialogs)**                                   | Suppliers      |        |
| 6   | **View supplier detail with audit trail**                                          | Suppliers      |        |
| 7   | Product registration with HSN codes                                                | Products       |        |
| 8   | BOM editor with component management                                               | BOM            |        |
| 9   | Multi-tier BOM support (5 levels)                                                  | BOM            |        |
| 10  | DVA calculation engine                                                             | DVA Engine     |        |
| 11  | PPP-MII classification (Class I/II/Non-Local)                                      | Classification |        |
| 12  | 5-factor confidence scoring                                                        | DVA Engine     |        |
| 13  | Risk score calculation                                                             | DVA Engine     |        |
| 14  | What-If analysis (origin/cost simulation)                                          | BOM            |        |
| 15  | 6-rule fraud detection engine                                                      | Fraud          |        |
| 16  | Fraud alert dashboard with resolution                                              | Alerts         |        |
| 17  | Blockchain ledger simulation                                                       | Blockchain     |        |
| 18  | Verification API simulation                                                        | Verification   |        |
| 19  | Compliance dashboard with analytics                                                | Compliance     |        |
| 20  | Audit log with blockchain explorer                                                 | Audit          |        |
| 21  | **User CRUD (Invite/Edit/Delete dialogs)**                                         | Admin          |        |
| 22  | Platform settings                                                                  | Admin          |        |
| 23  | Responsive sidebar navigation                                                      | UI             |        |
| 24  | **Advanced pagination (20/50/100 rows selector)**                                  | DataTable      |        |
| 25  | **Date range filtering**                                                           | DataTable      |        |
| 26  | **CSV export**                                                                     | DataTable      |        |
| 27  | **Inline row actions (View/Edit/Delete icons)**                                    | DataTable      |        |
| 28  | **Reusable delete confirmation dialog**                                            | UI             |        |
| 29  | **50 suppliers mock data (diverse sectors)**                                       | Mock Data      |        |
| 30  | **50 products mock data**                                                          | Mock Data      |        |
| 31  | **30 platform users mock data**                                                    | Mock Data      |        |
| 32  | 42-test comprehensive test suite                                                   | Testing        |        |

### Phase 2 — Enterprise (Current)

| #   | Feature                                     | Module         | Status |
| --- | ------------------------------------------- | -------------- | ------ |
| 33  | Lovable Cloud database backend              | Infrastructure |        |
| 34  | Real authentication (Supabase signup/login) | Auth           | 🔄     |
| 35  | Persistent data storage                     | Database       | 🔄     |
| 36  | BOM import (CSV/Excel/XML)                  | BOM            | 🔄     |
| 37  | PDF compliance certificate export           | Reports        | 🔄     |
| 38  | Email notifications                         | Notifications  | 🔄     |
| 39  | API rate limiting & metering                | API            | 🔄     |
| 40  | Multi-language support (Hindi + English)    | i18n           | 🔄     |

### Phase 3 — Government Integration

| #   | Feature                          | Module       | Priority |
| --- | -------------------------------- | ------------ | -------- |
| 41  | GeM API integration              | Integration  | P1       |
| 42  | GSTN supply chain validation     | Verification | P1       |
| 43  | ICEGATE customs data correlation | Verification | P1       |
| 44  | Udyam MSME registry integration  | Onboarding   | P1       |
| 45  | AI/ML fraud detection models     | Fraud        | P2       |
| 46  | Supply chain graph analytics     | Analytics    | P2       |
| 47  | Policy simulation engine         | Policy       | P2       |
| 48  | National Component Registry      | Registry     | P2       |

### Phase 4 — Scale

| #   | Feature                           | Module       | Priority |
| --- | --------------------------------- | ------------ | -------- |
| 49  | State government deployment       | Platform     | P2       |
| 50  | Defence procurement module        | Sector       | P2       |
| 51  | Electronics sector module (PLI)   | Sector       | P2       |
| 52  | IoT manufacturing traceability    | Traceability | P3       |
| 53  | Cross-border supply chain mapping | Supply Chain | P3       |
| 54  | Third-party auditor marketplace   | Ecosystem    | P3       |
| 55  | Mobile app (Android/iOS)          | Mobile       | P3       |

---

## Module Deep Dives

### Authentication Module

- Email/password registration
- Google Sign-In (for enterprise users)
- OTP-based login (for suppliers with mobile)
- Role assignment and RBAC enforcement
- Session management with refresh tokens
- Password reset flow

### DVA Engine Module

- Real-time DVA% calculation from BOM data
- Sector-specific threshold configuration
- 5-factor weighted confidence scoring
- Risk score derivation
- What-If analysis with rollback
- Historical DVA trend tracking
- Bulk DVA calculation for product catalogs

### Fraud Detection Module

- 6 rule-based detection algorithms (Phase 1)
- Isolation Forest anomaly detection (Phase 2)
- Bayesian cost manipulation detection (Phase 2)
- Graph Neural Network for collusive rings (Phase 3)
- Alert lifecycle: Generated → Active → Investigated → Resolved
- Alert escalation workflows
- False positive feedback loop

### Blockchain Module

- Simulated Hyperledger Fabric network
- 5 peer nodes (DPIIT, GeM, CAG, Ministries, Auditors)
- Hash-chain integrity verification
- Event types: BOM, DVA, Classification, Verification, Alert
- Block explorer UI
- Certificate generation with blockchain proof

### Verification API Module

- RESTful API with OpenAPI 3.0 spec
- Endpoints: verify supplier, product, bid, batch
- Response includes DVA, classification, confidence, risk, blockchain proof
- API key management
- Rate limiting per tier
- Webhook callbacks for async verification

### DataTable Module (New)

- Enterprise-grade reusable data table component
- Advanced pagination with row selector (20/50/100 rows)
- Multi-page navigation with ellipsis for large datasets
- Column sorting (asc/desc)
- Column filtering with dropdown select
- Date range picker filtering
- Full-text search across configurable columns
- CSV export functionality
- Inline row actions (View/Edit/Delete icons)

### CRUD Operations Module (New)

- **Suppliers**: Add/View/Edit/Delete with dialog forms
- **Users**: Invite/Edit/Delete with role assignment
- View detail dialogs with entity-specific audit trail
- Reusable delete confirmation dialog
- Toast notifications for all operations
- Form validation with React Hook Form patterns

### Mock Data Scale

- 50 suppliers across 10 sectors (Aerospace, Defence, Electronics, etc.)
- 50 products with full BOM and DVA calculations
- 30 platform users across 5 roles
- Diverse data: states, MSME categories, verification statuses
