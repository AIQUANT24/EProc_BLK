import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ProcurementDashboard from "@/components/dashboards/ProcurementDashboard";
import SupplierDashboard from "@/components/dashboards/SupplierDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case "superadmin":
    case "admin":
      return <AdminDashboard />;
    case "procurement":
      return <ProcurementDashboard />;
    case "supplier":
      return <SupplierDashboard />;
    case "auditor":
      return <ProcurementDashboard />;
  }
};

export default Dashboard;
