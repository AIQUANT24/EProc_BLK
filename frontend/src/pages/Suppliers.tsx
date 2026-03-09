import { useState } from "react";
import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import type { Supplier } from "@/contexts/MockDataContext";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import AddSupplierDialog from "@/components/suppliers/AddSupplierDialog";
import EditSupplierDialog from "@/components/suppliers/EditSupplierDialog";
import ViewSupplierDialog from "@/components/suppliers/ViewSupplierDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

const Suppliers = () => {
  const { suppliers, deleteSupplier } = useMockData();
  const { t, language } = useLanguage();
  const [addOpen, setAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const columns: Column<Supplier>[] = [
    { key: "id", label: "ID", sortable: true, className: "font-mono text-xs w-24", render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: "name", label: t("labelName"), sortable: true, render: r => <span className="font-medium">{r.name}</span> },
    { key: "gst", label: t("supplierGSTN"), className: "font-mono text-xs", render: r => <span className="font-mono text-xs">{r.gst}</span> },
    { key: "state", label: language === "hi" ? "राज्य" : "State", sortable: true },
    { key: "sector", label: language === "hi" ? "क्षेत्र" : "Sector", sortable: true, filterOptions: ["Electrical Equipment", "Defence Electronics", "Aerospace", "Defence", "Naval Engineering", "Heavy Engineering", "Telecom", "Metallurgy", "IT Hardware"] },
    { key: "msmeStatus", label: t("supplierMSME"), sortable: true, filterOptions: ["Micro", "Small", "Medium", "Large"] },
    { key: "products", label: t("navProducts"), sortable: true, render: r => <span className="font-medium">{r.products}</span> },
    { key: "status", label: t("labelStatus"), filterOptions: ["active", "pending", "suspended"], render: r => (
      <Badge variant={r.status === "active" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>{r.status === "active" ? t("statusActive") : r.status === "pending" ? t("statusPending") : t("statusSuspended")}</Badge>
    )},
    { key: "createdAt", label: language === "hi" ? "पंजीकृत" : "Registered", sortable: true },
  ];

  

  const handleDelete = () => {
    if (deleteTarget) {
      deleteSupplier(deleteTarget.id);
      toast.success(`${language === "hi" ? "आपूर्तिकर्ता" : "Supplier"} "${deleteTarget.name}" ${language === "hi" ? "हटाया गया" : "deleted"}`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t("suppliersTitle")}
        description={`${suppliers.length} ${language === "hi" ? "पंजीकृत आपूर्तिकर्ता" : "registered suppliers across"} ${new Set(suppliers.map(s => s.state)).size} ${language === "hi" ? "राज्यों में" : "states"}`}
        actions={
          <Button className="gradient-primary text-primary-foreground gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> {t("supplierAdd")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={suppliers}
            columns={columns}
            searchKeys={["name", "gst", "location", "state", "sector"]}
            exportFilename="nmicov-suppliers"
            pageSize={20}
            rowActions={(row) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewSupplier(row)}>
                  <Eye className="h-3.5 w-3.5 text-primary" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditSupplier(row)}>
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteTarget(row)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <AddSupplierDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditSupplierDialog supplier={editSupplier} open={!!editSupplier} onOpenChange={open => !open && setEditSupplier(null)} />
      <ViewSupplierDialog supplier={viewSupplier} open={!!viewSupplier} onOpenChange={open => !open && setViewSupplier(null)} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title={language === "hi" ? "आपूर्तिकर्ता हटाएं" : "Delete Supplier"}
        description={`${language === "hi" ? "क्या आप वाकई" : "Are you sure you want to delete"} "${deleteTarget?.name}" ${language === "hi" ? "को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।" : "? This action cannot be undone."}`}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Suppliers;
