import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid email or password. Please check your credentials.");
      }
    } catch (err) {
      setError("Unable to connect to the authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent flash of login form while checking session
  if (authLoading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
            <ShieldCheck className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            NMICOV
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            National Compliance Infrastructure
          </p>
        </motion.div>

        {/* Main Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border border-border">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-display text-foreground">
                  Sign In
                </h2>
                <p className="text-sm text-muted-foreground">
                  Access your secure compliance portal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold text-foreground">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gradient-primary text-primary-foreground gap-2 h-12 text-base font-semibold transition-all hover:scale-[1.01]"
                >
                  {isSubmitting ? "Verifying..." : "Sign In"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Authorized personnel only. By signing in, you agree to our
                  <Link
                    to="/terms"
                    className="text-foreground font-medium hover:underline mx-1"
                  >
                    Terms
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Link */}
        <p className="text-center text-sm text-muted-foreground">
          New to the platform?{" "}
          <Link
            to="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Register your organization
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
