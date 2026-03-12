import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
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
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const SupplierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    supplierProfile: null as any,
    products: [] as any[],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch both profile and products concurrently
      const [profileRes, productsRes] = await Promise.all([
        axios
          .get(`${API_URL}/suppliers/profile`, { withCredentials: true })
          .catch((e) => e.response),
        axios
          .get(`${API_URL}/products`, { withCredentials: true })
          .catch((e) => e.response),
      ]);

      let profile = null;
      let productsList = [];

      // Handle Profile Response
      if (profileRes?.data?.success) {
        profile = profileRes.data.supplier;
      } else if (profileRes?.status === 404) {
        toast.info("Welcome! Please complete your organizational profile.");
      }

      // Handle Products Response
      if (productsRes?.data?.success) {
        productsList = productsRes.data.products;
      }

      setDashboardData({
        supplierProfile: profile,
        products: productsList,
      });
    } catch (error: any) {
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [fetchDashboardData, user]);

  const isProfileComplete = !!dashboardData.supplierProfile;

  const handleNewProductClick = () => {
    if (!isProfileComplete) {
      toast.error("Action Restricted", {
        description:
          "You must complete your organizational profile before adding products.",
      });
      return;
    }
    navigate("/products/new");
  };

  // --- KPI Calculations ---
  const myProducts = dashboardData.products || [];

  const bomsSubmitted = myProducts.filter((p) => p.status !== "draft").length;

  const productsWithDva = myProducts.filter(
    (p) => p.dvaScore !== null && p.dvaScore !== undefined,
  );
  const avgDva =
    productsWithDva.length > 0
      ? (
          productsWithDva.reduce((sum, p) => sum + parseFloat(p.dvaScore), 0) /
          productsWithDva.length
        ).toFixed(1)
      : "0.0";

  // Assuming 'verified' or 'active' status signifies a compliant, approved unit
  const compliantUnits = myProducts.filter(
    (p) => p.status === "verified" || p.status === "active",
  ).length;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Syncing with database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Supplier Dashboard"
        description={`Welcome back, ${user?.fullName || "Supplier"}. Monitoring compliance for ${
          dashboardData.supplierProfile?.location || "your organization"
        }.`}
        actions={
          <Button
            onClick={handleNewProductClick}
            className={`${
              isProfileComplete
                ? "gradient-primary"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            } text-primary-foreground gap-2`}
          >
            {isProfileComplete ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            New Product
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
          value={bomsSubmitted}
          icon={<ClipboardList className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Avg DVA Score"
          value={`${avgDva}%`}
          icon={<Calculator className="h-6 w-6 text-amber-500" />}
        />
        <StatCard
          title="Compliant Units"
          value={compliantUnits}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organizational Details Card */}
        <Card
          className={`border-border/50 shadow-sm ${!isProfileComplete ? "border-amber-500/50 bg-amber-50/10" : ""}`}
        >
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              Organizational Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProfileComplete ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      GST Number
                    </p>
                    <p className="font-semibold uppercase">
                      {dashboardData.supplierProfile.gst}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      PAN Number
                    </p>
                    <p className="font-semibold uppercase">
                      {dashboardData.supplierProfile.pan}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      Udyam Number
                    </p>
                    <p className="font-semibold uppercase">
                      {dashboardData.supplierProfile.udyam}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      Sector
                    </p>
                    <p className="font-semibold uppercase">
                      {dashboardData.supplierProfile.sector}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      MSME Status
                    </p>
                    <p className="font-semibold">
                      {dashboardData.supplierProfile.msme_status}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      Location
                    </p>
                    <p className="font-semibold">
                      {dashboardData.supplierProfile.location},{" "}
                      {dashboardData.supplierProfile.state}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs h-9 mt-2"
                  onClick={() => navigate("/suppliers/profile")}
                >
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle className="h-8 w-8 text-amber-500 mb-2 opacity-80" />
                <p className="text-amber-700 font-medium text-sm">
                  Action Required
                </p>
                <p className="text-muted-foreground text-xs mb-4 max-w-[200px]">
                  Complete your profile to unlock product management.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate("/suppliers/profile")}
                  className="gradient-primary"
                >
                  Complete Profile Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Status Tracker (Designed to match your screenshot) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myProducts.length > 0 ? (
                myProducts.slice(0, 5).map((p) => {
                  // Determine visual styling based on status
                  let badgeVariant: any = "outline";
                  let badgeLabel = p.status;

                  if (p.status === "verified" || p.status === "active") {
                    badgeVariant = "default"; // Primary purple
                    badgeLabel = "compliant";
                  } else if (p.status === "under_review") {
                    badgeVariant = "secondary"; // Gray/neutral
                    badgeLabel = "under-review";
                  }

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          DVA: {p.dvaScore !== null ? `${p.dvaScore}%` : "N/A"}
                          {p.classification ? ` • ${p.classification}` : ""}
                        </p>
                      </div>
                      <Badge
                        variant={badgeVariant}
                        className="px-3 py-0.5 font-medium lowercase"
                      >
                        {badgeLabel}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-lg">
                  <ShieldCheck className="h-10 w-10 text-muted-foreground/20 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No products found. Register a product to see compliance
                    status.
                  </p>
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
