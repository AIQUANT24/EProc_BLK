import { useState } from "react";
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

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SECTORS = [
  "Electrical Equipment",
  "Defence Electronics",
  "Aerospace",
  "Defence",
  "Naval Engineering",
  "Heavy Engineering",
  "Telecom",
  "Metallurgy",
  "IT Hardware",
];
const STATES = [
  "Maharashtra",
  "Karnataka",
  "Telangana",
  "Gujarat",
  "Tamil Nadu",
  "Delhi",
  "Uttar Pradesh",
  "Rajasthan",
  "Kerala",
  "West Bengal",
];
const API_URL = import.meta.env.VITE_API_URL;

const AddSupplierDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddSupplierDialogProps) => {
  const [email, setEmail] = useState("");
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");
  const [udyam, setUdyam] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [sector, setSector] = useState("");
  const [msmeStatus, setMsmeStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setGst("");
    setPan("");
    setUdyam("");
    setLocation("");
    setState("");
    setSector("");
    setMsmeStatus("");
  };

  const handleSubmit = async () => {
    if (!email || !gst || !state || !sector) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          gst,
          pan,
          udyam,
          location,
          state,
          msmeStatus,
          sector,
          products: 0,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Supplier profile created successfully");
        resetForm();
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.message || "Failed to create supplier");
      }
    } catch (error) {
      toast.error("Server connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Link a business profile to an existing user email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 py-2">
          <div className="space-y-2">
            <Label>User Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Must match a registered user email"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>GST Number *</Label>
              <Input
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="27AABC..."
              />
            </div>
            <div className="space-y-2">
              <Label>PAN</Label>
              <Input
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="AABCU..."
              />
            </div>
            <div className="space-y-2">
              <Label>UDYAM</Label>
              <Input
                value={udyam}
                onChange={(e) => setUdyam(e.target.value)}
                placeholder="UDYAM-MH..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sector *</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>MSME Status</Label>
              <Select value={msmeStatus} onValueChange={setMsmeStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gradient-primary text-primary-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add Supplier"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierDialog;
