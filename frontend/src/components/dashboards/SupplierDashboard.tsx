import { useMockData } from "@/contexts/MockDataContext";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ClipboardList,
  Calculator,
  CheckCircle,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SupplierDashboard = () => {
  // Logic: In a real app, 'SUP-001' would come from useAuth().user.id
  const { products, compliance } = useMockData();
  const navigate = useNavigate();

  const myProducts = products.filter((p) => p.supplierId === "SUP-001");
  const myCompliance = compliance.filter((c) =>
    myProducts.some((p) => p.id === c.productId),
  );

  // Safe DVA Average Calculation
  const avgDva =
    myCompliance.length > 0
      ? (
          myCompliance.reduce((sum, c) => sum + c.dvaScore, 0) /
          myCompliance.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Supplier Dashboard"
        description="Manage your products, declarations, and track compliance status"
        actions={
          <Button
            onClick={() => navigate("/products")}
            className="gradient-primary text-primary-foreground gap-2"
          >
            <Plus className="h-4 w-4" /> New Product
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Products"
          value={myProducts.length}
          icon={<Package className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="BOMs Submitted"
          value={myProducts.filter((p) => p.status !== "draft").length}
          icon={<ClipboardList className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Avg DVA Score"
          value={`${avgDva}%`}
          icon={<Calculator className="h-6 w-6 text-amber-500" />}
        />
        <StatCard
          title="Compliant Units"
          value={myCompliance.filter((c) => c.status === "compliant").length}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Catalog Summary */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              Recent Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myProducts.length > 0 ? (
                myProducts.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4 cursor-pointer hover:bg-muted/50 transition-all"
                    onClick={() => navigate("/products")}
                  >
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.category} • HSN: {p.hsnCode}
                      </p>
                    </div>
                    <Badge
                      variant={
                        p.status === "verified"
                          ? "default"
                          : p.status === "submitted"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {p.status.toUpperCase()}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No products found. Start by adding a new one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status Tracker */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myCompliance.length > 0 ? (
                myCompliance.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-sm">{c.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        DVA Score:{" "}
                        <span className="font-medium text-foreground">
                          {c.dvaScore}%
                        </span>{" "}
                        • {c.classification}
                      </p>
                    </div>
                    <Badge
                      variant={
                        c.status === "compliant"
                          ? "default"
                          : c.status === "non-compliant"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {c.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No compliance data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;
