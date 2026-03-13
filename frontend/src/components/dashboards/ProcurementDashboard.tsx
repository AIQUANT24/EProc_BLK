import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface AdminProduct {
  id: string;
  name: string;
  dvaScore: number | null;
  classification: string | null;
  status: "draft" | "under_review" | "verified" | "active" | "archived";
  risk: number | null;
  createdAt: string;
  supplier?: {
    gst: string;
    user?: {
      fullName: string;
    };
  };
}
const CustomAlertTriangle: React.FC<{ title: string }> = ({ title }) => (
  <AlertTriangle className="inline-block ml-2 h-3 w-3 text-red-500" />
);

const ProcurementDashboard = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        // Filter out drafts, admins only care about submitted products
        const submittedProducts = response.data.products.filter(
          (p: AdminProduct) => p.status !== "draft",
        );
        setProducts(submittedProducts);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- KPI Calculations ---
  const verifiedProducts = products.filter(
    (p) => p.status === "verified" || p.status === "active",
  ).length;
  const pendingReviews = products.filter(
    (p) => p.status === "under_review",
  ).length;
  const nonCompliant = products.filter(
    (p) => p.classification === "Non-Local" || p.status === "archived",
  ).length;
  // High risk alerts triggered by AI (e.g. Risk score > 40%)
  const activeAlerts = products.filter(
    (p) => p.risk !== null && p.risk > 40,
  ).length;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Loading procurement data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Procurement Dashboard"
        description="Monitor supplier verification status and PPP-MII compliance overview"
      />

      {/* KPI Overview */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Verified Products"
          value={verifiedProducts}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Pending Reviews"
          value={pendingReviews}
          icon={<Search className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Non-Compliant"
          value={nonCompliant}
          icon={<ShieldCheck className="h-6 w-6 text-destructive" />}
        />
        <StatCard
          title="AI Risk Alerts"
          value={activeAlerts}
          icon={<AlertTriangle className="h-6 w-6 text-warning" />}
        />
      </div>

      {/* Main Verification Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl">
            Recent Verification Requests
          </CardTitle>
          <button
            onClick={() => navigate("/verification")}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            View All <ArrowUpRight className="h-3 w-3" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Supplier Name</TableHead>
                  <TableHead className="font-semibold">DVA Score</TableHead>
                  <TableHead className="font-semibold text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  // Show the newest 10 requests
                  products.slice(0, 10).map((v) => (
                    <TableRow
                      key={v.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {v.name}
                        {v.risk && v.risk > 40 && (
                          <CustomAlertTriangle title="High Risk AI Alert" />
                        )}
                      </TableCell>
                      <TableCell>
                        {v.supplier?.user?.fullName ||
                          v.supplier?.gst ||
                          "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              Number(v.dvaScore) >= 50
                                ? "text-green-600"
                                : Number(v.dvaScore) >= 20
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {v.dvaScore !== null ? `${v.dvaScore}%` : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className="capitalize"
                          variant={
                            v.status === "verified" || v.status === "active"
                              ? "default"
                              : v.status === "under_review"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {v.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
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
