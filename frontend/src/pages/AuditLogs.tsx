import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ShieldAlert, Database, FileClock, Loader2, Link2 } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface AuditLogDB {
  id: string;
  event: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  details: any;
  user?: {
    fullName: string;
    email: string;
  };
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/audit`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setLogs(response.data.logs);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const columns: Column<AuditLogDB>[] = [
    {
      key: "id",
      label: "Log ID",
      render: (r) => (
        <span className="font-mono text-[10px] text-muted-foreground">
          {r.id.split("-")[0]}
        </span>
      ),
    },
    {
      key: "event",
      label: "Event",
      sortable: true,
      filterOptions: [...new Set(logs.map((l) => l.event))],
      render: (r) => (
        <Badge
          variant={
            r.event.includes("REJECTED")
              ? "destructive"
              : r.event.includes("APPROVED")
                ? "default"
                : "outline"
          }
        >
          {r.event}
        </Badge>
      ),
    },
    {
      key: "entity",
      label: "Entity",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-xs uppercase">{r.entity}</span>
      ),
    },
    {
      key: "user",
      label: "User / System",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {r.user?.fullName || "System Engine"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {r.user?.email || "automated"}
          </span>
        </div>
      ),
    },
    {
      key: "entityId",
      label: "Target ID",
      render: (r) => (
        <span className="font-mono text-xs flex items-center gap-1 text-primary">
          {r.entityId ? (
            <>
              <Link2 className="h-3 w-3" /> {r.entityId.split("-")[0]}
            </>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (r) => (
        <span
          className="text-xs text-muted-foreground max-w-[250px] truncate block"
          title={JSON.stringify(r.details)}
        >
          {r.details?.action || "No additional details"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Timestamp",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-medium">
          {new Date(r.createdAt).toLocaleString("en-IN")}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Retrieving secure audit trail...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="System Audit Trail"
        description="Immutable log of all critical system events, compliance verifications, and user actions."
      />

      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard
          title="Total Events Logged"
          value={logs.length}
          icon={<FileClock className="h-6 w-6" />}
        />
        <StatCard
          title="Unique Event Types"
          value={new Set(logs.map((l) => l.event)).size}
          icon={<Database className="h-6 w-6" />}
        />
        <StatCard
          title="Verified Approvals"
          value={logs.filter((l) => l.event === "PRODUCT_APPROVED").length}
          icon={<ShieldAlert className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Security Layer"
          value="Active"
          subtitle="MySQL Immutable Log"
          icon={<ShieldAlert className="h-6 w-6 text-primary" />}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={logs}
            columns={columns}
            searchKeys={["event", "entity", "entityId"]}
            exportFilename="nmicov-system-audit"
            pageSize={15}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
