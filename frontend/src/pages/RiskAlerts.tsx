import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAllRules } from "@/lib/fraud-engine";
import type { RiskAlert } from "@/contexts/MockDataContext";

const RiskAlerts = () => {
  const { alerts, resolveAlert } = useMockData();
  const { t, language } = useLanguage();
  const rules = getAllRules();

  const handleResolve = (id: string) => {
    resolveAlert(id);
    toast.success(language === "hi" ? "अलर्ट हल किया गया और लेजर पर दर्ज किया गया" : "Alert resolved and recorded on ledger");
  };

  const activeCount = alerts.filter(a => !a.resolved).length;
  const highCount = alerts.filter(a => a.severity === "high" && !a.resolved).length;

  const columns: Column<RiskAlert>[] = [
    { key: "ruleId", label: language === "hi" ? "नियम" : "Rule", sortable: true, render: r => <span className="font-mono text-xs font-bold">{r.ruleId || "—"}</span> },
    { key: "alertType", label: language === "hi" ? "अलर्ट प्रकार" : "Alert Type", sortable: true, render: r => <span className="font-medium text-sm">{r.alertType}</span> },
    { key: "productName", label: language === "hi" ? "उत्पाद" : "Product", sortable: true },
    { key: "supplierName", label: language === "hi" ? "आपूर्तिकर्ता" : "Supplier", sortable: true },
    { key: "severity", label: language === "hi" ? "गंभीरता" : "Severity", sortable: true, filterOptions: ["high", "medium", "low"], render: r => (
      <Badge variant={r.severity === "high" ? "destructive" : r.severity === "medium" ? "secondary" : "outline"}>{r.severity}</Badge>
    )},
    { key: "description", label: language === "hi" ? "विवरण" : "Details", render: r => <span className="text-sm text-muted-foreground line-clamp-1">{r.description}</span> },
    { key: "createdAt", label: t("labelDate"), sortable: true },
    { key: "resolved", label: t("labelStatus"), filterOptions: ["Active", "Resolved"], render: r => r.resolved ? (
      <Badge variant="outline" className="text-success border-success">{language === "hi" ? "हल किया गया" : "Resolved"}</Badge>
    ) : (
      <Button size="sm" variant="outline" onClick={() => handleResolve(r.id)} className="h-7 text-xs">{language === "hi" ? "हल करें" : "Resolve"}</Button>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("alertsTitle")} description={t("alertsDesc")} />

      <div className="grid gap-5 sm:grid-cols-4 mb-6">
        <StatCard title={language === "hi" ? "सक्रिय अलर्ट" : "Active Alerts"} value={activeCount} icon={<AlertTriangle className="h-6 w-6" />} />
        <StatCard title={t("alertHigh")} value={highCount} icon={<ShieldAlert className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "हल किए गए" : "Resolved"} value={alerts.length - activeCount} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "पहचान नियम" : "Detection Rules"} value={rules.length} icon={<ShieldCheck className="h-6 w-6" />} />
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-sm">{language === "hi" ? `सक्रिय धोखाधड़ी पहचान नियम (${rules.length})` : `Active Fraud Detection Rules (${rules.length})`}</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map(r => (
              <div key={r.id} className="flex items-start gap-2 p-2 rounded border text-xs">
                <Badge variant={r.severity === "high" ? "destructive" : r.severity === "medium" ? "secondary" : "outline"} className="text-[10px] shrink-0">{r.id}</Badge>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-muted-foreground">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <DataTable data={alerts} columns={columns} searchKeys={["alertType", "productName", "supplierName", "description"]} exportFilename="nmicov-risk-alerts" pageSize={10} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAlerts;
