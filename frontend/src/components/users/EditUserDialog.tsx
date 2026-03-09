import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMockData } from "@/contexts/MockDataContext";
import { toast } from "sonner";
import type { PlatformUser } from "@/contexts/MockDataContext";

interface EditUserDialogProps {
  user: PlatformUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserDialog = ({ user, open, onOpenChange }: EditUserDialogProps) => {
  const { updateUser } = useMockData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PlatformUser["role"]>("procurement");
  const [organization, setOrganization] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<PlatformUser["status"]>("active");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setOrganization(user.organization);
      setDepartment(user.department);
      setStatus(user.status);
    }
  }, [user]);

  const handleSave = () => {
    if (!user || !name || !email) {
      toast.error("Please fill in required fields");
      return;
    }
    updateUser(user.id, { name, email, role, organization, department, status });
    toast.success(`User "${name}" updated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details for {user?.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usr-name">Name *</Label>
            <Input id="usr-name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usr-email">Email *</Label>
            <Input id="usr-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={v => setRole(v as PlatformUser["role"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="procurement">Procurement</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="usr-org">Organization</Label>
            <Input id="usr-org" value={organization} onChange={e => setOrganization(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usr-dept">Department</Label>
            <Input id="usr-dept" value={department} onChange={e => setDepartment(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as PlatformUser["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
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

export default EditUserDialog;
