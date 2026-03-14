import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "Registration Successful",
          description: "Welcome to LifeSync!",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Verify your email",
          description: "We've sent a verification link to your email address.",
        });
        setLocation("/login");
      }
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[120px] -z-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] -z-1" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="mb-6">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </a>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Sparkles className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">LifeSync</h1>
          </div>
          <p className="text-slate-600 font-medium">Begin Your Wellness Journey</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-slate-900 text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-slate-500">
              Join LifeSync and start growing every day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  data-testid="input-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  data-testid="input-email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  data-testid="input-password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]" data-testid="button-register">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-indigo-600 hover:text-indigo-700 font-bold" data-testid="link-login">
                  Sign In
                </a>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
