import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MockDataProvider } from "@/contexts/MockDataContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Suppliers from "@/pages/Suppliers";
import Products from "@/pages/Products";
import BOMManagement from "@/pages/BOMManagement";
import DVAResults from "@/pages/DVAResults";
import Compliance from "@/pages/Compliance";
import Verification from "@/pages/Verification";
import AuditLogs from "@/pages/AuditLogs";
import UserManagement from "@/pages/UserManagement";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Signup from "@/pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SupplierProfilePage from "./components/suppliers/SupplierProfilePage";
import NewProduct from "./components/products/NewProductPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <MockDataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />

                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route
                    path="/suppliers/profile"
                    element={<SupplierProfilePage />}
                  />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/new" element={<NewProduct />} />
                  <Route path="/bom/:id" element={<BOMManagement />} />
                  <Route path="/dva" element={<DVAResults />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/audit" element={<AuditLogs />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MockDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
