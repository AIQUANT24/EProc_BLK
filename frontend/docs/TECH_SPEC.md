# NMICOV — Technical Specification Document

## Document Control

| Field | Value |
|-------|-------|
| Document Title | NMICOV Technical Specification |
| Version | 1.1 |
| Status | MVP Complete |
| Last Updated | 2026-03-09 |

---

## 1. Technology Stack

### 1.1 Core Platform

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React 18 + TypeScript | Component-based UI, strong typing |
| **UI Framework** | Tailwind CSS + Shadcn/UI | Rapid UI development, accessible components |
| **State Management** | TanStack Query + Zustand | Server state + client state |
| **Backend** | Go (primary) / Node.js (APIs) | Performance for DVA engine; Node for REST APIs |
| **API Gateway** | Kong / AWS API Gateway | Rate limiting, auth, routing |
| **Database** | PostgreSQL 16 | ACID compliance, JSON support, extensions |
| **Cache** | Redis 7 | Session management, DVA cache |
| **Message Queue** | Apache Kafka | Event streaming for verification pipeline |
| **Object Storage** | MinIO / S3 | BOM documents, certificates |
| **Blockchain** | Hyperledger Fabric 2.5 | Permissioned, enterprise-grade |
| **AI/ML** | Python + TensorFlow + PyTorch | Fraud detection models |
| **Search** | Elasticsearch 8 | Product/supplier search |
| **Monitoring** | Prometheus + Grafana | System monitoring |
| **CI/CD** | GitLab CI / GitHub Actions | Automated deployment |

### 1.2 Infrastructure

| Component | Technology |
|-----------|-----------|
| Container Runtime | Docker + Kubernetes |
| Cloud Platform | NIC Cloud / Gov Cloud India |
| CDN | CloudFront or NIC CDN |
| DNS | Route 53 or NIC DNS |
| SSL/TLS | Let's Encrypt / Gov PKI |
| Secrets | HashiCorp Vault |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Supplier  │  │ Officer  │  │ External APIs    │  │
│  │ Portal    │  │ Dashboard│  │ (GeM, CPPP)      │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
└───────┼──────────────┼─────────────────┼────────────┘
        │              │                 │
┌───────▼──────────────▼─────────────────▼────────────┐
│                  API GATEWAY                         │
│  Authentication │ Rate Limiting │ Routing │ Logging  │
└───────┬──────────────┬─────────────────┬────────────┘
        │              │                 │
┌───────▼──────────────▼─────────────────▼────────────┐
│              MICROSERVICES LAYER                     │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Identity    │  │ Product     │  │ BOM         │ │
│  │ Service     │  │ Registry    │  │ Service     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ DVA         │  │ Compliance  │  │ Fraud       │ │
│  │ Engine      │  │ Engine      │  │ Engine      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Verification│  │ Blockchain  │  │ Analytics   │ │
│  │ Engine      │  │ Gateway     │  │ Engine      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │ Notification│  │ Certificate │                   │
│  │ Service     │  │ Service     │                   │
│  └─────────────┘  └─────────────┘                   │
└───────┬──────────────┬─────────────────┬────────────┘
        │              │                 │
┌───────▼──────────────▼─────────────────▼────────────┐
│                  DATA LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │PostgreSQL│  │ Redis    │  │ Elasticsearch    │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Kafka    │  │ MinIO/S3 │  │ Hyperledger      │  │
│  │          │  │          │  │ Fabric           │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└───────┬──────────────┬─────────────────┬────────────┘
        │              │                 │
┌───────▼──────────────▼─────────────────▼────────────┐
│              INTEGRATION LAYER                       │
│  ┌────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌───────────┐  │
│  │GeM │ │GSTN  │ │DGFT  │ │ICEGATE│ │Udyam/MCA21│ │
│  └────┘ └──────┘ └──────┘ └───────┘ └───────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.2 Microservice Specifications

#### Identity Service

| Property | Value |
|----------|-------|
| Language | Go |
| Database | PostgreSQL (identity schema) |
| Auth | JWT + PKI certificates |
| External APIs | GSTN, PAN, Udyam, MCA21 |

**Core Functions:**
- Supplier registration & KYC
- Factory verification
- Digital identity issuance
- Session management

#### DVA Engine

| Property | Value |
|----------|-------|
| Language | Go |
| Database | PostgreSQL (bom schema) |
| Cache | Redis (DVA results) |

