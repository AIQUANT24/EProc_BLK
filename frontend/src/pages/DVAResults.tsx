import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

// Interface reflecting the data coming from your Express backend
interface ProductResult {
  id: string;
  name: string;
  category: string;
  dvaScore: number;
  classification: "Class I" | "Class II" | "Non-Local";
  status: "draft" | "under_review" | "verified" | "active" | "archived";
  supplier?: {
    gst: string;
    sector: string;
  };
  confidence: number;
  risk: number;
}

const classColor = (c: string): "default" | "secondary" | "destructive" =>
  c === "Class I" ? "default" : c === "Class II" ? "secondary" : "destructive";

const DVAResults = () => {
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        // Filter out drafts. We only want to analyze submitted/verified BOMs.
        const submittedProducts = (response.data.products || []).filter(
          (p: ProductResult) => p.status !== "draft" && p.dvaScore !== null,
        );
        setProducts(submittedProducts);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load DVA results",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const columns: Column<ProductResult>[] = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "supplier",
      label: "Supplier (GST)",
      render: (r) => <span>{r.supplier?.gst || "Self"}</span>,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterOptions: [
        "Electrical Equipment",
        "Defence Electronics",
        "Aerospace",
        "Defence",
        "Heavy Engineering",
        "Telecom",
        "Metallurgy",
        "IT Hardware",
        "Naval Engineering",
      ],
    },
    {
      key: "dvaScore",
      label: "DVA Score",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm w-12">{r.dvaScore}%</span>
          <Progress value={r.dvaScore} className="h-1.5 w-16" />
        </div>
      ),
    },
    {
      key: "classification",
      label: "Classification",
      filterOptions: ["Class I", "Class II", "Non-Local"],
      render: (r) => (
        <Badge variant={classColor(r.classification)}>{r.classification}</Badge>
      ),
    },
    {
      key: "confidence",
      label: "Confidence",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm w-12">{r.confidence}%</span>
          <Progress value={r.confidence} className="h-1.5 w-16" />
        </div>
      ),
    },
    {
      key: "risk",
      label: "Risk",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm w-12">{r.risk}%</span>
          <Progress value={r.risk} className="h-1.5 w-16" />
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      filterOptions: ["under_review", "verified", "active", "archived"],
      render: (r) => {
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "outline";
        if (r.status === "verified" || r.status === "active")
          variant = "default";
        else if (r.status === "under_review") variant = "secondary";

        return (
          <Badge variant={variant} className="capitalize">
            {r.status.replace("_", " ")}
          </Badge>
        );
      },
    },
  ];

  // Calculations for KPI Cards
  const avgDva =
    products.length > 0
      ? (
          products.reduce((s, p) => s + parseFloat(p.dvaScore as any), 0) /
          products.length
        ).toFixed(1)
      : "0";

  const classI = products.filter((p) => p.classification === "Class I").length;
  const classII = products.filter(
    (p) => p.classification === "Class II",
  ).length;
  const nonLocal = products.filter(
    (p) => p.classification === "Non-Local" || !p.classification,
  ).length;

  // Chart Data Preparation
  const chartData = products.slice(0, 15).map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
    dva: parseFloat(p.dvaScore as any) || 0,
    confidence: 92, // Mocked confidence for visual continuity until ComplianceRecord DB table is wired up
  }));

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Loading DVA metrics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Domestic Value Addition (DVA) Results"
        description="Analytics and classification of all submitted Make in India product declarations."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Average DVA"
          value={`${avgDva}%`}
          icon={<BarChart3 className="h-6 w-6" />}
        />
        <StatCard
          title="Class I (≥50%)"
          value={classI}
          icon={<ShieldCheck className="h-6 w-6 text-green-600" />}
          subtitle={
            products.length > 0
              ? `${((classI / products.length) * 100).toFixed(0)}% of products`
              : "0%"
          }
        />
        <StatCard
          title="Class II (20-50%)"
          value={classII}
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Non-Local (<20%)"
          value={nonLocal}
          icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
        />
      </div>

      {chartData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display">
              DVA Score Analytics (Top 15)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220,13%,91%)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: "transparent" }} />
                <Legend />
                <Bar
                  dataKey="dva"
                  fill="hsl(262,83%,58%)"
                  name="DVA %"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={products}
            columns={columns}
            searchKeys={["name", "category"]}
            exportFilename="nmicov-dva-results"
            pageSize={12}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DVAResults;
