# NMICOV MVP — Technical Specification

## Document Control

| Field | Value |
|-------|-------|
| Document Title | MVP Technical Specification |
| Version | 1.0 |
| Status | Planning |
| Last Updated | 2026-03-09 |

---

## 1. Technology Stack

### 1.1 Frontend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Framework** | React | 18.3+ | Existing setup |
| **Language** | TypeScript | 5.6+ | Type safety |
| **Build Tool** | Vite | 6.0+ | Fast HMR |
| **UI Library** | Shadcn/UI | Latest | Accessible components |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Routing** | React Router | 6.30+ | Client-side routing |
| **State (Server)** | TanStack Query | 5.83+ | Server state management |
| **Forms** | React Hook Form | 7.61+ | Form handling |
| **Validation** | Zod | 3.25+ | Schema validation |
| **Icons** | Lucide React | 0.462+ | Icon library |
| **Charts** | Recharts | 2.15+ | Data visualization |

### 1.2 Backend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Backend** | Supabase | Latest | BaaS platform |
| **Database** | PostgreSQL | 16+ | Via Supabase |
| **Auth** | Supabase Auth | Latest | Email/password |
| **API** | Supabase Client | 2.98+ | Auto-generated REST API |
| **RLS** | PostgreSQL RLS | Native | Row-level security |

### 1.3 Development Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit/integration testing |
| Testing Library | React component testing |
| ESLint | Code linting |
| Prettier | Code formatting |
| TypeScript | Type checking |

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser)                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         React Application (SPA)                 │ │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐ │ │
│  │  │  Pages     │  │ Components │  │  Hooks   │ │ │
│  │  └────────────┘  └────────────┘  └──────────┘ │ │
│  │                                                 │ │
│  │  ┌────────────────────────────────────────┐   │ │
│  │  │      Supabase Client Library            │   │ │
│  │  │  (Auth + Database + RLS)                │   │ │
│  │  └────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS (REST API + Realtime)
                     │
┌────────────────────▼────────────────────────────────┐
│              SUPABASE CLOUD                          │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Auth Service │  │ PostgreSQL   │  │ Realtime │  │
│  │ (JWT)        │  │ (w/ RLS)     │  │ (Sync)   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │         Auto-generated REST API              │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 2.2 Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI primitives
│   ├── layout/         # Layout components (AppLayout, Sidebar)
│   ├── shared/         # Shared components (DataTable, PageHeader)
│   ├── suppliers/      # Supplier-specific components
│   ├── products/       # Product-specific components
│   └── dashboards/     # Dashboard components
├── pages/              # Route-level page components
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Suppliers.tsx
│   ├── Products.tsx
│   ├── Compliance.tsx
│   ├── AuditLogs.tsx
│   └── UserManagement.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Auth context hook
│   ├── useSuppliers.ts # Supplier data hook
│   └── useProducts.ts  # Product data hook
├── lib/                # Utility functions
│   ├── utils.ts        # General utilities
│   └── dva-engine.ts   # Client-side DVA logic (validation)
├── integrations/       # External integrations
│   └── supabase/
│       ├── client.ts   # Supabase client (auto-generated)
│       └── types.ts    # Database types (auto-generated)
└── contexts/           # React contexts
    └── AuthContext.tsx # Auth state management
```

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
auth.users (Supabase)
    │
    └──► profiles (1:1)
             │
             ├──► user_roles (1:N)
             │
             └──► suppliers (1:1 for suppliers)
                     │
                     └──► products (1:N)
                             │
                             ├──► bom_items (1:N)
                             │
                             └──► dva_calculations (1:N)

audit_logs (references all entities)
```

### 3.2 Table Summary

| Table | Rows (MVP) | Purpose |
|-------|-----------|---------|
| `profiles` | ~20 | User profile data |
| `user_roles` | ~20 | Role assignments |
| `suppliers` | ~10 | Supplier entities |
| `products` | ~30 | Registered products |
| `bom_items` | ~150 | Bill of materials |
| `dva_calculations` | ~30 | DVA calculation history |
| `audit_logs` | ~200 | Audit trail |

**See `DATA_SCHEMA.md` for complete schema definitions.**

---

## 4. API Design

### 4.1 Supabase Client Patterns