**Core Functions:**
- BOM traversal (recursive, multi-tier)
- Cost aggregation by origin
- DVA percentage calculation
- Confidence scoring
- Sector rule application

**Algorithm:**

```go
func CalculateDVA(product Product) DVAResult {
    totalCost := 0.0
    domesticCost := 0.0
    
    for _, component := range product.BOM {
        totalCost += component.Cost
        if component.Origin == "DOMESTIC" {
            domesticCost += component.Cost
        }
        // Recursively process sub-components
        if len(component.SubComponents) > 0 {
            subResult := CalculateDVA(component)
            domesticCost += subResult.DomesticCost
            totalCost += subResult.TotalCost
        }
    }
    
    dvaPercent := (domesticCost / totalCost) * 100
    classification := ClassifySupplier(dvaPercent)
    confidence := CalculateConfidence(product)
    
    return DVAResult{
        DVAPercent:     dvaPercent,
        Classification: classification,
        Confidence:     confidence,
        DomesticCost:   domesticCost,
        TotalCost:      totalCost,
    }
}
```

#### Fraud Engine

| Property | Value |
|----------|-------|
| Language | Python (ML) + Go (rules) |
| Queue | Kafka consumer |
| Models | TensorFlow, scikit-learn |

**Rule Engine (MVP):**

```python
FRAUD_RULES = [
    {
        "id": "FR-01",
        "name": "DVA Jump Detection",
        "condition": "abs(current_dva - previous_dva) > 15",
        "severity": "HIGH",
        "action": "FLAG_FOR_REVIEW"
    },
    {
        "id": "FR-02",
        "name": "Post-Bid BOM Modification",
        "condition": "bom_modified_after(bid_submission_date)",
        "severity": "CRITICAL",
        "action": "BLOCK_AND_ALERT"
    },
    {
        "id": "FR-03",
        "name": "Import Origin Mismatch",
        "condition": "component.declared_origin == 'DOMESTIC' AND import_record_exists(component)",
        "severity": "CRITICAL",
        "action": "FLAG_FOR_INVESTIGATION"
    }
]
```

---

## 3. Database Schema

### 3.1 Core Tables

```sql
-- Supplier Identity
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gst_number VARCHAR(15) UNIQUE NOT NULL,
    pan VARCHAR(10) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    msme_status VARCHAR(20),
    udyam_number VARCHAR(20),
    incorporation_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING_VERIFICATION',
    digital_identity_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factory Locations
CREATE TABLE factories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(6),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    manufacturing_capacity JSONB,
    license_number VARCHAR(100),
    license_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    hsn_code VARCHAR(8) NOT NULL,
    category VARCHAR(100),
    sector VARCHAR(100),
    description TEXT,
    manufacturing_location UUID REFERENCES factories(id),
    ppp_mii_eligible BOOLEAN DEFAULT TRUE,
    min_local_content DECIMAL(5, 2),
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill of Materials
CREATE TABLE bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    parent_item_id UUID REFERENCES bom_items(id),
    component_name VARCHAR(255) NOT NULL,
    component_code VARCHAR(50),
    origin VARCHAR(20) NOT NULL CHECK (origin IN ('DOMESTIC', 'IMPORTED', 'MIXED')),
    supplier_name VARCHAR(255),
    supplier_gst VARCHAR(15),
    cost DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    quantity DECIMAL(10, 3) DEFAULT 1,
    unit VARCHAR(20),
    verification_status VARCHAR(20) DEFAULT 'UNVERIFIED',
    verification_confidence DECIMAL(3, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DVA Calculations
CREATE TABLE dva_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    supplier_id UUID REFERENCES suppliers(id),
    bom_version INTEGER NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    domestic_cost DECIMAL(15, 2) NOT NULL,
    dva_percentage DECIMAL(5, 2) NOT NULL,
    classification VARCHAR(20) NOT NULL,
    confidence_score DECIMAL(3, 2),
    calculation_details JSONB,
    blockchain_tx_hash VARCHAR(66),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud Alerts
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    product_id UUID REFERENCES products(id),
    rule_id VARCHAR(10) NOT NULL,
    severity VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB,
    status VARCHAR(20) DEFAULT 'OPEN',
    assigned_to UUID,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Records (off-chain mirror)
CREATE TABLE compliance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    product_id UUID REFERENCES products(id),
    record_type VARCHAR(50) NOT NULL,
    data_hash VARCHAR(64) NOT NULL,
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT,
    status VARCHAR(20) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Events
CREATE TABLE verification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_item_id UUID REFERENCES bom_items(id),
    verification_source VARCHAR(50) NOT NULL,
    result VARCHAR(20) NOT NULL,
    confidence DECIMAL(3, 2),
    evidence JSONB,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Verification Logs
CREATE TABLE api_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_platform VARCHAR(50) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    product_id UUID REFERENCES products(id),
    request_payload JSONB,
    response_payload JSONB,
    response_time_ms INTEGER,
    status_code INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suppliers_gst ON suppliers(gst_number);
CREATE INDEX idx_products_hsn ON products(hsn_code);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_bom_product ON bom_items(product_id);
CREATE INDEX idx_bom_parent ON bom_items(parent_item_id);
CREATE INDEX idx_dva_product ON dva_calculations(product_id);
CREATE INDEX idx_dva_supplier ON dva_calculations(supplier_id);
CREATE INDEX idx_fraud_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_supplier ON fraud_alerts(supplier_id);
CREATE INDEX idx_compliance_supplier ON compliance_records(supplier_id);
CREATE INDEX idx_verification_log_created ON api_verification_logs(created_at);
```

