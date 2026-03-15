import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle2, Heart, BrainCircuit, Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type AuthMode = "login" | "signup";

export default function Login() {
  const [mode, setMode] = useState<AuthMode>(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");

    if (modeParam === "signup" || path === "/register" || path === "/signup") {
      return "signup";
    }

    return "login";
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginCooldown, setLoginCooldown] = useState(0);

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupCooldown, setSignupCooldown] = useState(0);

  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (location === "/register" || location === "/signup") {
      setMode("signup");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setMode(params.get("mode") === "signup" ? "signup" : "login");
  }, [location]);

  useEffect(() => {
    if (loginCooldown > 0) {
      const timer = setTimeout(() => setLoginCooldown(loginCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [loginCooldown]);

  useEffect(() => {
    if (signupCooldown > 0) {
      const timer = setTimeout(() => setSignupCooldown(signupCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [signupCooldown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginCooldown > 0) {
      toast({
        title: "Please wait",
        description: `Please wait ${loginCooldown} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    setLoginLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("too many requests")) {
          setLoginCooldown(30);
          throw new Error("Too many login attempts. Please wait a moment.");
        }
        throw error;
      }

      toast({
        title: "Login Successful",
        description: "Welcome back to LifeSync!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupCooldown > 0) {
      toast({
        title: "Please wait",
        description: `Please wait ${signupCooldown} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setSignupLoading(true);

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          fullName,
        }),
      });

      const registerResult = await registerResponse.json().catch(() => ({}));

      if (!registerResponse.ok) {
        const message = registerResult?.message || "Registration failed.";

        if (
          registerResponse.status === 429 ||
          message.toLowerCase().includes("rate limit") ||
          message.toLowerCase().includes("too many requests")
        ) {
          setSignupCooldown(30);
          throw new Error("Too many signup attempts. Please wait a moment.");
        }

        throw new Error(message);
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });

      if (signInError) {
        throw signInError;
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
      setSignupLoading(false);
    }
  };

  const readableInputClass = "bg-white/50 border-slate-200 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-500";

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-slate-50 to-indigo-50">
      {/* Decorative Pastel Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/20 rounded-full blur-[120px] -z-1" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-[120px] -z-1" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-200/10 rounded-full blur-[100px] -z-1" />

      {/* Two Column Layout Container */}
      <div className="z-10 mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row">
        
        {/* Left Column: Branding (Hidden on mobile) */}
        <div className="relative hidden flex-1 flex-col justify-center p-12 xl:p-16 lg:flex">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text md:text-5xl">LifeSync</h1>
            </div>
            <h2 className="mb-8 text-5xl font-bold leading-[1.1] text-slate-800">
              Unlock Your <span className="text-6xl text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text">Full Potential</span> With AI Wellness.
            </h2>
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
              Join thousands of others in harmonizing their habits, tracking their mood, and growing every single day with the world's most intelligent wellness companion.
            </p>
            
            {/* Visual Element */}
            <div className="mt-16 relative">
               <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full" />
               <div className="relative p-8 rounded-[3rem] bg-white/40 border border-white/20 backdrop-blur-md shadow-2xl flex gap-6 items-center max-w-md">
                 <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BrainCircuit className="h-8 w-8" />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 text-lg">AI-Powered Insights</h4>
                    <p className="text-slate-600 font-medium">Personalized for your unique biological clock.</p>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Login Form */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Back to Home & Quote */}
            <div className="mb-6 w-full sm:mb-10">
              <Link href="/">
                <a className="inline-flex items-center px-5 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white transition text-sm font-medium text-slate-700 hover:text-indigo-600 mb-6">
                  ← Back to Home
                </a>
              </Link>
              
              <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-4 text-center text-base font-medium italic text-slate-700 shadow-sm backdrop-blur-md sm:p-6 sm:text-lg">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-full" />
                "Small daily habits create the biggest life changes."
              </div>
            </div>

            {/* Login Card */}
            <Card className="overflow-hidden rounded-3xl border-none bg-white/70 shadow-2xl ring-1 ring-white/50 backdrop-blur-xl">
              <CardHeader className="pb-4 px-5 pt-5 sm:px-6 sm:pt-6">
                <div className="lg:hidden flex items-center gap-2 mb-4">
                   <Sparkles className="h-6 w-6 text-indigo-600" />
                   <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">LifeSync</span>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 sm:text-base">
                  {mode === "login"
                    ? "Sign in to continue your wellness journey."
                    : "Register and start your wellness journey instantly."}
                </CardDescription>
                <div className="grid grid-cols-2 gap-2 mt-2 bg-white/60 p-1 rounded-xl border border-white/70">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`h-10 rounded-lg text-sm font-bold transition ${mode === "login" ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-white/80"}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`h-10 rounded-lg text-sm font-bold transition ${mode === "signup" ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-white/80"}`}
                  >
                    Sign Up
                  </button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                {mode === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-slate-700 font-bold ml-1">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
                        className={readableInputClass}
                        data-testid="input-email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label htmlFor="login-password" className="text-slate-700 font-bold">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          {showLoginPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
                        className={readableInputClass}
                        data-testid="input-password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loginLoading || loginCooldown > 0}
                      className="mt-2 h-12 w-full rounded-2xl bg-indigo-600 text-base font-black text-white shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] hover:bg-indigo-700 active:scale-[0.98] sm:h-14 sm:text-lg group"
                      data-testid="button-login"
                    >
                      {loginLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : loginCooldown > 0 ? `Wait ${loginCooldown}s` : (
                        <span className="flex items-center gap-2">
                          Sign In <Zap className="h-5 w-5 fill-white" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-slate-700 font-bold ml-1">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={fullName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                        className={readableInputClass}
                        data-testid="input-register-name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-700 font-bold ml-1">Email Address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupEmail(e.target.value)}
                        className={readableInputClass}
                        data-testid="input-register-email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label htmlFor="signup-password" className="text-slate-700 font-bold">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((prev) => !prev)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          {showSignupPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignupPassword(e.target.value)}
                        className={readableInputClass}
                        data-testid="input-register-password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={signupLoading || signupCooldown > 0}
                      className="mt-2 h-12 w-full rounded-2xl bg-indigo-600 text-base font-black text-white shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] hover:bg-indigo-700 active:scale-[0.98] sm:h-14 sm:text-lg"
                      data-testid="button-register"
                    >
                      {signupLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : signupCooldown > 0 ? `Wait ${signupCooldown}s` : (
                        <span className="flex items-center gap-2">
                          Create Account <ArrowRight className="h-5 w-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="justify-center px-5 pb-5 text-center text-sm font-medium text-slate-600 sm:px-6 sm:pb-6">
                {mode === "login" ? (
                  <>
                    New to LifeSync?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="ml-1 text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="ml-1 text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </CardFooter>
            </Card>

            {/* Feature Highlights */}
            <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:mt-8 sm:gap-4">
               {[
                 { icon: CheckCircle2, text: "Track habits easily", color: "text-green-500" },
                 { icon: Heart, text: "Monitor mood and wellness", color: "text-pink-500" },
                 { icon: Sparkles, text: "Get AI-powered insights", color: "text-indigo-500" }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/30 p-3 backdrop-blur-sm">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="text-slate-700 font-bold text-sm tracking-tight">{item.text}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