All database operations use the Supabase client:

```typescript
import { supabase } from "@/integrations/supabase/client";

// SELECT
const { data, error } = await supabase
  .from('suppliers')
  .select('*')
  .eq('status', 'active');

// INSERT
const { data, error } = await supabase
  .from('suppliers')
  .insert({ name: 'Test', gst_number: '...' });

// UPDATE
const { data, error } = await supabase
  .from('products')
  .update({ dva_score: 62.5 })
  .eq('id', productId);

// DELETE
const { data, error } = await supabase
  .from('bom_items')
  .delete()
  .eq('id', itemId);
```

### 4.2 Auth Patterns

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Logout
await supabase.auth.signOut();
```

### 4.3 RLS Enforcement

All queries automatically respect RLS policies. The Supabase client sends the JWT with each request, and PostgreSQL enforces policies at the database level.

```typescript
// Supplier can only view their own products
// RLS policy enforces this automatically
const { data } = await supabase
  .from('products')
  .select('*');
// Returns only products where supplier.user_id = auth.uid()
```

---

## 5. Authentication & Authorization

### 5.1 Auth Flow

```
1. User signs up with email + password
   ↓
2. Supabase creates auth.users record
   ↓
3. Trigger creates profiles record
   ↓
4. Admin assigns role via user_roles table
   ↓
5. User logs in
   ↓
6. Supabase issues JWT with user_id
   ↓
7. Frontend reads role from user_roles
   ↓
8. App routes user to role-specific dashboard
```

### 5.2 Role Definitions

| Role | Permissions | Dashboard |
|------|------------|-----------|
| `admin` | Full access to all data; manage users and suppliers | Admin analytics |
| `supplier` | CRUD own products/BOMs; view own DVA | Supplier products |
| `procurement` | Read-only view of all suppliers/products | Compliance view |

### 5.3 Protected Routes

```typescript
// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

// Usage
<Route
  path="/suppliers"
  element={
    <ProtectedRoute allowedRoles={['admin', 'procurement']}>
      <Suppliers />
    </ProtectedRoute>
  }
/>
```

---

## 6. Data Validation

### 6.1 Client-Side Validation (Zod)

```typescript
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gst_number: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  sector: z.string().min(1, "Sector is required"),
  state: z.string().min(1, "State is required"),
});
```

### 6.2 Database-Level Validation

```sql
-- Constraints in schema
ALTER TABLE suppliers
  ADD CONSTRAINT gst_format
  CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');

ALTER TABLE products
  ADD CONSTRAINT positive_cost
  CHECK (estimated_cost > 0);
```

---

## 7. DVA Calculation Engine

### 7.1 Server-Side Function

```sql
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
  -- Sum component costs
  SELECT 
    COALESCE(SUM(cost), 0),
    COALESCE(SUM(CASE WHEN origin = 'domestic' THEN cost ELSE 0 END), 0)
  INTO v_total_cost, v_domestic_cost
  FROM public.bom_items
  WHERE product_id = p_product_id;
  
  -- Calculate DVA%
  IF v_total_cost > 0 THEN
    v_dva_percentage := (v_domestic_cost / v_total_cost) * 100;
  END IF;
  
  -- Classify
  IF v_dva_percentage >= 50 THEN
    v_classification := 'Class I';
  ELSIF v_dva_percentage >= 20 THEN
    v_classification := 'Class II';
  ELSE
    v_classification := 'Non-Local';
  END IF;
  
  RETURN QUERY SELECT 
    v_dva_percentage, v_classification, v_total_cost, v_domestic_cost;
END;
$$;
```

### 7.2 Automatic Trigger

```sql
-- Trigger to auto-calculate DVA on BOM changes
CREATE TRIGGER auto_calculate_dva_on_bom_insert
  AFTER INSERT ON public.bom_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_dva_calculation();
```

---

## 8. State Management

### 8.1 Server State (TanStack Query)

```typescript
// Custom hook for suppliers
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}
```

### 8.2 Client State (React Context)

```typescript
// Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch session and role
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id).then(setRole);
      }
    });
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 9. UI Components

### 9.1 Reusable DataTable

```typescript
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: string[];
  pageSize?: number;
}

function DataTable<T extends Record<string, any>>({
  data, columns, searchKeys, pageSize = 10
}: DataTableProps<T>) {
  // Pagination, search, sort logic
  // ...
}
```

