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
import { Loader2, Save, ArrowLeft, UploadCloud, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// The exact JSON your Junior's OCR tool will return
const MOCK_OCR_RESPONSE = {
  data: [
    {
      supplier: "titan",
      component: { watch: "$1,750.00" },
      origin: "imported",
      percent_of_total: "26.7%",
      fraud_detected: false,
    },
    {
      supplier: "avon",
      component: { cycle: "$1,100.00" },
      origin: "domestic",
      percent_of_total: "16.8%",
      fraud_detected: false,
    },
    {
      supplier: "myntra",
      component: { shirt: "$500.00" },
      origin: "imported",
      percent_of_total: "7.6%",
      fraud_detected: false,
    },
    {
      supplier: "myntra",
      component: { pant: "$700.00" },
      origin: "imported",
      percent_of_total: "10.7%",
      fraud_detected: false,
    },
    {
      supplier: "Hero",
      component: { Bike: "$2,500.00" },
      origin: "domestic",
      percent_of_total: "38.2%",
      fraud_detected: false,
    },
  ],
  metadata: {
    total_cost: "$6,550.00",
    domestic_cost: "$3,450.00",
    dva_score: "78%",
  },
};

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

const NewProduct = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a Bill of Materials document.");
      return;
    }

    setSaving(true);

    try {
      // 1. SIMULATE OCR API CALL (Replace this with real axios call later)
      toast.info("Extracting data from BOM...", { duration: 2000 });
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const extractedOcrData = MOCK_OCR_RESPONSE;

      // 2. SEND TO YOUR BACKEND
      const response = await axios.post(
        `${API_URL}/products`, // Make sure to map this route in Express
        {
          name: formData.name,
          category: formData.category,
          ocrData: extractedOcrData, // Pass the JSON directly to the backend
        },
        { withCredentials: true },
      );

      if (response.data?.success) {
        toast.success(
          `Success! DVA Score calculated at ${extractedOcrData.metadata.dva_score}`,
        );
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to process product";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-display">
            Register Product & BOM
          </CardTitle>
          <CardDescription>
            Enter product details and upload your Bill of Materials. Our AI will
            automatically extract components and calculate your DVA score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* File Upload Section */}
            <div className="mt-6">
              <Label>
                Upload Bill of Materials (PDF, Image, Excel){" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <UploadCloud
                    className="mx-auto h-12 w-12 text-gray-300"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept=".pdf,.png,.jpg,.xlsx"
                      />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    PDF, PNG, JPG up to 10MB
                  </p>
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50 p-2 rounded">
                      <FileText className="h-4 w-4" /> {file.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary mt-8"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? "Processing BOM with AI..." : "Submit Product & BOM"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProduct;
