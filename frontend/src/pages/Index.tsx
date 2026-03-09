import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ShieldCheck, ArrowRight, BarChart3, Lock, Zap, Globe, Building2,
  CheckCircle2, FileText, AlertTriangle, Search, Database, Languages
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const stats = [
    { label: language === "hi" ? "सार्वजनिक खरीद" : "Public Procurement", value: "₹88L Cr", sub: language === "hi" ? "वार्षिक बाजार" : "Annual Market" },
    { label: language === "hi" ? "GeM GMV FY25" : "GeM GMV FY25", value: "₹5.42L Cr", sub: language === "hi" ? "संसाधित" : "Processed" },
    { label: language === "hi" ? "पंजीकृत विक्रेता" : "Registered Sellers", value: "76L+", sub: language === "hi" ? "GeM पर" : "On GeM" },
    { label: language === "hi" ? "API प्रतिक्रिया" : "API Response", value: "<200ms", sub: language === "hi" ? "p95 विलंबता" : "p95 Latency" },
  ];

  const features = [
    { icon: <BarChart3 className="h-6 w-6" />, title: t("landingFeature1Title"), desc: t("landingFeature1Desc") },
    { icon: <AlertTriangle className="h-6 w-6" />, title: t("landingFeature4Title"), desc: t("landingFeature4Desc") },
    { icon: <Database className="h-6 w-6" />, title: t("landingFeature2Title"), desc: t("landingFeature2Desc") },
    { icon: <Search className="h-6 w-6" />, title: language === "hi" ? "सत्यापन API" : "Verification API", desc: language === "hi" ? "खरीद प्लेटफॉर्म के लिए रीयल-टाइम अनुपालन सत्यापन।" : "Real-time compliance verification for procurement platforms. DVA score, classification, and blockchain proof." },
    { icon: <FileText className="h-6 w-6" />, title: language === "hi" ? "BOM प्रबंधन" : "BOM Management", desc: language === "hi" ? "घटक-स्तर मूल ट्रैकिंग के साथ मल्टी-टियर बिल ऑफ मैटेरियल्स संपादक।" : "Multi-tier Bill of Materials editor with component-level origin tracking and What-If analysis." },
    { icon: <Lock className="h-6 w-6" />, title: language === "hi" ? "एंटरप्राइज RBAC" : "Enterprise RBAC", desc: language === "hi" ? "आपूर्तिकर्ताओं, खरीद अधिकारियों और प्रशासकों के लिए भूमिका-आधारित पहुंच।" : "Role-based access for Suppliers, Procurement Officers, and Administrators with audit trails." },
  ];

  const workflow = [
    { step: "01", title: language === "hi" ? "पंजीकरण और घोषणा" : "Register & Declare", desc: language === "hi" ? "आपूर्तिकर्ता उत्पाद पंजीकृत करते हैं और मूल डेटा के साथ घटक-स्तर बिल ऑफ मैटेरियल्स घोषित करते हैं।" : "Suppliers register products and declare component-level Bill of Materials with origin data." },
    { step: "02", title: language === "hi" ? "गणना और वर्गीकरण" : "Calculate & Classify", desc: language === "hi" ? "DVA इंजन घरेलू मूल्य प्रतिशत की गणना करता है और कक्षा I, II, या गैर-स्थानीय के रूप में वर्गीकृत करता है।" : "DVA Engine computes domestic value percentage and classifies as Class I, II, or Non-Local." },
    { step: "03", title: language === "hi" ? "पहचान और सत्यापन" : "Detect & Verify", desc: language === "hi" ? "धोखाधड़ी इंजन विसंगतियों के लिए स्कैन करता है। ब्लॉकचेन प्रत्येक घटना को अपरिवर्तनीय प्रमाण के लिए एंकर करता है।" : "Fraud engine scans for anomalies. Blockchain anchors every event for immutable proof." },
    { step: "04", title: language === "hi" ? "प्रमाणित और खरीदें" : "Certify & Procure", desc: language === "hi" ? "खरीद प्लेटफॉर्म API के माध्यम से अनुपालन सत्यापित करते हैं। ब्लॉकचेन-समर्थित प्रमाणपत्र जारी किए जाते हैं।" : "Procurement platforms verify compliance via API. Blockchain-backed certificates issued." },
  ];

  const stakeholders = [
    { icon: <Building2 className="h-6 w-6" />, title: language === "hi" ? "आपूर्तिकर्ता और निर्माता" : "Suppliers & Manufacturers", items: language === "hi" ? ["उत्पाद पंजीकृत करें और BOM घोषित करें", "स्वचालित DVA प्रमाणन प्राप्त करें", "अनुकूलन के लिए What-If विश्लेषण", "MSME के लिए मुफ्त टियर"] : ["Register products & declare BOMs", "Get automated DVA certification", "What-If analysis for optimization", "Free tier for MSMEs"] },
    { icon: <CheckCircle2 className="h-6 w-6" />, title: language === "hi" ? "खरीद अधिकारी" : "Procurement Officers", items: language === "hi" ? ["एक-क्लिक अनुपालन सत्यापन", "AI-संचालित धोखाधड़ी अलर्ट", "ब्लॉकचेन-समर्थित ऑडिट ट्रेल", "रीयल-टाइम जोखिम स्कोरिंग"] : ["One-click compliance verification", "AI-powered fraud alerts", "Blockchain-backed audit trail", "Real-time risk scoring"] },
    { icon: <ShieldCheck className="h-6 w-6" />, title: language === "hi" ? "सरकार और लेखा परीक्षक" : "Government & Auditors", items: language === "hi" ? ["राष्ट्रीय अनुपालन एनालिटिक्स", "नीति सिमुलेशन इंजन", "मल्टी-एजेंसी ब्लॉकचेन एक्सेस", "संपूर्ण ऑडिट ट्रेल"] : ["National compliance analytics", "Policy simulation engine", "Multi-agency blockchain access", "Complete audit trail"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">{t("appName")}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">{language === "hi" ? "विशेषताएं" : "Features"}</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">{language === "hi" ? "कैसे काम करता है" : "How It Works"}</a>
            <a href="#stats" className="hover:text-foreground transition-colors">{language === "hi" ? "प्रभाव" : "Impact"}</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="gap-1">
              <Languages className="h-4 w-4" />
              {language === "en" ? "हिंदी" : "EN"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/login")}>{t("landingLogin")}</Button>
            <Button className="gradient-primary text-primary-foreground gap-2" onClick={() => navigate("/login")}>
              {t("landingCTA")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(262_83%_58%/0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> {language === "hi" ? "भारत का पहला डिजिटल PPP-MII अनुपालन बुनियादी ढांचा" : "India's First Digital PPP-MII Compliance Infrastructure"}
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight lg:text-7xl">
              {language === "hi" ? "सत्यापित करें। विश्वास करें। " : "Verify. Trust. "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                {language === "hi" ? "खरीदें।" : "Procure."}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:text-xl">
              {t("landingHeroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gradient-primary text-primary-foreground gap-2 h-14 px-8 text-base font-semibold shadow-lg" onClick={() => navigate("/login")}>
                {language === "hi" ? "प्लेटफॉर्म लॉन्च करें" : "Launch Platform"} <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base gap-2" onClick={() => navigate("/login")}>
                <Globe className="h-5 w-5" /> {language === "hi" ? "डेमो देखें" : "View Demo"}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border/50 bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="font-display text-3xl font-bold lg:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold lg:text-4xl">{language === "hi" ? "एंटरप्राइज अनुपालन बुनियादी ढांचा" : "Enterprise Compliance Infrastructure"}</h2>
            <p className="mt-4 text-muted-foreground">{language === "hi" ? "छह एकीकृत मॉड्यूल एंड-टू-एंड मेक-इन-इंडिया सत्यापन को शक्ति प्रदान करते हैं।" : "Six integrated modules powering end-to-end Make-in-India verification."}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{f.icon}</div>
                    <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold lg:text-4xl">{language === "hi" ? "NMICOV कैसे काम करता है" : "How NMICOV Works"}</h2>
            <p className="mt-4 text-muted-foreground">{language === "hi" ? "BOM घोषणा से ब्लॉकचेन-प्रमाणित अनुपालन तक चार चरणों में।" : "From BOM declaration to blockchain-certified compliance in four steps."}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((w, i) => (
              <motion.div key={w.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                <div className="mb-4 font-display text-5xl font-bold text-primary/15">{w.step}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold lg:text-4xl">{language === "hi" ? "हर हितधारक के लिए बनाया गया" : "Built for Every Stakeholder"}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {stakeholders.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">{s.icon}</div>
                    <h3 className="font-display text-xl font-semibold mb-4">{s.title}</h3>
                    <ul className="space-y-3">
                      {s.items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Card className="overflow-hidden border-0 gradient-primary">
            <CardContent className="p-12 lg:p-16 text-center text-primary-foreground">
              <h2 className="font-display text-3xl font-bold lg:text-4xl mb-4">
                {language === "hi" ? "खरीद अनुपालन को बदलने के लिए तैयार हैं?" : "Ready to Transform Procurement Compliance?"}
              </h2>
              <p className="mx-auto max-w-xl text-primary-foreground/80 mb-8">
                {language === "hi" ? "भारत के राष्ट्रीय अनुपालन बुनियादी ढांचे से जुड़ें। MSME के लिए मुफ्त। सरकार के लिए एंटरप्राइज-रेडी।" : "Join India's national compliance infrastructure. Free for MSMEs. Enterprise-ready for government."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-base font-semibold gap-2" onClick={() => navigate("/login")}>
                  {language === "hi" ? "प्लेटफॉर्म लॉन्च करें" : "Launch Platform"} <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="ghost" className="h-14 px-8 text-base text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10">
                  {language === "hi" ? "बिक्री से संपर्क करें" : "Contact Sales"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">{t("appName")}</span>
              <span className="text-xs text-muted-foreground">{language === "hi" ? "राष्ट्रीय अनुपालन बुनियादी ढांचा" : "National Compliance Infrastructure"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 NMICOV. {t("footerPoweredBy")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
