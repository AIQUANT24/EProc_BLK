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
    compliance: [] as any[],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/suppliers/profile`, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setDashboardData((prev) => ({
          ...prev,
          supplierProfile: response.data.supplier,
        }));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDashboardData((prev) => ({ ...prev, supplierProfile: null }));
        toast.info("Welcome! Please complete your organizational profile.");
      } else {
        const message =
          error.response?.data?.message || "Failed to load dashboard data";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [fetchDashboardData, user]);

  // NEW: Helper to check if profile is complete
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

  // Calculations
  const myProducts = dashboardData.products || [];
  const myCompliance = dashboardData.compliance || [];
  const avgDva =
    myCompliance.length > 0
      ? (
          myCompliance.reduce(
            (sum, c) => sum + (parseFloat(c.dva_score) || 0),
            0,
          ) / myCompliance.length
        ).toFixed(1)
      : "0.0";

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
            // Logic: Disable visually if profile is missing
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
          value={dashboardData.supplierProfile?.products_count || 0}
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

        {/* Compliance Status Tracker */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              Compliance Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>{/* ... existing compliance logic ... */}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;
