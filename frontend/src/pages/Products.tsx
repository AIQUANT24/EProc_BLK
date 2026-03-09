import { useState } from "react";
import { useMockData } from "@/contexts/MockDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/contexts/MockDataContext";

const Products = () => {
  const { products, addProduct, suppliers } = useMockData();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: "", name: "", category: "", hsnCode: "", estimatedCost: "" });

  const isSupplier = user?.role === "supplier";
  const displayProducts = isSupplier ? products.filter(p => p.supplierId === "SUP-001") : products;

  const columns: Column<Product>[] = [
    { key: "id", label: "ID", sortable: true, render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: "name", label: language === "hi" ? "उत्पाद का नाम" : "Product Name", sortable: true, render: r => <span className="font-medium">{r.name}</span> },
    { key: "supplierName", label: language === "hi" ? "आपूर्तिकर्ता" : "Supplier", sortable: true },
    { key: "category", label: t("labelCategory"), sortable: true, filterOptions: [...new Set(products.map(p => p.category))] },
    { key: "hsnCode", label: t("productHSN"), render: r => <span className="font-mono text-xs">{r.hsnCode}</span> },
    { key: "estimatedCost", label: language === "hi" ? "लागत (₹)" : "Cost (₹)", sortable: true, render: r => <span>₹{r.estimatedCost.toLocaleString("en-IN")}</span> },
    { key: "dvaScore", label: t("productDVA"), sortable: true, render: r => r.dvaScore != null ? (
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm">{r.dvaScore}%</span>
        <Progress value={r.dvaScore} className="h-1.5 w-16" />
      </div>
    ) : <span className="text-muted-foreground text-xs">—</span> },
    { key: "classification", label: t("productClass"), filterOptions: ["Class I", "Class II", "Non-Local"], render: r => r.classification ? (
      <Badge variant={r.classification === "Class I" ? "default" : r.classification === "Class II" ? "secondary" : "destructive"}>{r.classification}</Badge>
    ) : <span className="text-muted-foreground text-xs">—</span> },
    { key: "status", label: t("labelStatus"), filterOptions: ["draft", "submitted", "verified"], render: r => (
      <Badge variant={r.status === "verified" ? "default" : r.status === "submitted" ? "secondary" : "outline"}>{r.status}</Badge>
    )},
  ];

  const handleSubmit = () => {
    if (!form.name || !form.category) return;
    addProduct({ supplierId: form.supplierId || "SUP-001", name: form.name, category: form.category, hsnCode: form.hsnCode, estimatedCost: Number(form.estimatedCost) || 0 });
    toast.success(language === "hi" ? "उत्पाद सफलतापूर्वक पंजीकृत" : "Product registered successfully");
    setForm({ supplierId: "", name: "", category: "", hsnCode: "", estimatedCost: "" });
    setOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t("productsTitle")}
        description={`${displayProducts.length} ${language === "hi" ? "उत्पाद पंजीकृत" : "products registered"} · ${displayProducts.filter(p => p.status === "verified").length} ${language === "hi" ? "सत्यापित" : "verified"}`}
        actions={
          (isSupplier || user?.role === "admin") ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="h-4 w-4" /> {language === "hi" ? "उत्पाद पंजीकृत करें" : "Register Product"}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">{language === "hi" ? "नया उत्पाद पंजीकृत करें" : "Register New Product"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{language === "hi" ? "उत्पाद का नाम" : "Product Name"}</Label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={language === "hi" ? "जैसे इंडस्ट्रियल मोटर असेंबली" : "e.g. Industrial Motor Assembly"} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("labelCategory")}</Label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder={language === "hi" ? "श्रेणी चुनें" : "Select category"} /></SelectTrigger>
                      <SelectContent>
                        {["Electrical Equipment", "Defence Electronics", "Aerospace", "Defence", "Telecom", "IT Hardware", "Heavy Engineering", "Naval Engineering", "Metallurgy"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t("productHSN")}</Label><Input value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })} placeholder="e.g. 8501" /></div>
                    <div className="space-y-2"><Label>{language === "hi" ? "अनुमानित लागत (₹)" : "Estimated Cost (₹)"}</Label><Input type="number" value={form.estimatedCost} onChange={e => setForm({ ...form, estimatedCost: e.target.value })} placeholder="245000" /></div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground">{language === "hi" ? "उत्पाद पंजीकृत करें" : "Register Product"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <Card>
        <CardContent className="p-6">
          <DataTable data={displayProducts} columns={columns} searchKeys={["name", "supplierName", "category", "hsnCode"]} exportFilename="nmicov-products" pageSize={12} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
