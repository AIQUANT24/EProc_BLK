import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, ShieldCheck, Loader2, FileSignature } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  id: string;
  name: string;
  dvaScore: number | null;
  classification: string | null;
  status:
    | "under_review"
    | "verified"
    | "non-compliant"
    | "active"
    | "draft"
    | "archived";
  confidence: number | null;
  risk: number | null;
  verificationLog: {
    message: string;
    status: string;
    timestamp: string;
  } | null;
  supplier?: {
    gst: string;
    user?: {
      fullName: string;
    };
  };
}

const Verification = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<
    "verified" | "non-compliant"
  >("verified");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        // Only show products that have been submitted (not drafts)
        const submittedProducts = response.data.products.filter(
          (p: Product) => p.status !== "draft",
        );
        setProducts(submittedProducts);
      }
    } catch (error: any) {
      toast.error("Failed to load products for verification");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenVerifyModal = () => {
    if (!selectedProductId) {
      toast.error("Please select a product to verify first.");
      return;
    }
    setVerifyMessage("");
    setVerifyStatus("verified");
    setIsModalOpen(true);
  };

  const handleConfirmVerification = async () => {
    if (!verifyMessage.trim()) {
      toast.error("Please provide verification notes.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update MySQL Database with the Log
      toast.loading("Saving verification log to database...", { id: "verify" });
      await axios.put(
        `${API_URL}/products/${selectedProductId}/verify`, // We will create this route below!
        {
          status: verifyStatus,
          message: verifyMessage,
        },
        { withCredentials: true },
      );

      // 2. Update Hyperledger Blockchain ONLY if Approved/Verified
      if (verifyStatus === "verified") {
        toast.loading("Anchoring approval to Blockchain...", { id: "verify" });
        await axios.put(
          `${API_URL}/compliance/approve/${selectedProductId}`,
          {},
          { withCredentials: true },
        );
      }

      toast.success("Verification complete and synced to ledger!", {
        id: "verify",
      });
      setIsModalOpen(false);
      setSelectedProductId("");
      fetchProducts(); // Refresh table
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to process verification.",
        { id: "verify" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Verification Console"
        description="Review supplier BOMs, validate DVA scores, and anchor compliance approvals to the blockchain."
      />

      {/* --- Action Controls --- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> Select Product for
            Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2 flex-1 min-w-64 max-w-md">
              <Label>Pending Products</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product under review..." />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((p) => p.status === "under_review")
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - {p.supplier?.user?.fullName || "Unknown"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleOpenVerifyModal}
              className="gradient-primary text-primary-foreground gap-2 h-10"
              disabled={loading}
            >
              <FileSignature className="h-4 w-4" /> Start Verification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Verification Logs Table --- */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">
            Compliance History (
            {products.filter((p) => p.verificationLog).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>DVA</TableHead>
                  <TableHead>AI Confidence</TableHead>
                  <TableHead>AI Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products
                  .filter(
                    (p) =>
                      p.verificationLog ||
                      p.status === "verified" ||
                      p.status === "non-compliant",
                  )
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        {p.supplier?.user?.fullName || p.supplier?.gst}
                      </TableCell>
                      <TableCell className="font-bold">{p.dvaScore}%</TableCell>
                      <TableCell>
                        {p.confidence ? `${p.confidence}%` : "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            p.risk && p.risk > 40
                              ? "text-destructive font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {p.risk ? `${p.risk}%` : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "verified"
                              ? "default"
                              : p.status === "non-compliant"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {p.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">
                        {p.verificationLog?.message || "No notes provided."}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* --- Verification Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Submit
              Verification
            </DialogTitle>
            <DialogDescription>
              Record your compliance decision. Approved products will be
              permanently anchored to the Hyperledger network.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Final Decision</Label>
              <Select
                value={verifyStatus}
                onValueChange={(val: any) => setVerifyStatus(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Approve (Compliant)</SelectItem>
                  <SelectItem value="non-compliant">
                    Reject (Non-Compliant)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Verification Notes / Audit Log{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="e.g., Manually reviewed BOM document. Origin of components verified against supplier records."
                value={verifyMessage}
                onChange={(e) => setVerifyMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmVerification} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {verifyStatus === "verified"
                ? "Approve & Write to Ledger"
                : "Mark Non-Compliant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Verification;
