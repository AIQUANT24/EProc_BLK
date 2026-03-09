import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMockData } from "@/contexts/MockDataContext";
import { toast } from "sonner";
import type { Supplier } from "@/contexts/MockDataContext";

interface EditSupplierDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSupplierDialog = ({ supplier, open, onOpenChange }: EditSupplierDialogProps) => {
  const { updateSupplier } = useMockData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [sector, setSector] = useState("");
  const [msmeStatus, setMsmeStatus] = useState("");
  const [status, setStatus] = useState<Supplier["status"]>("active");

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setEmail(supplier.email);
      setState(supplier.state);
      setSector(supplier.sector);
      setMsmeStatus(supplier.msmeStatus);
      setStatus(supplier.status);
    }
  }, [supplier]);

  const handleSave = () => {
    if (!supplier || !name || !email) {
      toast.error("Please fill in required fields");
      return;
    }
    updateSupplier(supplier.id, { name, email, state, sector, msmeStatus, status });
    toast.success(`Supplier "${name}" updated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>Update supplier details for {supplier?.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sup-name">Name *</Label>
            <Input id="sup-name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sup-email">Email *</Label>
            <Input id="sup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sup-state">State</Label>
              <Input id="sup-state" value={state} onChange={e => setState(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Electrical Equipment", "Defence Electronics", "Aerospace", "Defence", "Naval Engineering", "Heavy Engineering", "Telecom", "Metallurgy", "IT Hardware"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>MSME Status</Label>
              <Select value={msmeStatus} onValueChange={setMsmeStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Micro", "Small", "Medium", "Large"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as Supplier["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gradient-primary text-primary-foreground">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSupplierDialog;