### 9.2 Form Components

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function SupplierForm() {
  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: { /* ... */ }
  });
  
  const onSubmit = async (data) => {
    const { error } = await supabase
      .from('suppliers')
      .insert(data);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Supplier registered");
    }
  };
  
  return <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
    {/* Form fields */}
  </Form>;
}
```

---

## 10. Security

### 10.1 RLS Policies

All tables have RLS enabled. Policies enforce:
- Suppliers can only see their own data
- Procurement officers have read-only access to all data
- Admins have full access

**Example:**
```sql
CREATE POLICY "Suppliers can view their own products"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = products.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );
```

### 10.2 Auth Security

- Passwords hashed by Supabase Auth
- JWTs issued with short expiry
- HTTPS enforced on all connections
- No API keys in frontend code (Supabase anon key is public)

### 10.3 Input Sanitization

- Supabase client auto-parameterizes queries (SQL injection protection)
- Zod validates all form inputs before submission
- Database constraints as final validation layer

---

## 11. Testing Strategy

### 11.1 Unit Tests

```typescript
// DVA calculation logic test
describe('DVA Calculation', () => {
  it('should calculate Class I for 60% DVA', () => {
    const result = calculateClassification(60);
    expect(result).toBe('Class I');
  });
  
  it('should calculate Class II for 30% DVA', () => {
    const result = calculateClassification(30);
    expect(result).toBe('Class II');
  });
});
```

### 11.2 Integration Tests

```typescript
// BOM CRUD test
describe('BOM Management', () => {
  it('should add component and trigger DVA calculation', async () => {
    const { data: product } = await createTestProduct();
    const { data: bomItem } = await supabase
      .from('bom_items')
      .insert({
        product_id: product.id,
        component_name: 'Test Component',
        origin: 'domestic',
        cost: 1000
      });
    
    // DVA should be calculated via trigger
    const { data: updatedProduct } = await supabase
      .from('products')
      .select('dva_score')
      .eq('id', product.id)
      .single();
    
    expect(updatedProduct.dva_score).toBeGreaterThan(0);
  });
});
```

### 11.3 Manual Testing Checklist

- [ ] Sign up / login flow
- [ ] Supplier registration
- [ ] Product creation
- [ ] BOM CRUD operations
- [ ] DVA auto-calculation
- [ ] Role-based dashboard routing
- [ ] RLS policy enforcement
- [ ] Responsive layout

---

## 12. Deployment

### 12.1 Environment Variables

```env
# Lovable Cloud automatically provides:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

### 12.2 Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### 12.3 Deployment Steps

1. Push code to GitHub
2. Lovable Cloud auto-builds
3. Supabase migration runs automatically
4. App deployed to preview URL

---

## 13. Performance Considerations

### 13.1 Database Indexes

All foreign keys and commonly filtered columns are indexed (see DATA_SCHEMA.md).

### 13.2 Query Optimization

- Select only needed columns
- Use `.single()` for single-row queries
- Leverage Supabase's built-in caching

### 13.3 Frontend Optimization

- Code splitting via React.lazy()
- TanStack Query caching
- Debounced search inputs

---

## 14. Limitations (MVP Scope)

### What's NOT Included

- Multi-tier BOM (only single-tier)
- External API integrations (GSTN, ICEGATE)
- Email notifications
- File uploads (BOM CSV import)
- PDF export
- Real-time collaboration
- Advanced analytics
- Fraud detection
- Blockchain ledger

---

## 15. Post-MVP Roadmap

### Week 2-3
- Multi-tier BOM support
- What-if analysis
- Basic fraud detection

### Month 2
- Email notifications
- BOM CSV import
- Verification API

### Month 3+
- GSTN integration
- Blockchain ledger
- AI fraud detection

---

## Appendix: Tech Debt Tracking

| Item | Priority | Resolution Plan |
|------|----------|----------------|
| Hardcoded admin user seeding | Medium | Create admin panel for role management |
| Limited test coverage | High | Expand to 50+ tests post-MVP |
| No email verification | Low | Enable Supabase email verification |
| Single-tier BOM only | High | Add multi-tier support in Phase 2 |
