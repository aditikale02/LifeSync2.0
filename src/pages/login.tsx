import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowLeft, CheckCircle2, Heart, BrainCircuit, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
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

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("too many requests")) {
          setCooldown(30);
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-slate-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative Pastel Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/20 rounded-full blur-[120px] -z-1" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-[120px] -z-1" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-200/10 rounded-full blur-[100px] -z-1" />

      {/* Two Column Layout Container */}
      <div className="flex w-full max-w-[1400px] mx-auto z-10">
        
        {/* Left Column: Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center p-16 relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">LifeSync</h1>
            </div>
            <h2 className="text-5xl font-bold text-slate-800 leading-[1.1] mb-8">
              Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 text-6xl">Full Potential</span> With AI Wellness.
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
        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Back to Home & Quote */}
            <div className="mb-10 w-full">
              <Link href="/">
                <a className="inline-flex items-center px-5 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white transition text-sm font-medium text-slate-700 hover:text-indigo-600 mb-6">
                  ← Back to Home
                </a>
              </Link>
              
              <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm italic text-slate-700 text-lg font-medium text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-full" />
                "Small daily habits create the biggest life changes."
              </div>
            </div>

            {/* Login Card */}
            <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/50">
              <CardHeader className="pb-4">
                <div className="lg:hidden flex items-center gap-2 mb-4">
                   <Sparkles className="h-6 w-6 text-indigo-600" />
                   <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">LifeSync</span>
                </div>
                <CardTitle className="text-slate-900 text-3xl font-black tracking-tight">Welcome Back</CardTitle>
                <CardDescription className="text-slate-500 font-medium text-base">
                  Sign in to continue your wellness journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="bg-white/50 border-slate-200 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-500"
                      data-testid="input-email"
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
                      className="bg-white/50 border-slate-200 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-500"
                      data-testid="input-password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || cooldown > 0} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg h-14 rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 group" 
                    data-testid="button-login"
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : cooldown > 0 ? `Wait ${cooldown}s` : (
                      <span className="flex items-center gap-2">
                        Sign In <Zap className="h-5 w-5 fill-white" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="justify-center text-sm text-slate-600 font-medium pb-6">
                New to LifeSync?{" "}
                <Link href="/register">
                  <a className="ml-1 text-indigo-600 hover:text-indigo-700 font-bold">Create an account</a>
                </Link>
              </CardFooter>
            </Card>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-1 gap-4 w-full">
               {[
                 { icon: CheckCircle2, text: "Track habits easily", color: "text-green-500" },
                 { icon: Heart, text: "Monitor mood and wellness", color: "text-pink-500" },
                 { icon: Sparkles, text: "Get AI-powered insights", color: "text-indigo-500" }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3 bg-white/30 backdrop-blur-sm border border-white/50 p-3 rounded-2xl">
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
