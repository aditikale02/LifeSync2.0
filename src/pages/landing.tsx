import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Sparkles, BrainCircuit, Heart, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading || user) {
    return null;
  }

  return (
    <div className="relative min-h-screen text-white selection:bg-pink-500/30 overflow-x-hidden bg-black">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070')",
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 w-full">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-black tracking-tighter">LifeSync</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-white text-black hover:bg-white/90 font-bold rounded-full px-6 shadow-lg shadow-white/10">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-48 pb-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                v2.0 AI Wellness Engine now live
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight drop-shadow-xl">
                Sync Your Life, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                  Grow Every Day.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 font-medium drop-shadow-lg leading-relaxed">
                Connect your habits, mood, and activity in one beautiful workspace. Gain clarity and achieve your peak wellness with AI insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button asChild size="lg" className="h-14 px-10 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg group shadow-xl shadow-pink-500/30">
                  <Link href="/login">
                    Sign In to Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 font-bold text-lg text-white">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BrainCircuit,
                  title: "AI Insights",
                  desc: "Personalized weekly recommendations based on your unique biometric and activity data.",
                  color: "text-cyan-400",
                },
                {
                  icon: Heart,
                  title: "Holistic Health",
                  desc: "Track hydration, sleep, mood, and gratitude in one unified system.",
                  color: "text-pink-400",
                },
                {
                  icon: Zap,
                  title: "Micro-Habits",
                  desc: "Build powerful routines with automated streak tracking and smart reminders.",
                  color: "text-yellow-400",
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-xl"
                >
                  <div className={`h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${feature.color}`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Quote */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-8 text-pink-500/80">
                <ShieldCheck className="h-16 w-16" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold italic mb-10 leading-tight text-white/90">
                "LifeSync transformed my lifestyle through awareness and AI-driven precision."
              </h2>
              <div className="flex items-center justify-center gap-3 text-white/50 font-bold uppercase tracking-widest text-xs">
                <CheckCircle2 className="h-4 w-4 text-cyan-500" /> Verified Self-Improvement Platform
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 py-8 px-6 border-t border-white/10 text-center text-sm text-white/40 space-y-1 bg-black/20 backdrop-blur-md">
          <p>© 2026 LifeSync &bull; Built by <span className="font-medium text-white/60">Aditi Kale</span></p>
          <p>Developed under <span className="text-white/60">UHV (Universal Human Values) Program</span> &bull; Guided by <span className="text-white/60">Prof. Manjusha Devkule</span></p>
        </footer>
      </div>
    </div>
  );
}
