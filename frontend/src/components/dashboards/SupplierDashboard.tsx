import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ClipboardList, Calculator, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SupplierDashboard = () => {
  const { products, compliance } = useMockData();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const myProducts = products.filter(p => p.supplierId === "SUP-001");
  const myCompliance = compliance.filter(c => myProducts.some(p => p.id === c.productId));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={language === "hi" ? "आपूर्तिकर्ता डैशबोर्ड" : "Supplier Dashboard"}
        description={language === "hi" ? "अपने उत्पादों और अनुपालन घोषणाओं का प्रबंधन करें" : "Manage your products and compliance declarations"}
        actions={<Button onClick={() => navigate("/products")} className="gradient-primary text-primary-foreground gap-2"><Package className="h-4 w-4" /> {language === "hi" ? "नया उत्पाद" : "New Product"}</Button>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title={language === "hi" ? "मेरे उत्पाद" : "My Products"} value={myProducts.length} icon={<Package className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "जमा किए गए BOM" : "BOMs Submitted"} value={myProducts.filter(p => p.status !== "draft").length} icon={<ClipboardList className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "औसत DVA स्कोर" : "Avg DVA Score"} value={`${(myCompliance.reduce((s, c) => s + c.dvaScore, 0) / (myCompliance.length || 1)).toFixed(1)}%`} icon={<Calculator className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "अनुपालक" : "Compliant"} value={myCompliance.filter(c => c.status === "compliant").length} icon={<CheckCircle className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display">{language === "hi" ? "मेरे उत्पाद" : "My Products"}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/products")}>
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} • {p.hsnCode}</p>
                  </div>
                  <Badge variant={p.status === "verified" ? "default" : p.status === "submitted" ? "secondary" : "outline"}>{p.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display">{language === "hi" ? "अनुपालन स्थिति" : "Compliance Status"}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myCompliance.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-sm">{c.productName}</p>
                    <p className="text-xs text-muted-foreground">DVA: {c.dvaScore}% • {c.classification}</p>
                  </div>
                  <Badge variant={c.status === "compliant" ? "default" : c.status === "non-compliant" ? "destructive" : "secondary"}>{c.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;
