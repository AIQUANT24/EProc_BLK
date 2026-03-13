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
import { Plus, Loader2, ListTree, FileSearch, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  // File Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [currentProductName, setCurrentProductName] = useState("");

  const isSupplier = user?.role === "supplier";

  const [dashboardData, setDashboardData] = useState({
    supplierProfile: null as any,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/suppliers/profile`, {
        withCredentials: true,
      });
      if (response.data?.success) {
        setDashboardData({ supplierProfile: response.data.supplier });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDashboardData({ supplierProfile: null });
      }
    }
  }, []);

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
    if (user) fetchDashboardData();
    fetchProducts();
  }, [user, fetchDashboardData, fetchProducts]);

  const isProfileComplete = !!dashboardData.supplierProfile;

  // --- FILE VIEWER HANDLER ---
  const handleViewFile = async (productId: string, productName: string) => {
    setViewerOpen(true);
    setFileLoading(true);
    setCurrentProductName(productName);
    setFileUrl(null);

    try {
      // Fetch the file as a Blob (Binary Data)
      const response = await axios.get(
        `${API_URL}/files/product/${productId}`,
        {
          withCredentials: true,
          responseType: "blob", // CRITICAL for handling files in Axios
        },
      );

      // Convert the Blob into a readable Object URL for the browser
      const url = URL.createObjectURL(
        new Blob([response.data], { type: response.headers["content-type"] }),
      );
      setFileUrl(url);
    } catch (error: any) {
      setViewerOpen(false);
      if (error.response?.status === 404) {
        toast.warning("No document found for this product.");
      } else {
        toast.error("Failed to load document.");
      }
    } finally {
      setFileLoading(false);
    }
  };

  // Clean up Object URLs to prevent memory leaks
  const handleCloseViewer = () => {
    setViewerOpen(false);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

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
    {
      key: "actions" as any,
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          {/* View Document Button */}
          <Button
            size="sm"
            variant="ghost"
            title="View Original Document"
            onClick={() => handleViewFile(r.id, r.name)}
            className="text-muted-foreground hover:text-primary px-2"
          >
            <FileSearch className="h-4 w-4" />
          </Button>

          {/* Manage BOM Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/bom/${r.id}`)}
            className="gap-2 text-xs"
          >
            <ListTree className="h-3 w-3" /> Manage BOM
          </Button>
        </div>
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
          isProfileComplete &&
          isSupplier && (
            <Button
              onClick={() => navigate("/products/new")}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <Plus className="h-4 w-4" /> Register New Product
            </Button>
          )
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

      {/* --- DOCUMENT VIEWER MODAL --- */}
      <Dialog
        open={viewerOpen}
        onOpenChange={(open) => !open && handleCloseViewer()}
      >
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-muted/30 border-muted">
          {/* Custom Header to allow full height iframe */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm z-10">
            <div>
              <DialogTitle className="text-lg flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                BOM Document
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {currentProductName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseViewer}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 w-full bg-black/5 relative overflow-hidden flex items-center justify-center">
            {fileLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Retrieving document...
                </p>
              </div>
            ) : fileUrl ? (
              <iframe
                src={fileUrl}
                className="w-full h-full border-0 bg-white"
                title="BOM Document Viewer"
              />
            ) : (
              <p className="text-muted-foreground">
                Document could not be loaded.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
