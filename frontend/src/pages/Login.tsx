import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Mail, Lock, ArrowRight, Crown, Settings, Zap, User, Eye, Languages } from "lucide-react";
import { motion } from "framer-motion";

const DEMO_ROLES: { role: UserRole; labelKey: string; descKey: string; icon: React.ReactNode; bg: string }[] = [
  { role: "superadmin", labelKey: "roleSuperadmin", descKey: "Full platform control", icon: <Crown className="h-4 w-4" />, bg: "bg-gradient-to-r from-amber-500 to-orange-600" },
  { role: "admin", labelKey: "roleAdmin", descKey: "DPIIT management", icon: <Settings className="h-4 w-4" />, bg: "gradient-primary" },
  { role: "procurement", labelKey: "roleProcurement", descKey: "GeM officer", icon: <Zap className="h-4 w-4" />, bg: "gradient-accent" },
  { role: "supplier", labelKey: "roleSupplier", descKey: "Submit BOMs", icon: <User className="h-4 w-4" />, bg: "gradient-warm" },
  { role: "auditor", labelKey: "roleAuditor", descKey: "CAG read-only", icon: <Eye className="h-4 w-4" />, bg: "bg-gradient-to-r from-slate-600 to-slate-800" },
];

const Login = () => {
  const { login, loginAsDemo, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(email, password);
    if (ok) navigate("/dashboard");
    else setError(language === "hi" ? "अमान्य क्रेडेंशियल्स। नीचे डेमो अकाउंट का उपयोग करें।" : "Invalid credentials. Use a demo account below.");
  };

  const handleDemo = (role: UserRole) => {
    loginAsDemo(role);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="gap-1">
            <Languages className="h-4 w-4" />
            {language === "en" ? "हिंदी" : "English"}
          </Button>
        </div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
            <ShieldCheck className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("appName")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("appFullName")}</p>
        </motion.div>

        {/* Login Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-xl border border-border">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold font-display mb-1 text-foreground">{t("loginTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-6">{t("loginSubtitle")}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">{t("loginEmail")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">{t("loginPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full gradient-primary text-primary-foreground gap-2 h-12 text-base font-semibold">
                  {t("loginButton")} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {t("loginNoAccount")}{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline">{t("loginSignupLink")}</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Demo Access */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border border-border shadow-lg">
            <CardContent className="p-6">
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {language === "hi" ? "त्वरित डेमो एक्सेस — भूमिका चुनें" : "Quick Demo Access — Pick a Role"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_ROLES.map(({ role, labelKey, descKey, icon, bg }) => (
                  <Button
                    key={role}
                    onClick={() => handleDemo(role)}
                    className={`${bg} text-white gap-2 h-auto py-3 px-4 font-semibold shadow-md hover:shadow-lg transition-shadow flex flex-col items-start text-left w-full`}
                  >
                    <span className="flex items-center gap-2 text-sm">{icon} {t(labelKey as any)}</span>
                    <span className="text-[11px] font-normal opacity-80">{descKey}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
