import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Search,
  FileText,
  LogOut,
  Users,
  Building2,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["superadmin", "admin", "procurement", "supplier", "auditor"],
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: <Building2 className="h-5 w-5" />,
    roles: ["superadmin", "admin", "procurement", "auditor"],
  },
  {
    label: "Products",
    path: "/products",
    icon: <Package className="h-5 w-5" />,
    roles: ["superadmin", "admin", "procurement", "supplier", "auditor"],
  },
  {
    label: "DVA Engine",
    path: "/dva",
    icon: <Calculator className="h-5 w-5" />,
    roles: ["superadmin", "admin", "procurement", "supplier", "auditor"],
  },
  {
    label: "Compliance Records",
    path: "/compliance",
    icon: <ShieldCheck className="h-5 w-5" />,
    roles: ["superadmin", "admin", "procurement", "auditor"],
  },
  {
    label: "Verification Logs",
    path: "/verification",
    icon: <Search className="h-5 w-5" />,
    roles: ["superadmin", "admin", "procurement"],
  },
  {
    label: "Audit Trail",
    path: "/audit",
    icon: <FileText className="h-5 w-5" />,
    roles: ["superadmin", "admin", "auditor"],
  },
  {
    label: "User Management",
    path: "/users",
    icon: <Users className="h-5 w-5" />,
    roles: ["superadmin", "admin"],
  },
];

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  superadmin: "Super Admin",
  admin: "DPIIT Administrator",
  procurement: "Procurement Officer",
  supplier: "Manufacturer / Supplier",
  auditor: "Statutory Auditor",
};

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const filteredItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role),
  );
  const isSuperadmin = user.role === "superadmin";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent transition-transform"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Brand Logo */}
      <div
        className={`flex items-center border-b border-sidebar-border py-6 transition-all ${
          isCollapsed ? "justify-center px-0" : "px-5 gap-3"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-sm">
          <ShieldCheck className="h-6 w-6 text-primary-foreground shrink-0" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-display text-lg font-bold tracking-tight leading-none truncate">
              NMICOV
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/40 truncate">
              Compliance Infra
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 custom-scrollbar">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined} // Shows tooltip on hover when collapsed
            className={`flex items-center rounded-md py-2 text-sm text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground group ${
              isCollapsed ? "justify-center px-0" : "px-3 gap-3"
            }`}
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-semibold shadow-sm"
          >
            <span className="transition-transform group-hover:scale-110 shrink-0">
              {item.icon}
            </span>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Session Section */}
      <div
        className={`mt-auto border-t border-sidebar-border bg-sidebar-accent/20 transition-all ${
          isCollapsed ? "p-3" : "p-4"
        }`}
      >
        <div
          className={`mb-4 flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div
            title={isCollapsed ? user.fullName : undefined}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-sidebar-border text-xs font-bold text-primary-foreground shadow-sm ${
              isSuperadmin
                ? "bg-gradient-to-br from-amber-400 to-orange-600"
                : "gradient-primary"
            }`}
          >
            {isSuperadmin ? (
              <Crown className="h-5 w-5" />
            ) : (
              user.fullName.charAt(0)
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
                {ROLE_DISPLAY_NAMES[user.role]}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            title={isCollapsed ? "Sign Out" : undefined}
            className={`w-full text-xs text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors ${
              isCollapsed ? "justify-center px-0" : "justify-start gap-2"
            }`}
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
