import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Progress } from "@/components/ui/progress";
import { Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";
import type { ComplianceRecord } from "@/contexts/MockDataContext";

const classColor = (c: string): "default" | "secondary" | "destructive" => c === "Class I" ? "default" : c === "Class II" ? "secondary" : "destructive";

const DVAResults = () => {
  const { compliance } = useMockData();
  const { t, language } = useLanguage();

  const columns: Column<ComplianceRecord>[] = [
    { key: "productName", label: language === "hi" ? "उत्पाद" : "Product", sortable: true, render: r => <span className="font-medium">{r.productName}</span> },
    { key: "supplierName", label: language === "hi" ? "आपूर्तिकर्ता" : "Supplier", sortable: true },
    { key: "category", label: t("labelCategory"), sortable: true, filterOptions: ["Electrical Equipment", "Defence Electronics", "Aerospace", "Defence", "Heavy Engineering", "Telecom", "Metallurgy", "IT Hardware", "Naval Engineering"] },
    { key: "dvaScore", label: t("dvaScore"), sortable: true, render: r => (
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm w-12">{r.dvaScore}%</span>
        <Progress value={r.dvaScore} className="h-1.5 w-16" />
      </div>
    )},
    { key: "classification", label: t("dvaClassification"), filterOptions: ["Class I", "Class II", "Non-Local"], render: r => <Badge variant={classColor(r.classification)}>{r.classification}</Badge> },
    { key: "confidenceScore", label: language === "hi" ? "विश्वसनीयता" : "Confidence", sortable: true, render: r => (
      <span className={`text-sm font-medium ${r.confidenceScore > 0.7 ? "text-success" : r.confidenceScore > 0.4 ? "text-warning" : "text-destructive"}`}>
        {(r.confidenceScore * 100).toFixed(0)}%
      </span>
    )},
    { key: "riskScore", label: language === "hi" ? "जोखिम" : "Risk", sortable: true, render: r => (
      <span className={`text-sm font-medium ${r.riskScore > 0.5 ? "text-destructive" : r.riskScore > 0.2 ? "text-warning" : "text-success"}`}>
        {(r.riskScore * 100).toFixed(0)}%
      </span>
    )},
    { key: "status", label: t("labelStatus"), filterOptions: ["compliant", "under-review", "non-compliant"], render: r => (
      <Badge variant={r.status === "compliant" ? "default" : r.status === "non-compliant" ? "destructive" : "secondary"}>{r.status}</Badge>
    )},
    { key: "blockchainTxHash", label: "Tx Hash", render: r => <span className="font-mono text-xs">{r.blockchainTxHash || "—"}</span> },
  ];

  const avgDva = compliance.length > 0 ? (compliance.reduce((s, c) => s + c.dvaScore, 0) / compliance.length).toFixed(1) : "0";
  const classI = compliance.filter(c => c.classification === "Class I").length;
  const classII = compliance.filter(c => c.classification === "Class II").length;
  const nonLocal = compliance.filter(c => c.classification === "Non-Local").length;

  const chartData = compliance.slice(0, 15).map(c => ({
    name: c.productName.length > 15 ? c.productName.slice(0, 15) + "…" : c.productName,
    dva: c.dvaScore,
    confidence: +(c.confidenceScore * 100).toFixed(0),
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("dvaTitle")} description={t("dvaDesc")} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title={language === "hi" ? "औसत DVA" : "Average DVA"} value={`${avgDva}%`} icon={<BarChart3 className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "कक्षा I (≥50%)" : "Class I (≥50%)"} value={classI} icon={<ShieldCheck className="h-6 w-6" />} subtitle={`${((classI / compliance.length) * 100).toFixed(0)}% ${language === "hi" ? "उत्पादों का" : "of products"}`} />
        <StatCard title={language === "hi" ? "कक्षा II (20-50%)" : "Class II (20-50%)"} value={classII} icon={<TrendingUp className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "गैर-स्थानीय (<20%)" : "Non-Local (<20%)"} value={nonLocal} icon={<AlertTriangle className="h-6 w-6" />} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="font-display">{language === "hi" ? "DVA स्कोर बनाम विश्वसनीयता (शीर्ष 15)" : "DVA Score vs Confidence (Top 15)"}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="dva" fill="hsl(262,83%,58%)" name="DVA %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="confidence" fill="hsl(162,72%,45%)" name={language === "hi" ? "विश्वसनीयता %" : "Confidence %"} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <DataTable data={compliance} columns={columns} searchKeys={["productName", "supplierName", "category"]} exportFilename="nmicov-dva-results" pageSize={12} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DVAResults;
