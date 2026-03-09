import { useState } from "react";
import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldCheck, Link2 } from "lucide-react";
import { toast } from "sonner";
import type { VerificationLog } from "@/contexts/MockDataContext";

const Verification = () => {
  const { products, verificationLogs, verifyProduct } = useMockData();
  const { t, language } = useLanguage();
  const [productId, setProductId] = useState("");
  const [requestedBy, setRequestedBy] = useState("GeM Portal");
  const [result, setResult] = useState<VerificationLog | null>(null);

  const handleVerify = () => {
    if (!productId) { toast.error(language === "hi" ? "कृपया एक उत्पाद चुनें" : "Select a product"); return; }
    const log = verifyProduct(productId, requestedBy);
    if (log) {
      setResult(log);
      toast.success(`${language === "hi" ? "सत्यापन पूर्ण" : "Verification complete"}: ${log.status}`);
    } else {
      setResult(null);
      toast.error(language === "hi" ? "इस उत्पाद के लिए कोई BOM डेटा नहीं मिला" : "No BOM data found for this product");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("verificationTitle")} description={t("verificationDesc")} />

      <Card className="mb-8">
        <CardHeader><CardTitle className="font-display flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> {language === "hi" ? "उत्पाद अनुपालन सत्यापित करें" : "Verify Product Compliance"}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2 flex-1 min-w-48">
              <Label>{language === "hi" ? "उत्पाद" : "Product"}</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder={language === "hi" ? "उत्पाद चुनें" : "Select product"} /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 min-w-48">
              <Label>{language === "hi" ? "अनुरोधकर्ता" : "Requested By"}</Label>
              <Select value={requestedBy} onValueChange={setRequestedBy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GeM Portal">GeM Portal</SelectItem>
                  <SelectItem value="Defence Procurement">Defence Procurement</SelectItem>
                  <SelectItem value="HAL Procurement">HAL Procurement</SelectItem>
                  <SelectItem value="Army Ordnance">Army Ordnance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleVerify} className="gradient-primary text-primary-foreground gap-2 h-10"><ShieldCheck className="h-4 w-4" /> {language === "hi" ? "सत्यापित करें" : "Verify"}</Button>
          </div>

          {result && (
            <div className="mt-6 rounded-lg border bg-muted/30 p-6">
              <h3 className="font-display font-bold mb-4">{language === "hi" ? "API प्रतिक्रिया" : "API Response"} — POST /api/v1/verify</h3>
              <pre className="text-sm bg-card rounded-lg p-4 overflow-x-auto border font-mono">{JSON.stringify({
                supplier_id: result.supplierName,
                product_id: result.productId,
                dva_score: result.dvaScore,
                classification: result.classification,
                confidence_score: result.confidenceScore,
                risk_score: result.riskScore,
                compliance_status: result.status.toUpperCase(),
                verification_timestamp: result.timestamp,
                blockchain_tx_hash: result.blockchainTxHash,
                flags: result.status === "failed" ? ["NON_LOCAL_SUPPLIER"] : result.status === "pending" ? ["UNDER_REVIEW"] : [],
              }, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display">{language === "hi" ? `सत्यापन लॉग (${verificationLogs.length})` : `Verification Logs (${verificationLogs.length})`}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{language === "hi" ? "उत्पाद" : "Product"}</TableHead>
                <TableHead>{language === "hi" ? "आपूर्तिकर्ता" : "Supplier"}</TableHead>
                <TableHead>{language === "hi" ? "अनुरोधकर्ता" : "Requested By"}</TableHead>
                <TableHead>DVA</TableHead>
                <TableHead>{language === "hi" ? "विश्वसनीयता" : "Confidence"}</TableHead>
                <TableHead>{language === "hi" ? "जोखिम" : "Risk"}</TableHead>
                <TableHead>{t("labelStatus")}</TableHead>
                <TableHead>Tx Hash</TableHead>
                <TableHead>{language === "hi" ? "समय" : "Timestamp"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationLogs.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.id}</TableCell>
                  <TableCell className="font-medium">{v.productName}</TableCell>
                  <TableCell>{v.supplierName}</TableCell>
                  <TableCell>{v.requestedBy}</TableCell>
                  <TableCell className="font-bold">{v.dvaScore}%</TableCell>
                  <TableCell>{(v.confidenceScore * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <span className={v.riskScore > 0.5 ? "text-destructive" : v.riskScore > 0.2 ? "text-warning" : "text-success"}>
                      {(v.riskScore * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell><Badge variant={v.status === "verified" ? "default" : v.status === "failed" ? "destructive" : "secondary"}>{v.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs flex items-center gap-1"><Link2 className="h-3 w-3 text-primary" />{v.blockchainTxHash}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verification;
