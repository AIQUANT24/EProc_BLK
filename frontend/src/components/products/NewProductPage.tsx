import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeader from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  PlusCircle,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "../ui/badge";

const API_URL = import.meta.env.VITE_API_URL;
const AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:8000/api";

const SECTORS = [
  "Electrical Equipment",
  "Defence Electronics",
  "Aerospace",
  "Defence",
  "Telecom",
  "IT Hardware",
  "Heavy Engineering",
  "Naval Engineering",
  "Metallurgy",
];

const parseCurrency = (val: string | number) => {
  if (typeof val === "number") return val;
  const cleaned = val.replace(/[^0-9.-]+/g, "");
  return parseFloat(cleaned) || 0;
};

const generateBOMHash = async (componentsData: any) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(componentsData));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

interface EditableComponent {
  id: string;
  name: string;
  cost: number;
  origin: "domestic" | "imported";
  supplierName: string;
  fraudDetected: boolean;
}

const NewProduct = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({ name: "", category: "" });
  const [components, setComponents] = useState<EditableComponent[]>([]);

  // NEW: State to hold AI metadata temporarily
  const [aiMetadata, setAiMetadata] = useState({
    confidence: "0%",
    risk: "0%",
    fraudItems: 0,
    fraudMessage: "",
  });

  // --- STEP 1: AI EXTRACTION ---
  const handleExtractBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a Bill of Materials document.");
      return;
    }

    setProcessing(true);

    try {
      toast.loading(
        "Analyzing BOM document with AI. This may take a moment...",
        { id: "ai-toast" },
      );

      const aiFormData = new FormData();
      aiFormData.append("file", file);

      const aiResponse = await axios.post(
        `${AI_URL}/v1/upload-and-extract`,
        aiFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const extractedData = aiResponse.data.data;
      const metadata = aiResponse.data.metadata;

      // Extract Risk & Confidence
      const hasFraud = metadata.fraud_summary?.fraud_items > 0;
      setAiMetadata({
        confidence: metadata.confidence_score || "0%",
        risk: metadata.unit_cost_fraud?.risk || "0%",
        fraudItems: metadata.fraud_summary?.fraud_items || 0,
        fraudMessage: metadata.unit_cost_fraud?.message || "",
      });

      if (hasFraud) {
        toast.warning(
          `Attention: AI flagged ${metadata.fraud_summary.fraud_items} potential anomalies.`,
        );
      } else {
        toast.success("Data extracted successfully!", { id: "ai-toast" });
      }

      const editableItems: EditableComponent[] = extractedData.map(
        (item: any) => {
          const compName = Object.keys(item.component)[0];
          const costStr = item.component[compName];
          return {
            id: crypto.randomUUID(),
            name: compName,
            cost: parseCurrency(costStr),
            origin:
              item.origin.toLowerCase() === "imported"
                ? "imported"
                : "domestic",
            supplierName: item.supplier || "",
            fraudDetected: item.fraud_detected || false,
          };
        },
      );

      setComponents(editableItems);
      setStep(2);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          "AI Extraction Failed. Please check the document format.",
        { id: "ai-toast" },
      );
    } finally {
      setProcessing(false);
    }
  };

  // --- STEP 2 EDIT HANDLERS ---
  const updateComponent = (
    index: number,
    field: keyof EditableComponent,
    value: any,
  ) => {
    const newComps = [...components];
    newComps[index] = { ...newComps[index], [field]: value };
    setComponents(newComps);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {
        id: crypto.randomUUID(),
        name: "",
        cost: 0,
        origin: "domestic",
        supplierName: "",
        fraudDetected: false,
      },
    ]);
  };

  // --- STEP 2: FINAL SUBMIT TO DB, STORAGE, AND BLOCKCHAIN ---
  const handleFinalSubmit = async () => {
    setSaving(true);
    try {
      const totalCost = components.reduce((sum, c) => sum + Number(c.cost), 0);
      const domesticCost = components
        .filter((c) => c.origin === "domestic")
        .reduce((sum, c) => sum + Number(c.cost), 0);
      const dvaScore = totalCost > 0 ? (domesticCost / totalCost) * 100 : 0;

      // Map back to the exact JSON structure your DB controller is expecting
      const reconstructedOcrData = {
        data: components.map((c) => ({
          supplier: c.supplierName,
          component: { [c.name]: c.cost.toString() },
          origin: c.origin,
          percent_of_total:
            totalCost > 0
              ? `${((c.cost / totalCost) * 100).toFixed(1)}%`
              : "0%",
        })),
        metadata: {
          total_cost: totalCost.toString(),
          domestic_cost: domesticCost.toString(),
          dva_score: `${dvaScore.toFixed(1)}%`,
          confidence_score: aiMetadata.confidence, // Pass through AI generated metrics
          risk_score: aiMetadata.risk, // Pass through AI generated metrics
        },
      };

      // 1. Save to MySQL
      const response = await axios.post(
        `${API_URL}/products`,
        {
          name: formData.name,
          category: formData.category,
          ocrData: reconstructedOcrData,
        },
        { withCredentials: true },
      );

      if (response.data?.success) {
        const newProductId = response.data.product.id;
        const supplierId = response.data.product.supplierId;

        // 2. Upload Document
        if (file) {
          const fileFormData = new FormData();
          fileFormData.append("file", file);
          fileFormData.append("productId", newProductId);

          try {
            await axios.post(`${API_URL}/files/upload`, fileFormData, {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (fileErr) {
            console.error("Document upload failed", fileErr);
          }
        }

        // 3. Anchor to Hyperledger
        try {
          toast.loading("Anchoring compliance record to blockchain...", {
            id: "ledger",
          });
          const bomHash = await generateBOMHash(reconstructedOcrData);

          await axios.post(
            `${API_URL}/compliance/product`,
            { supplierId, productId: newProductId, bomHash, dva: dvaScore },
            { withCredentials: true },
          );

          toast.success("Compliance record anchored to blockchain securely!", {
            id: "ledger",
          });
        } catch (bcErr) {
          toast.error("Database saved, but failed to anchor to blockchain.", {
            id: "ledger",
          });
        }

        toast.success(`Success! Final DVA Score: ${dvaScore.toFixed(1)}%`);
        navigate("/products");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save product to database.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4">
      <Button
        variant="ghost"
        onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />{" "}
        {step === 2 ? "Back to Upload" : "Back"}
      </Button>

      {/* ================= STEP 1: UPLOAD ================= */}
      {step === 1 && (
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-display">
              Register Product & Extract BOM
            </CardTitle>
            <CardDescription>
              Enter details and upload your Bill of Materials. Our AI will
              extract the data for you to review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExtractBOM} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label>
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Industrial Motor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <Label>
                  Upload Bill of Materials (PDF, Image, Excel){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      PDF, PNG, JPG up to 10MB
                    </p>
                    {file && (
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded">
                        <FileText className="h-4 w-4" /> {file.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 mt-8"
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                {processing ? "Extracting Data..." : "Extract Data with AI"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ================= STEP 2: REVIEW & EDIT ================= */}
      {step === 2 && (
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-display flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" /> Review AI Extraction
                </CardTitle>
                <CardDescription className="mt-1">
                  Verify components from <strong>{file?.name}</strong>. Correct
                  inaccuracies before saving.
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  AI Confidence: {aiMetadata.confidence}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Fraud Warning Banner */}
            {aiMetadata.fraudItems > 0 && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 text-red-900 p-4 rounded-lg border border-red-200 text-sm">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 mb-1">
                    AI flagged {aiMetadata.fraudItems} potential anomalies
                  </p>
                  <p>{aiMetadata.fraudMessage}</p>
                  <p className="mt-2 font-medium text-xs">
                    Please correct the highlighted fields below.
                  </p>
                </div>
              </div>
            )}

            {/* Editable Grid Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-sm font-semibold text-muted-foreground">
              <div className="col-span-3">Component Name</div>
              <div className="col-span-3">Manufacturer</div>
              <div className="col-span-2">Origin</div>
              <div className="col-span-3">Cost (₹)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Editable Rows */}
            {components.map((comp, index) => (
              <div
                key={comp.id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 rounded-lg border ${
                  comp.fraudDetected
                    ? "bg-red-50 border-red-300 ring-1 ring-red-200"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                <div className="col-span-3">
                  <Input
                    value={comp.name}
                    onChange={(e) =>
                      updateComponent(index, "name", e.target.value)
                    }
                    placeholder="Name"
                    className="bg-white"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    value={comp.supplierName}
                    onChange={(e) =>
                      updateComponent(index, "supplierName", e.target.value)
                    }
                    placeholder="Supplier"
                    className="bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    value={comp.origin}
                    onValueChange={(val) =>
                      updateComponent(index, "origin", val)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic</SelectItem>
                      <SelectItem value="imported">Imported</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    value={comp.cost === 0 ? "" : comp.cost}
                    onChange={(e) =>
                      updateComponent(index, "cost", e.target.value)
                    }
                    placeholder="0.00"
                    className="bg-white"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeComponent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={addComponent}
                className="w-full border-dashed gap-2 text-muted-foreground"
              >
                <PlusCircle className="h-4 w-4" /> Add Missing Component
              </Button>
            </div>

            <Button
              onClick={handleFinalSubmit}
              className="w-full gradient-primary mt-8 h-12 text-lg"
              disabled={saving || components.length === 0}
            >
              {saving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              {saving ? "Processing Records..." : "Confirm & Submit Product"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewProduct;
