import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Search, AlertTriangle, CheckCircle } from "lucide-react";

const ProcurementDashboard = () => {
  const { compliance, verificationLogs, alerts } = useMockData();
  const { language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <PageHeader title={language === "hi" ? "खरीद डैशबोर्ड" : "Procurement Dashboard"} description={language === "hi" ? "आपूर्तिकर्ता सत्यापन और अनुपालन अवलोकन" : "Supplier verification and compliance overview"} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title={language === "hi" ? "सत्यापित आपूर्तिकर्ता" : "Verified Suppliers"} value={compliance.filter(c => c.status === "compliant").length} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "लंबित समीक्षा" : "Pending Reviews"} value={compliance.filter(c => c.status === "under-review").length} icon={<Search className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "गैर-अनुपालक" : "Non-Compliant"} value={compliance.filter(c => c.status === "non-compliant").length} icon={<ShieldCheck className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "सक्रिय अलर्ट" : "Active Alerts"} value={alerts.filter(a => !a.resolved).length} icon={<AlertTriangle className="h-6 w-6" />} />
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle className="font-display">{language === "hi" ? "हालिया सत्यापन अनुरोध" : "Recent Verification Requests"}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "hi" ? "उत्पाद" : "Product"}</TableHead>
                <TableHead>{language === "hi" ? "आपूर्तिकर्ता" : "Supplier"}</TableHead>
                <TableHead>{language === "hi" ? "अनुरोधकर्ता" : "Requested By"}</TableHead>
                <TableHead>{language === "hi" ? "DVA स्कोर" : "DVA Score"}</TableHead>
                <TableHead>{language === "hi" ? "स्थिति" : "Status"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationLogs.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.productName}</TableCell>
                  <TableCell>{v.supplierName}</TableCell>
                  <TableCell>{v.requestedBy}</TableCell>
                  <TableCell><span className="font-semibold">{v.dvaScore}%</span></TableCell>
                  <TableCell>
                    <Badge variant={v.status === "verified" ? "default" : v.status === "failed" ? "destructive" : "secondary"}>
                      {v.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcurementDashboard;
