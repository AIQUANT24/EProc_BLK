import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Package, ClipboardList, Calculator, ShieldCheck,
  AlertTriangle, Search, FileText, LogOut, Settings, Users, Building2, Crown, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TranslationKey } from "@/contexts/LanguageContext";

interface NavItem {
  labelKey: TranslationKey;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "navDashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, roles: ["superadmin", "admin", "procurement", "supplier", "auditor"] },
  { labelKey: "navSuppliers", path: "/suppliers", icon: <Building2 className="h-5 w-5" />, roles: ["superadmin", "admin", "procurement", "auditor"] },
  { labelKey: "navProducts", path: "/products", icon: <Package className="h-5 w-5" />, roles: ["superadmin", "admin", "procurement", "supplier", "auditor"] },
  { labelKey: "navBOM", path: "/bom", icon: <ClipboardList className="h-5 w-5" />, roles: ["superadmin", "admin", "supplier"] },
  { labelKey: "navDVA", path: "/dva", icon: <Calculator className="h-5 w-5" />, roles: ["superadmin", "admin", "procurement", "supplier", "auditor"] },
  { labelKey: "navCompliance", path: "/compliance", icon: <ShieldCheck className="h-5 w-5" />, roles: ["superadmin", "admin", "procurement", "auditor"] },
  { labelKey: "navAlerts", path: "/alerts", icon: <AlertTriangle className="h-5 w-5" />, roles: ["superadmin", "admin", "procurement"] },
  { labelKey: "navVerification", path: "/verification", icon: <Search className="h-5 w-5" />, roles: ["superadmin", "admin", "procurement"] },
  { labelKey: "navAudit", path: "/audit", icon: <FileText className="h-5 w-5" />, roles: ["superadmin", "admin", "auditor"] },
  { labelKey: "navUsers", path: "/users", icon: <Users className="h-5 w-5" />, roles: ["superadmin", "admin"] },
  { labelKey: "navSettings", path: "/settings", icon: <Settings className="h-5 w-5" />, roles: ["superadmin", "admin"] },
];

const ROLE_LABEL_KEYS: Record<UserRole, TranslationKey> = {
  superadmin: "roleSuperadmin",
  admin: "roleAdmin",
  procurement: "roleProcurement",
  supplier: "roleSupplier",
  auditor: "roleAuditor",
};

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  if (!user) return null;

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  const isSuperadmin = user.role === "superadmin";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
          <ShieldCheck className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight">{t("appName")}</h1>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">{t("appTagline")}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            {item.icon}
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* Language Switcher */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
        >
          <Languages className="h-4 w-4" />
          {language === "en" ? "हिंदी" : "English"}
        </Button>
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-primary-foreground ${isSuperadmin ? "bg-gradient-to-r from-amber-500 to-orange-600" : "gradient-primary"}`}>
            {isSuperadmin ? <Crown className="h-4 w-4" /> : user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/50">{t(ROLE_LABEL_KEYS[user.role])}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={logout}>
          <LogOut className="h-4 w-4" /> {t("navSignOut")}
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
