import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Package, ShieldCheck, AlertTriangle, Activity, TrendingUp, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["hsl(162,72%,45%)", "hsl(262,83%,58%)", "hsl(0,84%,60%)"];

const AdminDashboard = () => {
  const { suppliers, products, compliance, alerts, verificationLogs, users, ledger } = useMockData();
  const { t, language } = useLanguage();

  const classDistribution = [
    { name: language === "hi" ? "कक्षा I" : "Class I", value: compliance.filter(c => c.classification === "Class I").length },
    { name: language === "hi" ? "कक्षा II" : "Class II", value: compliance.filter(c => c.classification === "Class II").length },
    { name: language === "hi" ? "गैर-स्थानीय" : "Non-Local", value: compliance.filter(c => c.classification === "Non-Local").length },
  ];

  const dvaData = compliance.slice(0, 10).map(c => ({ name: c.productName.length > 12 ? c.productName.slice(0, 12) + "…" : c.productName, dva: c.dvaScore }));
  const complianceRate = compliance.length > 0 ? ((compliance.filter(c => c.status === "compliant").length / compliance.length) * 100).toFixed(0) : "0";

  return (
    <div className="animate-fade-in">
      <PageHeader title={language === "hi" ? "एडमिन डैशबोर्ड" : "Admin Dashboard"} description={language === "hi" ? "प्लेटफॉर्म अवलोकन और अनुपालन एनालिटिक्स" : "Platform overview and compliance analytics"} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title={t("dashTotalSuppliers")} value={suppliers.length} icon={<Building2 className="h-6 w-6" />} trend={{ value: 12, positive: true }} />
        <StatCard title={language === "hi" ? "पंजीकृत उत्पाद" : "Products Registered"} value={products.length} icon={<Package className="h-6 w-6" />} trend={{ value: 8, positive: true }} />
        <StatCard title={t("dashComplianceRate")} value={`${complianceRate}%`} icon={<ShieldCheck className="h-6 w-6" />} subtitle={`${compliance.filter(c => c.status === "compliant").length} ${language === "hi" ? "में से" : "of"} ${compliance.length} ${language === "hi" ? "अनुपालक" : "compliant"}`} />
        <StatCard title={language === "hi" ? "सक्रिय अलर्ट" : "Active Alerts"} value={alerts.filter(a => !a.resolved).length} icon={<AlertTriangle className="h-6 w-6" />} trend={{ value: 15, positive: false }} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title={language === "hi" ? "प्लेटफॉर्म उपयोगकर्ता" : "Platform Users"} value={users.length} icon={<Users className="h-6 w-6" />} subtitle={`${users.filter(u => u.status === "active").length} ${t("statusActive").toLowerCase()}`} />
        <StatCard title={language === "hi" ? "सत्यापन" : "Verifications"} value={verificationLogs.length} icon={<ShieldCheck className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "लेजर प्रविष्टियां" : "Ledger Entries"} value={ledger.length} icon={<FileText className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "कवर किए गए राज्य" : "States Covered"} value={new Set(suppliers.map(s => s.state)).size} icon={<Building2 className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 font-display"><TrendingUp className="h-5 w-5 text-primary" /> {language === "hi" ? "DVA स्कोर (शीर्ष 10)" : "DVA Scores (Top 10)"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dvaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="dva" fill="hsl(262,83%,58%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 font-display"><Activity className="h-5 w-5 text-primary" /> {language === "hi" ? "वर्गीकरण" : "Classification"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={classDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {classDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {classDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ background: PIE_COLORS[i] }} />{d.name}</div>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display">{language === "hi" ? "हालिया जोखिम अलर्ट" : "Recent Risk Alerts"}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${a.severity === "high" ? "text-destructive" : a.severity === "medium" ? "text-warning" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium">{a.productName}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "secondary" : "outline"}>{a.severity}</Badge>
                  {a.resolved && <Badge variant="outline" className="text-success border-success">{language === "hi" ? "हल किया गया" : "Resolved"}</Badge>}
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
