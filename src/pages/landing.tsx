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
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/10 backdrop-blur-lg">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-pink-500 sm:h-8 sm:w-8" />
              <span className="text-xl font-black tracking-tighter sm:text-2xl">LifeSync</span>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="h-10 rounded-full border-white/30 bg-white/5 px-4 text-sm font-bold text-white backdrop-blur-md hover:bg-white/10 sm:h-11 sm:px-6 sm:text-base">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative px-4 pb-20 pt-32 text-center sm:px-6 sm:pb-24 sm:pt-40 lg:pt-48">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-cyan-300 backdrop-blur-md sm:mb-8 sm:px-4 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                v2.0 AI Wellness Engine now live
              </div>
              <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight drop-shadow-xl sm:text-5xl md:mb-8 md:text-7xl">
                Sync Your Life, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                  Grow Every Day.
                </span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg font-bold leading-relaxed text-white drop-shadow-lg sm:text-xl md:mb-12 md:text-2xl">
                Start your journey to a better you.
              </p>
              <div className="flex items-center justify-center">
                <Button asChild size="lg" className="group h-12 rounded-full bg-pink-600 px-7 text-base font-bold text-white shadow-xl shadow-pink-500/30 hover:bg-pink-700 sm:h-14 sm:px-10 sm:text-lg">
                  <Link href="/login">
                    Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-t border-white/10 bg-black/20 px-4 py-16 backdrop-blur-md sm:px-6 sm:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
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
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/10 sm:p-10"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 sm:mb-6 sm:h-14 sm:w-14 ${feature.color}`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Quote */}
        <section className="px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 flex justify-center text-pink-500/80 sm:mb-8">
                <ShieldCheck className="h-14 w-14 sm:h-16 sm:w-16" />
              </div>
              <h2 className="mb-8 text-2xl font-bold italic leading-tight text-white/90 sm:text-3xl md:mb-10 md:text-4xl">
                "LifeSync transformed my lifestyle through awareness and AI-driven precision."
              </h2>
              <div className="flex items-center justify-center gap-3 text-white/50 font-bold uppercase tracking-widest text-xs">
                <CheckCircle2 className="h-4 w-4 text-cyan-500" /> Verified Self-Improvement Platform
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 space-y-1 border-t border-white/10 bg-black/20 px-4 py-8 text-center text-xs text-white/40 backdrop-blur-md sm:px-6 sm:text-sm">
          <p>© 2026 LifeSync &bull; Built by <span className="font-medium text-white/60">Aditi Kale</span></p>
          <p>Developed under <span className="text-white/60">UHV (Universal Human Values) Program</span> &bull; Guided by <span className="text-white/60">Prof. Manjusha Devkule</span></p>
        </footer>
      </div>
    </div>
  );
}