---

## 4. API Specifications

### 4.1 Authentication

All APIs use JWT Bearer tokens issued by the Identity Service.

```
Authorization: Bearer <jwt_token>
```

Token payload:
```json
{
  "sub": "supplier-uuid",
  "role": "SUPPLIER | OFFICER | AUDITOR | ADMIN",
  "org": "organization-id",
  "permissions": ["bom:write", "dva:read"],
  "exp": 1709740800
}
```

### 4.2 Core APIs

#### Supplier APIs

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/v1/suppliers` | Register new supplier |
| GET | `/api/v1/suppliers/{id}` | Get supplier profile |
| PUT | `/api/v1/suppliers/{id}` | Update supplier profile |
| POST | `/api/v1/suppliers/{id}/verify` | Trigger KYC verification |
| GET | `/api/v1/suppliers/{id}/compliance` | Get compliance summary |

#### Product APIs

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/v1/products` | Register new product |
| GET | `/api/v1/products/{id}` | Get product details |
| PUT | `/api/v1/products/{id}` | Update product |
| GET | `/api/v1/products/{id}/dva` | Get DVA score |
| GET | `/api/v1/products/search` | Search products |

#### BOM APIs

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/v1/products/{id}/bom` | Create/update BOM |
| GET | `/api/v1/products/{id}/bom` | Get BOM tree |
| POST | `/api/v1/products/{id}/bom/import` | Import BOM from file |
| GET | `/api/v1/products/{id}/bom/export` | Export BOM |

#### DVA APIs

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/v1/dva/calculate/{productId}` | Calculate DVA |
| GET | `/api/v1/dva/history/{productId}` | DVA calculation history |
| POST | `/api/v1/dva/simulate` | Simulate DVA changes |

#### Verification APIs (for GeM/CPPP)

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/v1/verify/supplier/{id}` | Verify supplier |
| GET | `/api/v1/verify/product/{id}` | Verify product |
| POST | `/api/v1/verify/bid` | Verify bid compliance |
| POST | `/api/v1/verify/batch` | Batch verification |

---

## 5. Blockchain Architecture

### 5.1 Network Topology

```
┌─────────────────────────────────────────┐
│          Hyperledger Fabric Network      │
│                                          │
│  ┌──────────┐    ┌──────────┐           │
│  │ Orderer  │    │ Orderer  │  (Raft)   │
│  │ (DPIIT)  │    │ (NIC)    │           │
│  └──────────┘    └──────────┘           │
│                                          │
│  Channel: compliance-national            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │
│  │DPIIT │ │ GeM  │ │ CAG  │ │Ministry│ │
│  │Peer  │ │Peer  │ │Peer  │ │Peer    │ │
│  └──────┘ └──────┘ └──────┘ └────────┘ │
│                                          │
│  Channel: compliance-defence             │
│  ┌──────┐ ┌──────┐                      │
│  │ MoD  │ │DPIIT │                      │
│  │Peer  │ │Peer  │                      │
│  └──────┘ └──────┘                      │
└─────────────────────────────────────────┘
```

### 5.2 Smart Contracts (Chaincode)

#### ComplianceContract

```go
// RecordDeclaration stores supplier DVA declaration hash
func (c *ComplianceContract) RecordDeclaration(ctx contractapi.TransactionContextInterface, 
    declarationID string, supplierID string, productID string, 
    dvaScore float64, classification string, dataHash string) error {
    
    record := ComplianceRecord{
        ID:             declarationID,
        SupplierID:     supplierID,
        ProductID:      productID,
        DVAScore:       dvaScore,
        Classification: classification,
        DataHash:       dataHash,
        Timestamp:      time.Now().UTC(),
        RecordedBy:     ctx.GetClientIdentity().GetID(),
    }
    
    recordJSON, _ := json.Marshal(record)
    return ctx.GetStub().PutState(declarationID, recordJSON)
}

