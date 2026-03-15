import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { ProgressRing } from "@/components/progress-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplet, Brain, Heart, Target, TrendingUp, Flame, Sparkles, BrainCircuit, ArrowRight, Activity, Smile, CheckCircle2, LayoutGrid } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || "there";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      <div 
        className="group relative min-h-[320px] overflow-hidden rounded-3xl shadow-2xl sm:min-h-[340px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-10000"
          alt="Peaceful nature"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-start justify-center p-6 text-white sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-4 border-none bg-white/20 px-3 py-1 text-white backdrop-blur-md">
              ✨ Welcome back, {userName}
            </Badge>
            <h1 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Syncing Your Life, <br/><span className="text-cyan-400">One Day at a Time.</span></h1>
            <p className="mb-6 max-w-lg text-base text-white/80 sm:mb-8 sm:text-lg">You're doing great! Your consistency score is up 12% today. Let's keep the momentum going.</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <Button asChild className="border-none bg-cyan-500 text-white shadow-lg hover:bg-cyan-600">
                <Link href="/ai-insights">
                  <BrainCircuit className="h-4 w-4 mr-2" /> Get AI Insights
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                <Link href="/dashboard-hub">
                  <LayoutGrid className="h-4 w-4 mr-2" /> Explore Dashboards
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Hydration", value: "1.5L / 2L", icon: Droplet, sub: "75% of goal", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { title: "Mindfulness", value: "20m", icon: Brain, sub: "Last session: 2h ago", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
          { title: "Wellness Score", value: "88", icon: Heart, sub: "+4 pts since Monday", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
          { title: "Today's Habits", value: "6/10", icon: CheckCircle2, sub: "4 remaining", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</h3>
                <div className="text-2xl font-black mt-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-lg bg-white/50 dark:bg-gray-950/50 backdrop-blur-md">
          <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                   <CardTitle className="text-2xl font-black">Life Sync Command</CardTitle>
                   <CardDescription>Your daily overview across all dimensions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600 font-bold">Details <ArrowRight className="h-4 w-4 ml-1" /></Button>
             </div>
          </CardHeader>
          <CardContent className="grid gap-4 pb-8 sm:grid-cols-2">
             <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 flex flex-col items-center justify-center text-center">
                <ProgressRing progress={68} size={120} strokeWidth={12} />
                <h4 className="font-bold mt-4">Habit Sync</h4>
                <p className="text-xs text-muted-foreground">Almost to your target!</p>
             </div>
             <div className="grid grid-rows-2 gap-4">
                <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-orange-700 dark:text-orange-300" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-orange-800">Activity</p>
                      <p className="text-sm font-black">45m today</p>
                   </div>
                </div>
                <div className="p-5 rounded-2xl bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-100 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-yellow-200 dark:bg-yellow-900 flex items-center justify-center">
                      <Smile className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-yellow-800">Mood</p>
                      <p className="text-sm font-black text-yellow-700">Stable & Positive</p>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Pulse Events
            </CardTitle>
            <CardDescription>Recent updates in your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { text: "Reached 7-day streak in 'Morning Stretch'", time: "12m ago", color: "bg-orange-500" },
              { text: "AI Insights generated for your sleep patterns", time: "1h ago", color: "bg-indigo-500" },
              { text: "Successfully completed 'Drink 2L Water'", time: "3h ago", color: "bg-blue-500" },
              { text: "Logged 'Feeling Enthusiastic' mood", time: "5h ago", color: "bg-yellow-500" },
            ].map((event, i) => (
              <div key={i} className="flex items-start gap-4 group cursor-pointer">
                <div className={`h-2 w-2 rounded-full ${event.color} mt-1.5 shrink-0 group-hover:scale-150 transition-transform`} />
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{event.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4 group">
               View Full Timeline <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-900 p-6 text-white shadow-2xl sm:p-8">
         <div className="absolute right-0 bottom-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles className="h-48 w-48" />
         </div>
         <div className="max-w-xl relative z-10">
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-black sm:text-3xl">
               <BrainCircuit className="h-8 w-8 text-cyan-300" />
               Ready for your Weekly Sync?
            </h2>
            <p className="mb-6 text-base leading-relaxed text-indigo-100 sm:text-lg">
               Our AI has analyzed your activity, mood, and habits over the last 7 days. Unlock personalized wellness recommendations tailored just for you.
            </p>
            <Button size="lg" className="rounded-xl bg-cyan-400 px-6 py-5 font-black text-indigo-950 shadow-xl transition-all hover:-translate-y-1 hover:bg-cyan-300 sm:px-8 sm:py-6" asChild>
               <Link href="/ai-insights">Generate Insights Now</Link>
            </Button>
         </div>
      </Card>
    </motion.div>
  );
}
