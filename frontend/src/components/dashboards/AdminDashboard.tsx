import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Package,
  ShieldCheck,
  AlertTriangle,
  Activity,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;
const PIE_COLORS = ["hsl(162,72%,45%)", "hsl(262,83%,58%)", "hsl(0,84%,60%)"];

interface AdminProduct {
  id: string;
  name: string;
  dvaScore: number | null;
  classification: string | null;
  status:
    | "draft"
    | "under_review"
    | "verified"
    | "active"
    | "archived"
    | "non-compliant";
  risk: number | null;
  supplier?: {
    gst: string;
    user?: {
      fullName: string;
    };
  };
}

interface AdminSupplier {
  id: string;
  state: string;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch both products and suppliers concurrently
      const [prodRes, suppRes] = await Promise.all([
        axios
          .get(`${API_URL}/products`, { withCredentials: true })
          .catch((e) => e.response),
        axios
          .get(`${API_URL}/suppliers`, { withCredentials: true })
          .catch((e) => e.response),
      ]);

      if (prodRes?.data?.success) {
        // Filter out drafts for admin view
        setProducts(
          prodRes.data.products.filter(
            (p: AdminProduct) => p.status !== "draft",
          ),
        );
      }

      if (suppRes?.data?.success) {
        setSuppliers(suppRes.data.suppliers);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Dynamic KPI Calculations ---
  const submittedProducts = products.filter((p) => p.status !== "draft");
  const compliantProducts = submittedProducts.filter((c) =>
    ["verified", "compliant", "active"].includes(c.status),
  );

  const complianceRate =
    submittedProducts.length > 0
      ? ((compliantProducts.length / submittedProducts.length) * 100).toFixed(0)
      : "0";

  // Identify products where AI risk > 40%
  const highRiskAlerts = submittedProducts
    .filter((p) => p.risk !== null && p.risk > 40)
    .sort((a, b) => (b.risk || 0) - (a.risk || 0));

  // --- Chart Data Preparation ---
  const classDistribution = [
    {
      name: "Class I",
      value: submittedProducts.filter((c) => c.classification === "Class I")
        .length,
    },
    {
      name: "Class II",
      value: submittedProducts.filter((c) => c.classification === "Class II")
        .length,
    },
    {
      name: "Non-Local",
      value: submittedProducts.filter(
        (c) => c.classification === "Non-Local" || !c.classification,
      ).length,
    },
  ];

  const dvaData = [...submittedProducts]
    .filter((p) => p.dvaScore !== null)
    .sort((a, b) => (b.dvaScore || 0) - (a.dvaScore || 0)) // Top scores first
    .slice(0, 10)
    .map((c) => ({
      name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
      dva: Number(c.dvaScore),
    }));

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Aggregating national data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and national compliance analytics"
      />

      {/* Primary KPI Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Suppliers"
          value={suppliers.length}
          icon={<Building2 className="h-6 w-6" />}
          subtitle={`Across ${new Set(suppliers.map((s) => s.state)).size} states`}
        />
        <StatCard
          title="Products Submitted"
          value={submittedProducts.length}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Compliance Rate"
          value={`${complianceRate}%`}
          icon={<ShieldCheck className="h-6 w-6" />}
          subtitle={`${compliantProducts.length} of ${submittedProducts.length} compliant`}
        />
        <StatCard
          title="AI Risk Alerts"
          value={highRiskAlerts.length}
          icon={
            <AlertTriangle
              className={
                highRiskAlerts.length > 0
                  ? "h-6 w-6 text-destructive"
                  : "h-6 w-6"
              }
            />
          }
          subtitle="Products with >40% risk score"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <TrendingUp className="h-5 w-5 text-primary" />
              DVA Scores (Top 10 Products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dvaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dvaData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar
                    dataKey="dva"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Activity className="h-5 w-5 text-primary" />
              MII Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submittedProducts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {classDistribution.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip cursor={{ fill: "transparent" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {classDistribution.map((d, i) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ background: PIE_COLORS[i] }}
                        />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risks/Alerts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            AI Detected Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {highRiskAlerts.length > 0 ? (
              highRiskAlerts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-destructive/10">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Supplier:{" "}
                        {p.supplier?.user?.fullName ||
                          p.supplier?.gst ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-destructive">
                        AI Risk Score
                      </p>
                      <p className="text-sm font-bold text-destructive">
                        {p.risk}%
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-destructive border-destructive/50 bg-white"
                    >
                      Action Required
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border-2 border-dashed rounded-lg border-border">
                <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  No high-risk anomalies detected by AI currently.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
