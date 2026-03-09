import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Mail, Lock, User, Building2, ArrowRight, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const { isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", organization: "", role: "" });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: language === "hi" ? "पासवर्ड मेल नहीं खाते" : "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!form.role) {
      toast({ title: language === "hi" ? "कृपया एक भूमिका चुनें" : "Please select a role", variant: "destructive" });
      return;
    }
    toast({
      title: language === "hi" ? "पंजीकरण जमा किया गया" : "Registration submitted",
      description: language === "hi" ? "आपका खाता अनुमोदन के लिए लंबित है। अभी डेमो लॉगिन का उपयोग करें।" : "Your account is pending approval. You'll receive an email once activated. For now, use the demo login.",
    });
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

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

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
            <ShieldCheck className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("signupTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("signupSubtitle")}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-xl border border-border">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground">{t("signupName")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder={language === "hi" ? "आपका नाम" : "Your name"} value={form.name} onChange={e => update("name", e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground">{t("labelOrganization")}</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder={language === "hi" ? "कंपनी / विभाग" : "Company / Dept"} value={form.organization} onChange={e => update("organization", e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">{t("signupEmail")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">{t("labelRole")}</Label>
                  <Select value={form.role} onValueChange={v => update("role", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "hi" ? "अपनी भूमिका चुनें" : "Select your role"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">{t("roleSupplier")} — {language === "hi" ? "BOM और उत्पाद जमा करें" : "Submit BOMs & products"}</SelectItem>
                      <SelectItem value="procurement">{t("roleProcurement")} — {language === "hi" ? "अनुपालन सत्यापित करें" : "Verify compliance"}</SelectItem>
                      <SelectItem value="auditor">{t("roleAuditor")} — {language === "hi" ? "केवल-पढ़ने योग्य ऑडिट एक्सेस" : "Read-only audit access"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground">{t("signupPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" value={form.password} onChange={e => update("password", e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground">{t("signupConfirm")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" value={form.confirm} onChange={e => update("confirm", e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-primary text-primary-foreground gap-2 h-12 text-base font-semibold">
                  {t("signupButton")} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {t("signupHaveAccount")}{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">{t("signupLoginLink")}</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
