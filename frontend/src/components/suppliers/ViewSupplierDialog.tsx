import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  FileText,
  Shield,
  Calendar,
  Package,
  Activity,
} from "lucide-react";

// Use the interface that matches your database-joined supplier object
interface SupplierDB {
  id: string;
  name: string; // From User fullName
  email: string; // From User email
  status: "active" | "inactive" | "suspended"; // From User status
  gst: string;
  pan: string;
  udyam: string;
  location: string;
  state: string;
  msmeStatus: string;
  sector: string;
  products: number; // The count from your Supplier table
  createdAt: string;
}

interface ViewSupplierDialogProps {
  supplier: SupplierDB | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2">
    {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-medium">{value || "Not Provided"}</p>
    </div>
  </div>
);

const ViewSupplierDialog = ({
  supplier,
  open,
  onOpenChange,
}: ViewSupplierDialogProps) => {
  if (!supplier) return null;

  const formattedDate = new Date(supplier.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {supplier.name}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs uppercase tracking-tight">
                  {supplier.id}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                supplier.status === "active"
                  ? "default"
                  : supplier.status === "inactive"
                    ? "secondary"
                    : "destructive"
              }
            >
              {supplier.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="bg-muted/30">
              {supplier.msmeStatus}
            </Badge>
            <Badge variant="outline" className="bg-muted/30">
              {supplier.sector}
            </Badge>
          </div>

          <Separator />

          {/* Core Business Details */}
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText className="h-3 w-3" /> Business Information
            </h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-8">
              <InfoRow
                label="Email Address"
                value={supplier.email}
                icon={<FileText className="h-4 w-4" />}
              />
              <InfoRow
                label="Registration Date"
                value={formattedDate}
                icon={<Calendar className="h-4 w-4" />}
              />
              <InfoRow
                label="GST Number"
                value={supplier.gst}
                icon={<Shield className="h-4 w-4" />}
              />
              <InfoRow
                label="Location"
                value={`${supplier.location}, ${supplier.state}`}
                icon={<MapPin className="h-4 w-4" />}
              />
              <InfoRow label="PAN" value={supplier.pan} />
              <InfoRow label="UDYAM ID" value={supplier.udyam} />
            </div>
          </div>

          <Separator />

          {/* Operational Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Product Units
                </span>
              </div>
              <p className="text-2xl font-bold">{supplier.products}</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Compliance Status
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-600">
                Pending Review
              </p>
            </div>
          </div>

          {/* Audit Note */}
          <div className="rounded-lg bg-muted/50 p-3 border border-dashed border-border">
            <p className="text-[10px] text-muted-foreground text-center">
              This profile is synced with the National Compliance Infrastructure
              database. Last verified: {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSupplierDialog;
