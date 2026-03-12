import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Loader2, ListTree } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  dvaScore: number | null;
  classification: string | null;
  status: "draft" | "active" | "archived" | "under_review" | "verified";
  createdAt: string;
}

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isSupplier = user?.role === "supplier";

  const [dashboardData, setDashboardData] = useState({
    supplierProfile: null as any,
    products: [] as any[],
    compliance: [] as any[],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/suppliers/profile`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setDashboardData((prev) => ({
          ...prev,
          supplierProfile: response.data.supplier,
        }));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDashboardData((prev) => ({ ...prev, supplierProfile: null }));
      }
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [fetchDashboardData, user]);

  const isProfileComplete = !!dashboardData.supplierProfile;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setProducts(response.data.products || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const columns: Column<Product>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs uppercase">
          {r.id.split("-")[0]}
        </span>
      ),
    },
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterOptions: [...new Set(products.map((p) => p.category))],
    },
    {
      key: "estimatedCost",
      label: "Estimated Cost (₹)",
      sortable: true,
      render: (r) => (
        <span>₹{r.estimatedCost?.toLocaleString("en-IN") || "0"}</span>
      ),
    },
    {
      key: "dvaScore",
      label: "DVA Score",
      sortable: true,
      render: (r) =>
        r.dvaScore != null ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{r.dvaScore}%</span>
            <Progress value={r.dvaScore} className="h-1.5 w-16" />
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "classification",
      label: "Classification",
      filterOptions: ["Class I", "Class II", "Non-Local"],
      render: (r) =>
        r.classification ? (
          <Badge
            variant={
              r.classification === "Class I"
                ? "default"
                : r.classification === "Class II"
                  ? "secondary"
                  : "destructive"
            }
          >
            {r.classification}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      filterOptions: [
        "draft",
        "under_review",
        "verified",
        "active",
        "archived",
      ],
      render: (r) => {
        let variant = "outline";
        if (r.status === "verified" || r.status === "active")
          variant = "default";
        else if (r.status === "under_review") variant = "secondary";

        return (
          <Badge variant={variant as any} className="capitalize">
            {r.status.replace("_", " ")}
          </Badge>
        );
      },
    },
    // NEW: Actions Column linking to the BOM Page
    {
      key: "actions" as any,
      label: "Actions",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/bom/${r.id}`)}
          className="gap-2"
        >
          <ListTree className="h-4 w-4" /> Manage BOM
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Loading products data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Registered Products"
        description={`${products.length} products total · ${products.filter((p) => p.status === "verified").length} verified`}
        actions={
          (isProfileComplete && isSupplier) || user?.role === "admin" ? (
            <Button
              onClick={() => navigate("/products/new")}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <Plus className="h-4 w-4" /> Register New Product
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={products}
            columns={columns}
            searchKeys={["name", "category"]}
            exportFilename="nmicov-products"
            pageSize={12}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
