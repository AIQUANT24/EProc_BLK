import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  BarChart3,
  Lock,
  Zap,
  Globe,
  Building2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Search,
  Database,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Public Procurement", value: "₹88L Cr", sub: "Annual Market" },
    { label: "GeM GMV FY25", value: "₹5.42L Cr", sub: "Processed" },
    { label: "Registered Sellers", value: "76L+", sub: "On GeM" },
    { label: "API Response", value: "<200ms", sub: "p95 Latency" },
  ];

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-time Analytics",
      desc: "Instant insights into domestic value addition and procurement trends.",
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Fraud Detection",
      desc: "AI-powered engine to detect anomalies in BOM and origin declarations.",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Blockchain Ledger",
      desc: "Every verification is anchored to an immutable ledger for audit transparency.",
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Verification API",
      desc: "Real-time compliance verification for procurement platforms. DVA score, classification, and blockchain proof.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "BOM Management",
      desc: "Multi-tier Bill of Materials editor with component-level origin tracking and What-If analysis.",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Enterprise RBAC",
      desc: "Role-based access for Suppliers, Procurement Officers, and Administrators with audit trails.",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Register & Declare",
      desc: "Suppliers register products and declare component-level Bill of Materials with origin data.",
    },
    {
      step: "02",
      title: "Calculate & Classify",
      desc: "DVA Engine computes domestic value percentage and classifies as Class I, II, or Non-Local.",
    },
    {
      step: "03",
      title: "Detect & Verify",
      desc: "Fraud engine scans for anomalies. Blockchain anchors every event for immutable proof.",
    },
    {
      step: "04",
      title: "Certify & Procure",
      desc: "Procurement platforms verify compliance via API. Blockchain-backed certificates issued.",
    },
  ];

  const stakeholders = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Suppliers & Manufacturers",
      items: [
        "Register products & declare BOMs",
        "Get automated DVA certification",
        "What-If analysis for optimization",
        "Free tier for MSMEs",
      ],
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Procurement Officers",
      items: [
        "One-click compliance verification",
        "AI-powered fraud alerts",
        "Blockchain-backed audit trail",
        "Real-time risk scoring",
      ],
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Government & Auditors",
      items: [
        "National compliance analytics",
        "Policy simulation engine",
        "Multi-agency blockchain access",
        "Complete audit trail",
      ],
    },
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
            <span className="font-display text-xl font-bold tracking-tight">
              NMICOV
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#stats"
              className="hover:text-foreground transition-colors"
            >
              Impact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button
              className="gradient-primary text-primary-foreground gap-2"
              onClick={() => navigate("/login")}
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(262_83%_58%/0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> India's First Digital PPP-MII
              Compliance Infrastructure
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight lg:text-7xl">
              Verify. Trust.{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Procure.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:text-xl">
              Securing national procurement with automated local content
              verification and blockchain-backed transparency.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground gap-2 h-14 px-8 text-base font-semibold shadow-lg"
                onClick={() => navigate("/login")}
              >
                Launch Platform <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base gap-2"
                onClick={() => navigate("/login")}
              >
                <Globe className="h-5 w-5" /> View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section
        id="stats"
        className="border-y border-border/50 bg-muted/30 py-16"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold lg:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {s.label}
                </p>
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
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Enterprise Compliance Infrastructure
            </h2>
            <p className="mt-4 text-muted-foreground">
              Six integrated modules powering end-to-end Make-in-India
              verification.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {f.icon}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
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
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              How NMICOV Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              From BOM declaration to blockchain-certified compliance in four
              steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="mb-4 font-display text-5xl font-bold text-primary/15">
                  {w.step}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {w.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {w.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Built for Every Stakeholder
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {stakeholders.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                      {s.icon}
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-4">
                      {s.title}
                    </h3>
                    <ul className="space-y-3">
                      {s.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
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
                Ready to Transform Procurement Compliance?
              </h2>
              <p className="mx-auto max-w-xl text-primary-foreground/80 mb-8">
                Join India's national compliance infrastructure. Free for MSMEs.
                Enterprise-ready for government.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-base font-semibold gap-2"
                  onClick={() => navigate("/login")}
                >
                  Launch Platform <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 px-8 text-base text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10"
                >
                  Contact Sales
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
              <span className="font-display font-bold">NMICOV</span>
              <span className="text-xs text-muted-foreground">
                National Compliance Infrastructure
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 NMICOV. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
