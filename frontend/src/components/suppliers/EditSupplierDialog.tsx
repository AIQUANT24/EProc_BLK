import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditSupplierDialogProps {
  supplier: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const EditSupplierDialog = ({
  supplier,
  open,
  onOpenChange,
  onSuccess,
}: EditSupplierDialogProps) => {
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");
  const [udyam, setUdyam] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [sector, setSector] = useState("");
  const [msmeStatus, setMsmeStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplier) {
      setGst(supplier.gst || "");
      setPan(supplier.pan || "");
      setUdyam(supplier.udyam || "");
      setLocation(supplier.location || "");
      setState(supplier.state || "");
      setSector(supplier.sector || "");
      setMsmeStatus(supplier.msmeStatus || "");
    }
  }, [supplier]);

  const handleSave = async () => {
    if (!supplier) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers/${supplier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gst,
          pan,
          udyam,
          location,
          state,
          msmeStatus,
          sector,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success(`Business profile for "${supplier.name}" updated`);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to update supplier details");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Supplier Profile</DialogTitle>
          <DialogDescription>
            Updating business data for {supplier?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input value={gst} onChange={(e) => setGst(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Electrical Equipment",
                    "Defence Electronics",
                    "Aerospace",
                    "Defence",
                    "Naval Engineering",
                    "Heavy Engineering",
                    "Telecom",
                    "Metallurgy",
                    "IT Hardware",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>MSME Status</Label>
            <Select value={msmeStatus} onValueChange={setMsmeStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Micro", "Small", "Medium", "Large"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="gradient-primary text-primary-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSupplierDialog;