// VerifyDeclaration checks if a declaration exists and is valid
func (c *ComplianceContract) VerifyDeclaration(ctx contractapi.TransactionContextInterface,
    declarationID string) (*ComplianceRecord, error) {
    
    recordJSON, err := ctx.GetStub().GetState(declarationID)
    if err != nil || recordJSON == nil {
        return nil, fmt.Errorf("declaration %s not found", declarationID)
    }
    
    var record ComplianceRecord
    json.Unmarshal(recordJSON, &record)
    return &record, nil
}
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

| Layer | Mechanism |
|-------|----------|
| User Authentication | JWT + MFA |
| Service-to-Service | mTLS |
| Blockchain Identity | X.509 PKI certificates |
| API Access | OAuth 2.0 client credentials |

### 6.2 Data Protection

| Aspect | Implementation |
|--------|---------------|
| Encryption at Rest | AES-256 (PostgreSQL TDE) |
| Encryption in Transit | TLS 1.3 |
| Key Management | HashiCorp Vault |
| Data Masking | PII masking in logs |
| Backup Encryption | AES-256 |

### 6.3 RBAC Model

| Role | Permissions |
|------|------------|
| `SUPPLIER` | Own data CRUD, BOM management, DVA view |
| `PROCUREMENT_OFFICER` | Verify suppliers, view compliance, manage alerts |
| `AUDITOR` | Read-only all data, blockchain verification |
| `POLICY_ADMIN` | Policy configuration, analytics, simulation |
| `SYSTEM_ADMIN` | Platform configuration, user management |

---

## 7. Deployment Architecture

### 7.1 Kubernetes Deployment

```yaml
# Namespace: nmicov-production
Services:
  - identity-service (3 replicas)
  - product-registry (3 replicas)
  - bom-service (3 replicas)
  - dva-engine (5 replicas, CPU-intensive)
  - compliance-engine (3 replicas)
  - fraud-engine (2 replicas)
  - verification-engine (3 replicas)
  - blockchain-gateway (2 replicas)
  - analytics-engine (2 replicas)
  - notification-service (2 replicas)
  - certificate-service (2 replicas)
  - api-gateway (5 replicas)

Databases:
  - postgresql-primary (1 instance, 16 vCPU, 64GB RAM)
  - postgresql-replicas (2 read replicas)
  - redis-cluster (3 nodes)
  - elasticsearch-cluster (3 nodes)

Infrastructure:
  - kafka-cluster (3 brokers)
  - minio-cluster (4 nodes)
  - hyperledger-peer (per organization)
```

### 7.2 Environments

| Environment | Purpose |
|------------|---------|
| Development | Developer testing |
| Staging | Integration testing |
| Pre-production | UAT with government stakeholders |
| Production | Live platform |
| DR | Disaster recovery (different region) |

---

## 8. Monitoring & Observability

| Component | Tool |
|-----------|------|
| Metrics | Prometheus |
| Dashboards | Grafana |
| Logging | ELK Stack (Elasticsearch, Logstash, Kibana) |
| Tracing | Jaeger |
| Alerting | PagerDuty / OpsGenie |
| Uptime | Synthetic monitoring |

### Key SLIs

| Metric | SLO |
|--------|-----|
| API Latency (p99) | < 2 seconds |
| API Availability | 99.9% |
| DVA Calculation Time | < 5 seconds |
| Blockchain Confirmation | < 30 seconds |
| Dashboard Load Time | < 3 seconds |
