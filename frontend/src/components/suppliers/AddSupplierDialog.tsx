import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMockData } from "@/contexts/MockDataContext";
import { toast } from "sonner";
import type { Supplier } from "@/contexts/MockDataContext";

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTORS = ["Electrical Equipment", "Defence Electronics", "Aerospace", "Defence", "Naval Engineering", "Heavy Engineering", "Telecom", "Metallurgy", "IT Hardware"];
const STATES = ["Maharashtra", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu", "Delhi", "Uttar Pradesh", "Rajasthan", "Kerala", "West Bengal"];

const AddSupplierDialog = ({ open, onOpenChange }: AddSupplierDialogProps) => {
  const { addSupplier } = useMockData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");
  const [udyam, setUdyam] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [sector, setSector] = useState("");
  const [msmeStatus, setMsmeStatus] = useState("");
  const [status, setStatus] = useState<Supplier["status"]>("pending");

  const resetForm = () => {
    setName(""); setEmail(""); setGst(""); setPan(""); setUdyam("");
    setLocation(""); setState(""); setSector(""); setMsmeStatus(""); setStatus("pending");
  };

  const handleSubmit = () => {
    if (!name || !email || !gst || !state || !sector) {
      toast.error("Please fill in all required fields");
      return;
    }
    addSupplier({ name, email, gst, pan, udyam, location, state, sector, msmeStatus, status, products: 0 });
    toast.success(`Supplier "${name}" added successfully`);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>Register a new supplier in the directory</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Company name" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>GST Number *</Label>
              <Input value={gst} onChange={e => setGst(e.target.value)} placeholder="27AABCU9603R1ZM" />
            </div>
            <div className="space-y-2">
              <Label>PAN</Label>
              <Input value={pan} onChange={e => setPan(e.target.value)} placeholder="AABCU9603R" />
            </div>
            <div className="space-y-2">
              <Label>UDYAM</Label>
              <Input value={udyam} onChange={e => setUdyam(e.target.value)} placeholder="UDYAM-MH-01-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City" />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sector *</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                <SelectContent>
                  {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>MSME Status</Label>
              <Select value={msmeStatus} onValueChange={setMsmeStatus}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["Micro", "Small", "Medium", "Large"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
          <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">Add Supplier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierDialog;
