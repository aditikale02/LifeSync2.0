import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Plus, Minus, Info, Sparkles, Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function WaterPage() {
  const { toast } = useToast();
  const [glasses, setGlasses] = useState(6);
  const [loading, setLoading] = useState(true);
  const goal = 8;
  const percentage = Math.min((glasses / goal) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const changeWater = (delta: number) => {
    const newValue = Math.max(0, glasses + delta);
    if (newValue > glasses) {
       toast({
         title: "Hydration Up! 💧",
         description: "Every glass counts towards a sharper mind.",
       });
    }
    setGlasses(newValue);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Card className="p-12"><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      <div className="text-center">
        <h1 className="text-4xl font-black mb-2 flex items-center justify-center gap-3">
          <Droplet className="h-10 w-10 text-blue-500 fill-blue-500/20" />
          Water Tracker
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">Maintain your fluid balance to keep your energy levels synchronized.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        <Card className="border-none shadow-2xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl overflow-hidden relative group">
           <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 dark:bg-blue-900" />
           <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black tracking-tight uppercase">Daily Hydration Target</CardTitle>
              <CardDescription>Target: {goal} glasses (approx. 2.0 Liters)</CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col items-center py-8 space-y-12">
              <div className="relative">
                <div className="h-64 w-64 rounded-full border-8 border-muted/20 relative flex items-center justify-center p-4">
                   <div 
                      className="absolute bottom-0 left-0 w-full bg-blue-500/10 dark:bg-blue-500/20 transition-all duration-1000 ease-in-out" 
                      style={{ height: `${percentage}%`, borderRadius: '0 0 120px 120px' }}
                   />
                   <div className="relative text-center z-10">
                      <motion.div 
                        key={glasses}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-7xl font-black text-blue-600 dark:text-blue-400"
                      >
                        {glasses}
                      </motion.div>
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Glasses</div>
                      <div className="mt-2 h-1.5 w-12 bg-blue-200 dark:bg-blue-800 rounded-full mx-auto" />
                   </div>
                   
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                         cx="128"
                         cy="128"
                         r="120"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth="8"
                         className="text-blue-500 transition-all duration-1000 ease-in-out"
                         strokeDasharray={754}
                         strokeDashoffset={754 - (754 * percentage) / 100}
                         strokeLinecap="round"
                      />
                   </svg>
                </div>
                {percentage >= 100 && (
                   <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-950 p-2 rounded-full shadow-lg"
                   >
                      <Sparkles className="h-6 w-6" />
                   </motion.div>
                )}
              </div>

              <div className="flex items-center gap-8">
                 <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-16 w-16 rounded-2xl border-2 hover:bg-blue-50 hover:text-blue-600 transition-all"
                   onClick={() => changeWater(-1)}
                 >
                    <Minus className="h-6 w-6" />
                 </Button>
                 <Button 
                   size="lg" 
                   className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 dark:shadow-none font-bold text-lg transition-transform active:scale-95"
                   onClick={() => changeWater(1)}
                 >
                    <Plus className="h-6 w-6 mr-3" />
                    Drink Glass
                 </Button>
              </div>

              <div className="w-full max-w-sm">
                 <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase mb-2">
                    <span>Progress</span>
                    <span>{Math.round(percentage)}%</span>
                 </div>
                 <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                       className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
                       initial={{ width: 0 }}
                       animate={{ width: `${percentage}%` }}
                       transition={{ duration: 1 }}
                    />
                 </div>
              </div>
           </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="bg-blue-600 text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 p-4 opacity-10">
                 <Waves className="h-24 w-24" />
              </div>
              <CardContent className="p-6">
                 <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" /> Why Hydrate?
                 </h3>
                 <p className="text-sm opacity-90 leading-relaxed italic">
                    "Better hydration improves brain function, increases energy levels, and helps you stay synced with your tasks."
                 </p>
              </CardContent>
           </Card>

           <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">Hydration Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { label: "Wake-up Boost", time: "8:00 AM", status: "Done" },
                   { label: "Deep Work Focus", time: "11:00 AM", status: "Done" },
                   { label: "Lunch Companion", time: "1:30 PM", status: "Done" },
                   { label: "Afternoon Sync", time: "4:00 PM", status: "Done" },
                   { label: "Evening Restore", time: "7:00 PM", status: "Pending" },
                 ].map((m, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-muted/40 pb-3 last:border-0 last:pb-0">
                      <div>
                         <p className="text-sm font-bold">{m.label}</p>
                         <p className="text-[10px] text-muted-foreground">{m.time}</p>
                      </div>
                      <Badge variant={m.status === "Done" ? "default" : "outline"} className={m.status === "Done" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                         {m.status}
                      </Badge>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
