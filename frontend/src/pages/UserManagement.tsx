import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2, Calendar } from "lucide-react";
import InviteUserDialog from "@/components/users/InviteUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

// Matches Sequelize Model
interface DBUser {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "procurement" | "supplier" | "auditor" | "superadmin";
  organization?: string;
  department?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<DBUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DBUser | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/users`, {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch (error) {
      toast.error("Network error: Could not reach the server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`${API_URL}/users/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success(`User deleted: ${deleteTarget.fullName}`);
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const columns: Column<DBUser>[] = [
    {
      key: "fullName",
      label: "Name",
      sortable: true,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.fullName}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {r.id.split("-")[0]}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      render: (r) => <span className="text-sm">{r.email}</span>,
    },
    {
      key: "role",
      label: "System Role",
      sortable: true,
      filterOptions: [
        "superadmin",
        "admin",
        "procurement",
        "supplier",
        "auditor",
      ],
      render: (r) => (
        <Badge
          variant={r.role === "superadmin" ? "destructive" : "outline"}
          className="capitalize"
        >
          {r.role}
        </Badge>
      ),
    },
    { key: "organization", label: "Organization", sortable: true },
    {
      key: "createdAt",
      label: "Joined Date",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      ),
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
          {r.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        description={`${users.length} registered system users`}
        actions={
          <Button
            className="gradient-primary text-primary-foreground gap-2"
            onClick={() => setInviteOpen(true)}
          >
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-5 mb-6">
        {["superadmin", "admin", "procurement", "supplier", "auditor"].map(
          (role) => (
            <Card
              key={role}
              className="overflow-hidden border-t-4 border-t-primary/20"
            >
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">
                  {role}s
                </p>
                <p className="text-2xl font-bold font-display">
                  {users.filter((u) => u.role === role).length}
                </p>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                </div>
              </div>
              <p className="text-sm font-medium animate-pulse">
                Fetching user directory...
              </p>
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              searchKeys={["fullName", "email", "organization", "department"]}
              exportFilename="nmicov-user-registry"
              pageSize={10}
              rowActions={(row) => (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setEditUser(row)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={fetchUsers}
      />

      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        onSuccess={fetchUsers}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`This action cannot be undone. This will permanently delete the account for ${deleteTarget?.fullName}.`}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UserManagement;
