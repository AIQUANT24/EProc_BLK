import { useState } from "react";
import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { PlatformUser } from "@/contexts/MockDataContext";
import InviteUserDialog from "@/components/users/InviteUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

const roleColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  superadmin: "destructive",
  admin: "default",
  procurement: "secondary",
  supplier: "outline",
  auditor: "secondary",
};

const UserManagement = () => {
  const { users, deleteUser } = useMockData();
  const { t, language } = useLanguage();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<PlatformUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformUser | null>(null);

  const columns: Column<PlatformUser>[] = [
    { key: "id", label: "ID", sortable: true, render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: "name", label: t("labelName"), sortable: true, render: r => <span className="font-medium">{r.name}</span> },
    { key: "email", label: t("labelEmail"), render: r => <span className="text-sm">{r.email}</span> },
    { key: "role", label: t("labelRole"), sortable: true, filterOptions: ["superadmin", "admin", "procurement", "supplier", "auditor"], render: r => (
      <Badge variant={roleColors[r.role] || "outline"}>{r.role}</Badge>
    )},
    { key: "organization", label: t("labelOrganization"), sortable: true },
    { key: "department", label: t("labelDepartment") },
    { key: "lastLogin", label: t("labelLastLogin"), sortable: true, render: r => <span className="text-xs text-muted-foreground">{new Date(r.lastLogin).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> },
    { key: "status", label: t("labelStatus"), filterOptions: ["active", "inactive", "suspended"], render: r => (
      <Badge variant={r.status === "active" ? "default" : r.status === "inactive" ? "secondary" : "destructive"}>
        {r.status === "active" ? t("statusActive") : r.status === "inactive" ? t("statusInactive") : t("statusSuspended")}
      </Badge>
    )},
  ];

  const handleDelete = () => {
    if (deleteTarget) {
      deleteUser(deleteTarget.id);
      toast.success(`${language === "hi" ? "उपयोगकर्ता" : "User"} "${deleteTarget.name}" ${t("toastDeleted").toLowerCase()}`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t("usersTitle")}
        description={`${users.length} ${language === "hi" ? "प्लेटफॉर्म उपयोगकर्ता" : "platform users"} · ${users.filter(u => u.status === "active").length} ${t("statusActive").toLowerCase()}`}
        actions={
          <Button className="gradient-primary text-primary-foreground gap-2" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" /> {t("userInvite")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-5 mb-6">
        {(["superadmin", "admin", "procurement", "supplier", "auditor"] as const).map(role => (
          <Card key={role}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t(`role${role.charAt(0).toUpperCase() + role.slice(1)}` as any)}s</p>
              <p className="text-2xl font-bold font-display">{users.filter(u => u.role === role).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={users}
            columns={columns}
            searchKeys={["name", "email", "organization", "department"]}
            exportFilename="nmicov-users"
            pageSize={20}
            dateFilterKey="lastLogin"
            rowActions={(row) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditUser(row)}>
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

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <EditUserDialog user={editUser} open={!!editUser} onOpenChange={open => !open && setEditUser(null)} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title={t("userDelete")}
        description={`${t("dialogDeleteMessage").split("?")[0]}? "${deleteTarget?.name}"`}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UserManagement;
