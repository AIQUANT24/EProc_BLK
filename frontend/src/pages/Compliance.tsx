import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { CheckCircle, ShieldCheck, XCircle, AlertTriangle, Link2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ComplianceRecord } from "@/contexts/MockDataContext";

const COLORS = ["hsl(162,72%,45%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)"];

const Compliance = () => {
  const { compliance } = useMockData();
  const { t, language } = useLanguage();

  const columns: Column<ComplianceRecord>[] = [
    { key: "productName", label: language === "hi" ? "उत्पाद" : "Product", sortable: true, render: r => <span className="font-medium">{r.productName}</span> },
    { key: "supplierName", label: language === "hi" ? "आपूर्तिकर्ता" : "Supplier", sortable: true },
    { key: "dvaScore", label: "DVA", sortable: true, render: r => <span className="font-bold">{r.dvaScore}%</span> },
    { key: "classification", label: t("dvaClassification"), filterOptions: ["Class I", "Class II", "Non-Local"], render: r => (
      <Badge variant={r.classification === "Class I" ? "default" : r.classification === "Class II" ? "secondary" : "destructive"}>{r.classification}</Badge>
    )},
    { key: "confidenceScore", label: language === "hi" ? "विश्वसनीयता" : "Confidence", sortable: true, render: r => (
      <span className={r.confidenceScore > 0.7 ? "text-success" : r.confidenceScore > 0.4 ? "text-warning" : "text-destructive"}>
        {(r.confidenceScore * 100).toFixed(0)}%
      </span>
    )},
    { key: "riskScore", label: language === "hi" ? "जोखिम" : "Risk", sortable: true, render: r => (
      <span className={r.riskScore > 0.5 ? "text-destructive" : r.riskScore > 0.2 ? "text-warning" : "text-success"}>
        {(r.riskScore * 100).toFixed(0)}%
      </span>
    )},
    { key: "status", label: t("labelStatus"), filterOptions: ["compliant", "under-review", "non-compliant"], render: r => (
      <Badge variant={r.status === "compliant" ? "default" : r.status === "non-compliant" ? "destructive" : "secondary"}>{r.status}</Badge>
    )},
    { key: "blockchainTxHash", label: "Tx Hash", render: r => (
      <span className="font-mono text-xs flex items-center gap-1"><Link2 className="h-3 w-3 text-primary" />{r.blockchainTxHash || "—"}</span>
    )},
  ];

  const statusDist = [
    { name: language === "hi" ? "अनुपालक" : "Compliant", value: compliance.filter(c => c.status === "compliant").length },
    { name: language === "hi" ? "समीक्षा में" : "Under Review", value: compliance.filter(c => c.status === "under-review").length },
    { name: language === "hi" ? "गैर-अनुपालक" : "Non-Compliant", value: compliance.filter(c => c.status === "non-compliant").length },
  ];

  const avgConfidence = compliance.length > 0 ? (compliance.reduce((s, c) => s + c.confidenceScore, 0) / compliance.length * 100).toFixed(0) : "0";
  const avgDva = compliance.length > 0 ? (compliance.reduce((s, c) => s + c.dvaScore, 0) / compliance.length).toFixed(1) : "0";

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("complianceTitle")} description={t("complianceDesc")} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard title={language === "hi" ? "कुल उत्पाद" : "Total Products"} value={compliance.length} icon={<ShieldCheck className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "अनुपालक" : "Compliant"} value={statusDist[0].value} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "समीक्षा में" : "Under Review"} value={statusDist[1].value} icon={<AlertTriangle className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "गैर-अनुपालक" : "Non-Compliant"} value={statusDist[2].value} icon={<XCircle className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "औसत विश्वसनीयता" : "Avg Confidence"} value={`${avgConfidence}%`} subtitle={`${language === "hi" ? "औसत DVA" : "Avg DVA"}: ${avgDva}%`} icon={<ShieldCheck className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <DataTable data={compliance} columns={columns} searchKeys={["productName", "supplierName"]} exportFilename="nmicov-compliance" pageSize={10} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-sm">{language === "hi" ? "स्थिति वितरण" : "Status Distribution"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusDist.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span>{s.name}</span>
                  </div>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Compliance;
