import { useMockData } from "@/contexts/MockDataContext";
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
  Users,
  FileText,
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

const PIE_COLORS = ["hsl(162,72%,45%)", "hsl(262,83%,58%)", "hsl(0,84%,60%)"];

const AdminDashboard = () => {
  // Note: Once you integrate your backend, these will come from
  // an API call/TanStack Query rather than useMockData.
  const {
    suppliers,
    products,
    compliance,
    alerts,
    verificationLogs,
    users,
    ledger,
  } = useMockData();

  const classDistribution = [
    {
      name: "Class I",
      value: compliance.filter((c) => c.classification === "Class I").length,
    },
    {
      name: "Class II",
      value: compliance.filter((c) => c.classification === "Class II").length,
    },
    {
      name: "Non-Local",
      value: compliance.filter((c) => c.classification === "Non-Local").length,
    },
  ];

  const dvaData = compliance.slice(0, 10).map((c) => ({
    name:
      c.productName.length > 12
        ? c.productName.slice(0, 12) + "…"
        : c.productName,
    dva: c.dvaScore,
  }));

  const complianceRate =
    compliance.length > 0
      ? (
          (compliance.filter((c) => c.status === "compliant").length /
            compliance.length) *
          100
        ).toFixed(0)
      : "0";

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
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Products Registered"
          value={products.length}
          icon={<Package className="h-6 w-6" />}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Compliance Rate"
          value={`${complianceRate}%`}
          icon={<ShieldCheck className="h-6 w-6" />}
          subtitle={`${compliance.filter((c) => c.status === "compliant").length} of ${compliance.length} compliant`}
        />
        <StatCard
          title="Active Alerts"
          value={alerts.filter((a) => !a.resolved).length}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend={{ value: 15, positive: false }}
        />
      </div>

      {/* Secondary Meta Stats Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Platform Users"
          value={users.length}
          icon={<Users className="h-6 w-6" />}
          subtitle={`${users.filter((u) => u.status === "active").length} active now`}
        />
        <StatCard
          title="Verifications"
          value={verificationLogs.length}
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <StatCard
          title="Ledger Entries"
          value={ledger.length}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="States Covered"
          value={new Set(suppliers.map((s) => s.state)).size}
          icon={<Building2 className="h-6 w-6" />}
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
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dvaData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
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
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
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
          </CardContent>
        </Card>
      </div>

      {/* Risks/Alerts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display">Recent Risk Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {alerts.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      a.severity === "high"
                        ? "bg-destructive/10"
                        : "bg-warning/10"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        a.severity === "high"
                          ? "text-destructive"
                          : "text-warning"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{a.productName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {a.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      a.severity === "high" ? "destructive" : "secondary"
                    }
                  >
                    {a.severity.toUpperCase()}
                  </Badge>
                  {a.resolved && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
