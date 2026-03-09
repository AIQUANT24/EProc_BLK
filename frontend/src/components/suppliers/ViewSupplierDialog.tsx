import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Supplier } from "@/contexts/MockDataContext";
import { useMockData } from "@/contexts/MockDataContext";
import { Building2, MapPin, FileText, Shield, Calendar } from "lucide-react";

interface ViewSupplierDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2">
    {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  </div>
);

const ViewSupplierDialog = ({ supplier, open, onOpenChange }: ViewSupplierDialogProps) => {
  const { ledger, products } = useMockData();

  if (!supplier) return null;

  const supplierProducts = products.filter(p => p.supplierId === supplier.id);
  const supplierLogs = ledger.filter(l => l.entity === supplier.id).slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {supplier.name}
          </DialogTitle>
          <DialogDescription>{supplier.id} · Registered {supplier.createdAt}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={supplier.status === "active" ? "default" : supplier.status === "pending" ? "secondary" : "destructive"}>
              {supplier.status}
            </Badge>
            <Badge variant="outline">{supplier.msmeStatus}</Badge>
            <Badge variant="outline">{supplier.sector}</Badge>
          </div>

          <Separator />

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-6">
            <InfoRow label="Email" value={supplier.email} icon={<FileText className="h-4 w-4" />} />
            <InfoRow label="Location" value={`${supplier.location}, ${supplier.state}`} icon={<MapPin className="h-4 w-4" />} />
            <InfoRow label="GST Number" value={supplier.gst} icon={<Shield className="h-4 w-4" />} />
            <InfoRow label="PAN" value={supplier.pan} />
            <InfoRow label="UDYAM" value={supplier.udyam} />
            <InfoRow label="Registered" value={supplier.createdAt} icon={<Calendar className="h-4 w-4" />} />
          </div>

          <Separator />

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Products ({supplierProducts.length})</h4>
            {supplierProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No products registered</p>
            ) : (
              <div className="space-y-1">
                {supplierProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50">
                    <span className="font-medium">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                      <Badge variant={p.status === "verified" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Audit Trail */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Audit Trail</h4>
            {supplierLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No audit entries</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {supplierLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{log.event}</Badge>
                      <span className="text-muted-foreground">{log.user}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSupplierDialog;
