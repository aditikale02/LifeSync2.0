import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldown > 0) {
      toast({
        title: "Please wait",
        description: `Please wait ${cooldown} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (
          error.status === 429 ||
          error.message.toLowerCase().includes("rate limit") ||
          error.message.toLowerCase().includes("too many requests")
        ) {
          setCooldown(30);
          throw new Error("Too many signup attempts. Please wait a moment.");
        }
        throw error;
      }

      if (data.session) {
        toast({
          title: "Registration Successful",
          description: "Welcome to LifeSync!",
        });
        setLocation("/dashboard");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(
          "Account created, but email confirmation is still enabled in Supabase. Disable Confirm email in Auth settings for instant signup."
        );
      }

      toast({
        title: "Registration Successful",
        description: "Welcome to LifeSync!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-slate-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/20 rounded-full blur-[120px] -z-1" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-[120px] -z-1" />

      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 w-full flex items-center justify-between">
            <Link href="/">
              <a className="inline-flex items-center px-5 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white transition text-sm font-medium text-slate-700 hover:text-indigo-600">
                ← Back to Home
              </a>
            </Link>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              <Sparkles className="h-5 w-5" />
              LifeSync
            </div>
          </div>

          <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900 text-3xl font-black tracking-tight">Create Account</CardTitle>
              <CardDescription className="text-slate-500 font-medium text-base">
                Register and start your wellness journey instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-bold ml-1">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                    className="bg-white/50 border-slate-200 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-medium"
                    data-testid="input-register-name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="bg-white/50 border-slate-200 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-medium"
                    data-testid="input-register-email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-slate-700 font-bold">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="bg-white/50 border-slate-200 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-medium"
                    data-testid="input-register-password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg h-14 rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                  data-testid="button-register"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : cooldown > 0 ? (
                    `Wait ${cooldown}s`
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600 font-medium">
                Already have an account?{" "}
                <Link href="/login">
                  <a className="text-indigo-600 hover:text-indigo-700 font-bold">Sign in</a>
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}