import { useMockData } from "@/contexts/MockDataContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

const ProcurementDashboard = () => {
  // Once backend is ready, replace useMockData with TanStack Query (useQuery)
  const { compliance, verificationLogs, alerts } = useMockData();

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Procurement Dashboard"
        description="Monitor supplier verification status and PPP-MII compliance overview"
      />

      {/* KPI Overview */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Verified Suppliers"
          value={compliance.filter((c) => c.status === "compliant").length}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Pending Reviews"
          value={compliance.filter((c) => c.status === "under-review").length}
          icon={<Search className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Non-Compliant"
          value={compliance.filter((c) => c.status === "non-compliant").length}
          icon={<ShieldCheck className="h-6 w-6 text-destructive" />}
        />
        <StatCard
          title="Active Alerts"
          value={alerts.filter((a) => !a.resolved).length}
          icon={<AlertTriangle className="h-6 w-6 text-warning" />}
        />
      </div>

      {/* Main Verification Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl">
            Recent Verification Requests
          </CardTitle>
          <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="h-3 w-3" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Supplier</TableHead>
                  <TableHead className="font-semibold">Requested By</TableHead>
                  <TableHead className="font-semibold">DVA Score</TableHead>
                  <TableHead className="font-semibold text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationLogs.length > 0 ? (
                  verificationLogs.map((v) => (
                    <TableRow
                      key={v.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {v.productName}
                      </TableCell>
                      <TableCell>{v.supplierName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.requestedBy}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              Number(v.dvaScore) >= 50
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {v.dvaScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className="capitalize"
                          variant={
                            v.status === "verified"
                              ? "default"
                              : v.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No recent verification requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcurementDashboard;
