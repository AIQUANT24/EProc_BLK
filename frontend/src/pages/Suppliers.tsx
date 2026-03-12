import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import AddSupplierDialog from "@/components/suppliers/AddSupplierDialog";
import EditSupplierDialog from "@/components/suppliers/EditSupplierDialog";
import ViewSupplierDialog from "@/components/suppliers/ViewSupplierDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

// Matches your controller's formattedSuppliers output
interface SupplierDB {
  id: string;
  name: string; // From userDetails.fullName
  email: string; // From userDetails.email
  status: "active" | "inactive" | "suspended"; // From userDetails.status
  gst: string;
  pan: string;
  udyam: string;
  location: string;
  state: string;
  msmeStatus: string;
  sector: string;
  products: number;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<SupplierDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<SupplierDB | null>(null);
  const [viewSupplier, setViewSupplier] = useState<SupplierDB | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierDB | null>(null);

  // --- API: Fetch Suppliers ---
  const fetchSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/suppliers`, {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setSuppliers(data.suppliers);
      } else {
        toast.error(data.message || "Failed to load suppliers");
      }
    } catch (error) {
      toast.error("Network error: Could not reach the server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // --- API: Delete Supplier ---
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`${API_URL}/suppliers/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success(`Supplier "${deleteTarget.name}" deleted successfully`);
        setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error("Failed to delete supplier profile");
      }
    } catch (error) {
      toast.error("Server error during deletion");
    }
  };

  const columns: Column<SupplierDB>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "font-mono text-[10px] w-24",
      render: (r) => <span>{r.id.split("-")[0]}...</span>,
    },
    {
      key: "name",
      label: "Supplier Name",
      sortable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "gst",
      label: "GSTN",
      className: "font-mono text-xs",
      render: (r) => (
        <span className="font-mono text-xs uppercase">{r.gst}</span>
      ),
    },
    { key: "state", label: "State", sortable: true },
    {
      key: "sector",
      label: "Sector",
      sortable: true,
      filterOptions: [
        "Electrical Equipment",
        "Defence Electronics",
        "Aerospace",
        "Defence",
        "Telecom",
        "IT Hardware",
      ],
    },
    {
      key: "msmeStatus",
      label: "MSME Type",
      sortable: true,
      filterOptions: ["Micro", "Small", "Medium", "Large"],
    },
    {
      key: "products",
      label: "Units",
      sortable: true,
      render: (r) => <span className="font-medium">{r.products}</span>,
    },
    {
      key: "status",
      label: "Status",
      filterOptions: ["active", "inactive", "suspended"],
      render: (r) => (
        <Badge
          variant={
            r.status === "active"
              ? "default"
              : r.status === "inactive"
                ? "secondary"
                : "destructive"
          }
        >
          {r.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Registered",
      sortable: true,
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {new Date(r.createdAt).toLocaleDateString("en-IN")}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Supplier Directory"
        description={`${suppliers.length} registered suppliers across ${new Set(suppliers.map((s) => s.state)).size} states.`}
        actions={
          <Button
            className="gradient-primary text-primary-foreground gap-2"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">
                Loading supplier directory...
              </p>
            </div>
          ) : (
            <DataTable
              data={suppliers}
              columns={columns}
              searchKeys={["name", "gst", "location", "state", "sector"]}
              exportFilename="nmicov-suppliers-registry"
              pageSize={15}
              rowActions={(row) => (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewSupplier(row)}
                  >
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditSupplier(row)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <AddSupplierDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={fetchSuppliers}
      />

      <EditSupplierDialog
        supplier={editSupplier}
        open={!!editSupplier}
        onOpenChange={(open) => !open && setEditSupplier(null)}
        onSuccess={fetchSuppliers}
      />

      <ViewSupplierDialog
        supplier={viewSupplier}
        open={!!viewSupplier}
        onOpenChange={(open) => !open && setViewSupplier(null)}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Supplier Profile"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove their business profile data permanently.`}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Suppliers;
