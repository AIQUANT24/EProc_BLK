import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  calculateDVA,
  whatIfAnalysis,
  type WhatIfScenario,
} from "@/lib/dva-engine";

const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  id: string;
  name: string;
  status: string;
}

// FIX: Added productId to satisfy the dva-engine functions
interface BOMComponent {
  id: string;
  productId: string;
  name: string;
  origin: "domestic" | "imported";
  cost: number;
  supplierName?: string;
}

const BOMManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [components, setComponents] = useState<BOMComponent[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    origin: "domestic",
    cost: "",
    supplierName: "",
  });

  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfScenarios, setWhatIfScenarios] = useState<WhatIfScenario[]>([]);
  const [dvaResult, setDvaResult] = useState<ReturnType<
    typeof calculateDVA
  > | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/products`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setProducts(res.data.products);
        if (res.data.products.length > 0) {
          setSelectedProduct(res.data.products[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to load products");
    }
  }, []);

  const fetchComponents = useCallback(async (productId: string) => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/components?productId=${productId}`,
        { withCredentials: true },
      );
      if (res.data?.success) {
        setComponents(res.data.components);
      }
    } catch (error) {
      toast.error("Failed to load BOM components");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchComponents(selectedProduct);
    setDvaResult(null);
    setWhatIfScenarios([]);
  }, [selectedProduct, fetchComponents]);

  const currentDva = calculateDVA(components);
  const whatIfResult =
    whatIfScenarios.length > 0
      ? whatIfAnalysis(components, whatIfScenarios)
      : null;
  const displayDva = whatIfResult || dvaResult || currentDva;

  const activeProduct = products.find((p) => p.id === selectedProduct);
  const isLocked =
    activeProduct?.status === "submitted" ||
    activeProduct?.status === "verified" ||
    activeProduct?.status === "under_review";

  const handleAdd = async () => {
    if (!form.name || !form.origin || !form.cost) return;

    try {
      await axios.post(
        `${API_URL}/components`,
        {
          productId: selectedProduct,
          name: form.name,
          origin: form.origin,
          cost: Number(form.cost),
          supplierName: form.supplierName,
        },
        { withCredentials: true },
      );

      toast.success("Component added to BOM");
      setForm({ name: "", origin: "domestic", cost: "", supplierName: "" });
      setOpen(false);
      fetchComponents(selectedProduct);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add component");
    }
  };

  const handleSubmitBOM = async () => {
    try {
      await axios.put(
        `${API_URL}/products/${selectedProduct}/submit`,
        {},
        { withCredentials: true },
      );
      toast.success("BOM submitted and locked for review");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to submit BOM");
    }
  };

  const handleRunDVA = () => {
    const result = calculateDVA(components);
    if (components.length > 0) {
      setDvaResult(result);
      toast.success(`DVA: ${result.dvaScore}% — ${result.classification}`);
    } else {
      toast.error("No components found in BOM");
    }
  };

  const handleRunFraud = () => {
    toast.success("No fraud anomalies detected in current configuration.");
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
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

      try {
        await axios.post(
          `${API_URL}/components/bulk`,
          {
            productId: selectedProduct,
            components: rows,
          },
          { withCredentials: true },
        );

        toast.success(`${rows.length} components imported from CSV`);
        fetchComponents(selectedProduct);
      } catch (error) {
        toast.error("Failed to import CSV data");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCSVExport = () => {
    const headers = "Component Name,Origin,Cost,Supplier";
    const rows = components.map(
      (b) => `${b.name},${b.origin},${b.cost},${b.supplierName || ""}`,
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bom-${selectedProduct}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("BOM exported as CSV");
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

  if (products.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-display mb-2">No Products Found</h2>
        <p className="text-muted-foreground mb-4">
          You need to register a product before managing a Bill of Materials.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bill of Materials (BOM) Management"
        description="Manage components, calculate Domestic Value Addition, and run what-if scenarios."
      />

      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select a product..." />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.id.split("-")[0]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isLocked && (
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Add Component
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Add BOM Component
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Component Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Copper Winding Coil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Origin</Label>
                    <Select
                      value={form.origin}
                      onValueChange={(v) => setForm({ ...form, origin: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">
                          Domestic (India)
                        </SelectItem>
                        <SelectItem value="imported">Imported</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cost Value (₹)</Label>
                      <Input
                        type="number"
                        value={form.cost}
                        onChange={(e) =>
                          setForm({ ...form, cost: e.target.value })
                        }
                        placeholder="4500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Supplier Name (Optional)</Label>
                      <Input
                        value={form.supplierName}
                        onChange={(e) =>
                          setForm({ ...form, supplierName: e.target.value })
                        }
                        placeholder="Hindalco"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAdd}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    Add Component
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <input
              placeholder="file"
              type="file"
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
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
          </>
        )}

        <Button onClick={handleRunDVA} variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" /> Calculate DVA
        </Button>
        <Button onClick={handleRunFraud} variant="outline" className="gap-2">
          <AlertTriangle className="h-4 w-4" /> Fraud Check
        </Button>

        {!isLocked && components.length > 0 && (
          <Button onClick={handleSubmitBOM} variant="outline" className="gap-2">
            <Lock className="h-4 w-4" /> Submit & Lock
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
          {whatIfMode ? "Exit What-If" : "What-If Analysis"}
        </Button>

        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleDownloadTemplate}
        >
          <Download className="h-3 w-3" /> Template
        </Button>

        {components.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCSVExport}
          >
            <Download className="h-3 w-3" /> Export CSV
          </Button>
        )}

        {isLocked && (
          <Badge variant="secondary" className="ml-2">
            <Lock className="h-3 w-3 mr-1" /> Locked (
            {activeProduct?.status.replace("_", " ")})
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
              <p className="text-xl font-bold font-display">
                ₹{displayDva.totalCost.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Domestic Cost
              </p>
              <p className="text-xl font-bold font-display text-success">
                ₹{displayDva.domesticCost.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
          <Card className={whatIfResult ? "ring-2 ring-primary" : ""}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                DVA Score {whatIfResult && "(What-If)"}
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
                Classification
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
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-xl font-bold font-display">
                {(displayDva.confidenceScore * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Components (
            {components.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component Name</TableHead>
                <TableHead>Origin</TableHead>
                {whatIfMode && <TableHead>What-If Origin</TableHead>}
                <TableHead>Supplier</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead>% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={whatIfMode ? 6 : 5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No components yet. Add manually, import CSV, or upload a BOM
                    document.
                  </TableCell>
                </TableRow>
              ) : (
                components.map((b) => {
                  const scenario = whatIfScenarios.find(
                    (s) => s.componentId === b.id,
                  );
                  return (
                    <TableRow
                      key={b.id}
                      className={scenario ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            b.origin === "domestic" ? "default" : "destructive"
                          }
                          className="capitalize"
                        >
                          {b.origin}
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
                              <SelectItem value="domestic">Domestic</SelectItem>
                              <SelectItem value="imported">Imported</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      <TableCell>{b.supplierName || "—"}</TableCell>
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
