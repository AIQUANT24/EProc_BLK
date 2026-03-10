import { useState, useRef } from "react";
import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Package,
  Lock,
  Calculator,
  AlertTriangle,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateDVA,
  whatIfAnalysis,
  type WhatIfScenario,
} from "@/lib/dva-engine";

const BOMManagement = () => {
  const {
    bom,
    products,
    addBOMComponent,
    runDVA,
    runFraudCheck,
    submitBOM,
    importBOMFromCSV,
  } = useMockData();
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState("PRD-001");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    origin: "",
    cost: "",
    supplierName: "",
  });
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfScenarios, setWhatIfScenarios] = useState<WhatIfScenario[]>([]);
  const [dvaResult, setDvaResult] = useState<ReturnType<
    typeof calculateDVA
  > | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBom = bom.filter((b) => b.productId === selectedProduct);
  const currentDva = calculateDVA(filteredBom);
  const whatIfResult =
    whatIfScenarios.length > 0
      ? whatIfAnalysis(filteredBom, whatIfScenarios)
      : null;
  const displayDva = whatIfResult || dvaResult || currentDva;

  const handleAdd = () => {
    if (!form.name || !form.origin) return;
    addBOMComponent({
      productId: selectedProduct,
      name: form.name,
      origin: form.origin as "domestic" | "imported",
      cost: Number(form.cost) || 0,
      supplierName: form.supplierName,
    });
    toast.success(
      language === "hi" ? "BOM में घटक जोड़ा गया" : "Component added to BOM",
    );
    setForm({ name: "", origin: "", cost: "", supplierName: "" });
    setOpen(false);
  };

  const handleRunDVA = () => {
    const result = runDVA(selectedProduct);
    if (result) {
      setDvaResult(result);
      toast.success(`DVA: ${result.dvaScore}% — ${result.classification}`);
    } else
      toast.error(
        language === "hi" ? "कोई घटक नहीं मिले" : "No components found",
      );
  };

  const handleRunFraud = () => {
    const alerts = runFraudCheck(selectedProduct);
    if (alerts.length > 0)
      toast.warning(
        `${alerts.length} ${language === "hi" ? "धोखाधड़ी अलर्ट उत्पन्न" : "fraud alert(s) generated"}`,
      );
    else
      toast.success(
        language === "hi"
          ? "कोई धोखाधड़ी विसंगतियां नहीं मिलीं"
          : "No fraud anomalies detected",
      );
  };

  const handleSubmitBOM = () => {
    submitBOM(selectedProduct);
    toast.success(
      language === "hi"
        ? "BOM जमा और लॉक किया गया"
        : "BOM submitted and locked",
    );
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV must have header + data rows");
        return;
      }
      const rows = lines
        .slice(1)
        .map((line) => {
          const [name, origin, cost, supplierName] = line
            .split(",")
            .map((s) => s.trim().replace(/^"|"$/g, ""));
          return {
            name,
            origin,
            cost: Number(cost) || 0,
            supplierName: supplierName || "",
          };
        })
        .filter((r) => r.name);
      const count = importBOMFromCSV(selectedProduct, rows);
      toast.success(
        `${count} ${language === "hi" ? "घटक CSV से आयात किए गए" : "components imported from CSV"}`,
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCSVExport = () => {
    const headers = "Component Name,Origin,Cost,Supplier";
    const rows = filteredBom.map(
      (b) => `${b.name},${b.origin},${b.cost},${b.supplierName}`,
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bom-${selectedProduct}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      language === "hi"
        ? "BOM CSV के रूप में निर्यात किया गया"
        : "BOM exported as CSV",
    );
  };

  const handleDownloadTemplate = () => {
    const csv =
      "Component Name,Origin,Cost,Supplier\nCopper Winding Coil,domestic,45000,Hindalco Copper\nBearing Assembly,imported,28000,SKF Sweden";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bom-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleWhatIf = (
    componentId: string,
    newOrigin: "domestic" | "imported",
  ) => {
    setWhatIfScenarios((prev) => {
      const existing = prev.find((s) => s.componentId === componentId);
      if (existing)
        return prev.map((s) =>
          s.componentId === componentId ? { ...s, newOrigin } : s,
        );
      return [...prev, { componentId, newOrigin }];
    });
  };

  const product = products.find((p) => p.id === selectedProduct);
  const isLocked =
    product?.status === "submitted" || product?.status === "verified";

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("bomTitle")} description={t("bomDesc")} />

      {/* Controls */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Select
          value={selectedProduct}
          onValueChange={(v) => {
            setSelectedProduct(v);
            setDvaResult(null);
            setWhatIfScenarios([]);
          }}
        >
          <SelectTrigger className="w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isLocked && (
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> {t("bomAdd")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {language === "hi" ? "BOM घटक जोड़ें" : "Add BOM Component"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{t("bomComponent")}</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder={
                        language === "hi"
                          ? "जैसे कॉपर वाइंडिंग कॉइल"
                          : "e.g. Copper Winding Coil"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("bomOrigin")}</Label>
                    <Select
                      value={form.origin}
                      onValueChange={(v) => setForm({ ...form, origin: v })}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            language === "hi" ? "मूल चुनें" : "Select origin"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">
                          {language === "hi"
                            ? "घरेलू (भारत)"
                            : "Domestic (India)"}
                        </SelectItem>
                        <SelectItem value="imported">
                          {language === "hi" ? "आयातित" : "Imported"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("bomValue")}</Label>
                      <Input
                        type="number"
                        value={form.cost}
                        onChange={(e) =>
                          setForm({ ...form, cost: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("bomSupplier")}</Label>
                      <Input
                        value={form.supplierName}
                        onChange={(e) =>
                          setForm({ ...form, supplierName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAdd}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    {t("bomAdd")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <input
              type="file"
              placeholder="Import CSV"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />{" "}
              {language === "hi" ? "CSV आयात" : "Import CSV"}
            </Button>
          </>
        )}

        <Button onClick={handleRunDVA} variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />{" "}
          {language === "hi" ? "DVA गणना करें" : "Calculate DVA"}
        </Button>
        <Button onClick={handleRunFraud} variant="outline" className="gap-2">
          <AlertTriangle className="h-4 w-4" />{" "}
          {language === "hi" ? "धोखाधड़ी जांच चलाएं" : "Run Fraud Check"}
        </Button>
        {!isLocked && filteredBom.length > 0 && (
          <Button onClick={handleSubmitBOM} variant="outline" className="gap-2">
            <Lock className="h-4 w-4" />{" "}
            {language === "hi" ? "जमा करें और लॉक करें" : "Submit & Lock"}
          </Button>
        )}
        <Button
          onClick={() => {
            setWhatIfMode(!whatIfMode);
            setWhatIfScenarios([]);
          }}
          variant={whatIfMode ? "default" : "outline"}
          size="sm"
        >
          {whatIfMode
            ? language === "hi"
              ? "What-If बंद करें"
              : "Exit What-If"
            : "What-If Analysis"}
        </Button>

        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleDownloadTemplate}
        >
          <Download className="h-3 w-3" />{" "}
          {language === "hi" ? "टेम्पलेट" : "Template"}
        </Button>
        {filteredBom.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCSVExport}
          >
            <Download className="h-3 w-3" /> {t("actionExport")}
          </Button>
        )}
        {isLocked && (
          <Badge variant="secondary">
            <Lock className="h-3 w-3 mr-1" />{" "}
            {language === "hi" ? "लॉक किया गया" : "Locked"}
          </Badge>
        )}
      </div>

      {/* DVA Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {language === "hi" ? "कुल लागत" : "Total Cost"}
            </p>
            <p className="text-xl font-bold font-display">
              ₹{displayDva.totalCost.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {language === "hi" ? "घरेलू लागत" : "Domestic Cost"}
            </p>
            <p className="text-xl font-bold font-display text-success">
              ₹{displayDva.domesticCost.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className={whatIfResult ? "ring-2 ring-primary" : ""}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {language === "hi" ? "DVA स्कोर" : "DVA Score"}{" "}
              {whatIfResult && "(What-If)"}
            </p>
            <p className="text-xl font-bold font-display text-primary">
              {displayDva.dvaScore}%
            </p>
            <Progress value={displayDva.dvaScore} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {t("dvaClassification")}
            </p>
            <Badge
              variant={
                displayDva.classification === "Class I"
                  ? "default"
                  : displayDva.classification === "Class II"
                    ? "secondary"
                    : "destructive"
              }
              className="text-sm"
            >
              {displayDva.classification}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {language === "hi" ? "विश्वसनीयता" : "Confidence"}
            </p>
            <p className="text-xl font-bold font-display">
              {(displayDva.confidenceScore * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {language === "hi" ? "जोखिम" : "Risk"}:{" "}
              {(displayDva.riskScore * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Factors */}
      {dvaResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display text-sm">
              {language === "hi"
                ? "विश्वसनीयता स्कोर विश्लेषण"
                : "Confidence Score Breakdown"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-5">
              {dvaResult.confidenceFactors.map((f) => (
                <div
                  key={f.factor}
                  className="text-center p-3 rounded-lg border"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {f.factor}
                  </p>
                  <p className="text-lg font-bold">
                    {(f.score * 100).toFixed(0)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {language === "hi" ? "वजन" : "Weight"}:{" "}
                    {(f.weight * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOM Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />{" "}
            {language === "hi"
              ? `घटक (${filteredBom.length})`
              : `Components (${filteredBom.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t("bomComponent")}</TableHead>
                <TableHead>{t("bomOrigin")}</TableHead>
                {whatIfMode && <TableHead>What-If</TableHead>}
                <TableHead>{t("bomSupplier")}</TableHead>
                <TableHead>{t("bomValue")}</TableHead>
                <TableHead>
                  % {language === "hi" ? "कुल का" : "of Total"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBom.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={whatIfMode ? 7 : 6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {language === "hi"
                      ? "अभी तक कोई घटक नहीं। मैन्युअल रूप से जोड़ें या CSV आयात करें।"
                      : "No components yet. Add manually or import CSV."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBom.map((b) => {
                  const scenario = whatIfScenarios.find(
                    (s) => s.componentId === b.id,
                  );
                  return (
                    <TableRow
                      key={b.id}
                      className={scenario ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-mono text-xs">
                        {b.id}
                      </TableCell>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            b.origin === "domestic" ? "default" : "destructive"
                          }
                        >
                          {b.origin === "domestic"
                            ? language === "hi"
                              ? "घरेलू"
                              : "domestic"
                            : language === "hi"
                              ? "आयातित"
                              : "imported"}
                        </Badge>
                      </TableCell>
                      {whatIfMode && (
                        <TableCell>
                          <Select
                            value={scenario?.newOrigin || b.origin}
                            onValueChange={(v) =>
                              toggleWhatIf(b.id, v as "domestic" | "imported")
                            }
                          >
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="domestic">
                                {language === "hi" ? "घरेलू" : "Domestic"}
                              </SelectItem>
                              <SelectItem value="imported">
                                {language === "hi" ? "आयातित" : "Imported"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      <TableCell>{b.supplierName}</TableCell>
                      <TableCell>₹{b.cost.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        {currentDva.totalCost > 0
                          ? ((b.cost / currentDva.totalCost) * 100).toFixed(1)
                          : 0}
                        %
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BOMManagement;
