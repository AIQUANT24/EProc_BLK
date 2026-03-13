import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  CheckCircle,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Link2,
  Loader2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = ["hsl(162,72%,45%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)"];

// Interface matching your updated MySQL Product Model + Joined Supplier data
interface ComplianceProduct {
  id: string;
  name: string;
  dvaScore: number | null;
  classification: string | null;
  status:
    | "draft"
    | "active"
    | "archived"
    | "under_review"
    | "verified"
    | "compliant"
    | "non-compliant"
    | "under-review";
  confidence: number | null;
  risk: number | null;
  supplier?: {
    gst: string;
    user?: {
      fullName: string;
    };
  };
}

const Compliance = () => {
  const [products, setProducts] = useState<ComplianceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplianceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        // Filter out drafts - we only analyze submitted compliance records
        const submittedProducts = response.data.products.filter(
          (p: ComplianceProduct) => p.status !== "draft",
        );
        setProducts(submittedProducts);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load compliance data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  const columns: Column<ComplianceProduct>[] = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (r) => (
        <span>
          {r.supplier?.user?.fullName || r.supplier?.gst || "Unknown"}
        </span>
      ),
    },
    {
      key: "dvaScore",
      label: "DVA",
      sortable: true,
      render: (r) => (
        <span className="font-bold">
          {r.dvaScore !== null ? `${r.dvaScore}%` : "N/A"}
        </span>
      ),
    },
    {
      key: "classification",
      label: "Classification",
      filterOptions: ["Class I", "Class II", "Non-Local"],
      render: (r) => (
        <Badge
          variant={
            r.classification === "Class I"
              ? "default"
              : r.classification === "Class II"
                ? "secondary"
                : "destructive"
          }
        >
          {r.classification || "Unknown"}
        </Badge>
      ),
    },
    {
      key: "confidence",
      label: "AI Confidence",
      sortable: true,
      render: (r) => {
        if (r.confidence === null)
          return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className={
              r.confidence > 70
                ? "text-success font-medium"
                : r.confidence > 40
                  ? "text-warning font-medium"
                  : "text-destructive font-medium"
            }
          >
            {r.confidence}%
          </span>
        );
      },
    },
    {
      key: "risk",
      label: "AI Risk",
      sortable: true,
      render: (r) => {
        if (r.risk === null)
          return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className={
              r.risk > 50
                ? "text-destructive font-bold"
                : r.risk > 20
                  ? "text-warning font-medium"
                  : "text-success font-medium"
            }
          >
            {r.risk}%
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      filterOptions: ["verified", "compliant", "under_review", "non-compliant"],
      render: (r) => {
        // Normalize statuses for visual badges
        const isCompliant = ["verified", "compliant", "active"].includes(
          r.status,
        );
        const isUnderReview = ["under_review", "under-review"].includes(
          r.status,
        );

        return (
          <Badge
            className="capitalize"
            variant={
              isCompliant
                ? "default"
                : isUnderReview
                  ? "secondary"
                  : "destructive"
            }
          >
            {r.status.replace("_", " ")}
          </Badge>
        );
      },
    },
  ];

  // Distribution Groupings
  const compliantCount = products.filter((p) =>
    ["verified", "compliant", "active"].includes(p.status),
  ).length;
  const underReviewCount = products.filter((p) =>
    ["under_review", "under-review"].includes(p.status),
  ).length;
  const nonCompliantCount = products.filter(
    (p) =>
      ["non-compliant", "archived"].includes(p.status) ||
      p.classification === "Non-Local",
  ).length;

  const statusDist = [
    { name: "Compliant", value: compliantCount },
    { name: "Under Review", value: underReviewCount },
    { name: "Non-Compliant", value: nonCompliantCount },
  ];

  // Aggregated Averages
  const productsWithConfidence = products.filter((p) => p.confidence !== null);
  const avgConfidence =
    productsWithConfidence.length > 0
      ? (
          productsWithConfidence.reduce(
            (s, p) => s + (p.confidence as number),
            0,
          ) / productsWithConfidence.length
        ).toFixed(1)
      : "0";

  const productsWithDva = products.filter((p) => p.dvaScore !== null);
  const avgDva =
    productsWithDva.length > 0
      ? (
          productsWithDva.reduce((s, p) => s + (p.dvaScore as number), 0) /
          productsWithDva.length
        ).toFixed(1)
      : "0";

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Loading compliance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Compliance & Audit Logs"
        description="Comprehensive overview of PPP-MII compliance, AI risk factors, and verification statuses."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          title="Total Audited Products"
          value={products.length}
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <StatCard
          title="Compliant"
          value={statusDist[0].value}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Under Review"
          value={statusDist[1].value}
          icon={<AlertTriangle className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Non-Compliant"
          value={statusDist[2].value}
          icon={<XCircle className="h-6 w-6 text-destructive" />}
        />
        <StatCard
          title="Avg AI Confidence"
          value={`${avgConfidence}%`}
          subtitle={`Avg DVA: ${avgDva}%`}
          icon={<ShieldCheck className="h-6 w-6 text-primary" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <DataTable
              data={products}
              columns={columns}
              searchKeys={["name"]}
              exportFilename="nmicov-compliance"
              pageSize={10}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-sm">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusDist.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{ fill: "transparent" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusDist.map((s, i) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ background: COLORS[i] }}
                        />
                        <span>{s.name}</span>
                      </div>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Compliance;
