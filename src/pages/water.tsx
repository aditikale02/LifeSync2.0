import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet, Plus, Minus, Info, Sparkles, Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, fetchWellnessRecords } from "@/lib/wellness-api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const milestoneThresholds = [
  { label: "Wake-up Boost", time: "8:00 AM", threshold: 1 },
  { label: "Deep Work Focus", time: "11:00 AM", threshold: 3 },
  { label: "Lunch Companion", time: "1:30 PM", threshold: 4 },
  { label: "Afternoon Sync", time: "4:00 PM", threshold: 6 },
  { label: "Evening Restore", time: "7:00 PM", threshold: 8 },
];

const DEFAULT_GOAL = 8;
const MIN_GOAL = 1;
const MAX_GOAL = 20;
const MAX_GLASSES_PER_DAY = 20;

type WaterLogRecord = {
   id?: string;
   glasses: number;
   goal?: number;
   createdAt: string;
};

function toDayKey(dateLike: string | Date) {
   return new Date(dateLike).toISOString().slice(0, 10);
}

function buildWeeklyTrend(records: WaterLogRecord[]) {
   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
   const now = new Date();

   return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - i));
      const key = toDayKey(day);
      const dayRecords = records.filter((record) => toDayKey(record.createdAt) === key);
      const latest = dayRecords.length
         ? dayRecords.reduce((latestRecord, current) =>
               new Date(current.createdAt) > new Date(latestRecord.createdAt) ? current : latestRecord,
            )
         : undefined;

      return {
         day: dayNames[day.getDay()],
         glasses: latest?.glasses ?? 0,
      };
   });
}

export default function WaterPage() {
  const { toast } = useToast();
   const { user } = useAuth();
  const [glasses, setGlasses] = useState(0);
   const [goal, setGoal] = useState(DEFAULT_GOAL);
   const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL));
   const [manualGlassesInput, setManualGlassesInput] = useState("0");
   const [weeklyTrend, setWeeklyTrend] = useState<Array<{ day: string; glasses: number }>>([]);
   const [todayLogs, setTodayLogs] = useState(0);
  const [loading, setLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
  const percentage = Math.min((glasses / goal) * 100, 100);

   const hydrationState = useMemo(() => {
      if (percentage < 50) return { label: "Needs Water", className: "bg-red-100 text-red-700" };
      if (percentage < 80) return { label: "Good", className: "bg-amber-100 text-amber-700" };
      return { label: "Hydrated", className: "bg-green-100 text-green-700" };
   }, [percentage]);

   const loadWaterData = async (userId: string) => {
      const records = await fetchWellnessRecords<WaterLogRecord>("water_logs", userId);
      const todayKey = toDayKey(new Date());
      const todayRecords = records.filter((record) => toDayKey(record.createdAt) === todayKey);
      const latestOverall = records[0];
      const latestToday = todayRecords.length ? todayRecords[0] : undefined;

      setGlasses(latestToday?.glasses ?? 0);
      const resolvedGoal = latestToday?.goal ?? latestOverall?.goal ?? DEFAULT_GOAL;
      const safeGoal = Math.max(MIN_GOAL, Math.min(MAX_GOAL, Number(resolvedGoal) || DEFAULT_GOAL));
      setGoal(safeGoal);
      setGoalInput(String(safeGoal));
      setManualGlassesInput(String(latestToday?.glasses ?? 0));
      setTodayLogs(todayRecords.length);
      setWeeklyTrend(buildWeeklyTrend(records));
   };

  useEffect(() => {
      if (!user?.id) {
         setLoading(false);
         return;
      }

      void loadWaterData(user.id)
         .catch(() => {
            toast({
               title: "Could not load water logs",
               description: "Showing default values. Try refreshing.",
               variant: "destructive",
            });
         })
         .finally(() => setLoading(false));
  }, [user?.id]);

   const persistWater = async (nextGlasses: number, nextGoal: number) => {
      if (!user?.id) return;

      setIsSaving(true);
      try {
         await createWellnessRecord("water_logs", {
            userId: user.id,
            glasses: nextGlasses,
            goal: nextGoal,
         });

         await loadWaterData(user.id);
         window.dispatchEvent(new CustomEvent("wellness:data-updated", { detail: { table: "water_logs" } }));
      } finally {
         setIsSaving(false);
      }
   };

   const changeWater = (delta: number) => {
      const next = Math.max(0, Math.min(MAX_GLASSES_PER_DAY, glasses + delta));

      if (next === glasses) {
         toast({
            title: delta > 0 ? "Daily cap reached" : "Already at zero",
            description:
               delta > 0
                  ? `Max ${MAX_GLASSES_PER_DAY} glasses/day to keep logs realistic.`
                  : "You can't go below 0 glasses.",
         });
         return;
      }

      if (next > glasses) {
         toast({ title: "Hydration Up! 💧", description: "Every glass counts towards a sharper mind." });
      }

      setGlasses(next);
      setManualGlassesInput(String(next));

      void persistWater(next, goal).catch(() => {
         toast({
            title: "Could not update water log",
            description: "Please try again.",
            variant: "destructive",
         });
      });
   };

   const saveGoal = () => {
      const parsed = Number(goalInput);
      if (!Number.isFinite(parsed)) {
         toast({ title: "Invalid goal", description: "Enter a valid number.", variant: "destructive" });
         setGoalInput(String(goal));
         return;
      }

      const nextGoal = Math.max(MIN_GOAL, Math.min(MAX_GOAL, Math.round(parsed)));
      setGoal(nextGoal);
      setGoalInput(String(nextGoal));

      void persistWater(glasses, nextGoal)
         .then(() => {
            toast({ title: "Goal updated", description: `Daily hydration target set to ${nextGoal} glasses.` });
         })
         .catch(() => {
            toast({
               title: "Could not update goal",
               description: "Please try again.",
               variant: "destructive",
            });
         });
   };

   const saveManualGlasses = () => {
      const parsed = Number(manualGlassesInput);
      if (!Number.isFinite(parsed)) {
         toast({ title: "Invalid value", description: "Enter a valid number.", variant: "destructive" });
         setManualGlassesInput(String(glasses));
         return;
      }

      const next = Math.max(0, Math.min(MAX_GLASSES_PER_DAY, Math.round(parsed)));
      setGlasses(next);
      setManualGlassesInput(String(next));

      void persistWater(next, goal)
         .then(() => {
            toast({ title: "Water log updated", description: `Today's intake set to ${next} glasses.` });
         })
         .catch(() => {
            toast({
               title: "Could not save update",
               description: "Please try again.",
               variant: "destructive",
            });
         });
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <Skeleton className="h-12 w-48 mx-auto" />
      <Card className="p-6 sm:p-12"><Skeleton className="h-64 w-full" /></Card>
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
            <h1 className="mb-2 flex items-center justify-center gap-3 text-3xl font-black sm:text-4xl">
               <Droplet className="h-8 w-8 fill-blue-500/20 text-blue-500 sm:h-10 sm:w-10" />
          Water Tracker
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">Maintain your fluid balance to keep your energy levels synchronized.</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
               <Badge className={hydrationState.className}>{hydrationState.label}</Badge>
               <Badge variant="outline">{Math.round(percentage)}%</Badge>
               <Badge variant="outline">{todayLogs} log{todayLogs !== 1 ? "s" : ""} today</Badge>
            </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
      <Card className="group relative overflow-hidden border-none bg-white/50 shadow-2xl backdrop-blur-xl dark:bg-gray-950/50">
           <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 dark:bg-blue-900" />
           <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black tracking-tight uppercase">Daily Hydration Target</CardTitle>
              <CardDescription>Target: {goal} glasses (approx. 2.0 Liters)</CardDescription>
           </CardHeader>
          <CardContent className="flex flex-col items-center space-y-8 py-6 sm:space-y-12 sm:py-8">
              <div className="relative">
             <div className="relative aspect-square w-full max-w-[16rem] rounded-full border-8 border-muted/20 p-4 flex items-center justify-center sm:max-w-[16rem]">
                   <div 
                      className="absolute bottom-0 left-0 w-full bg-blue-500/10 dark:bg-blue-500/20 transition-all duration-1000 ease-in-out" 
                      style={{ height: `${percentage}%`, borderRadius: '0 0 120px 120px' }}
                   />
                   <div className="relative text-center z-10">
                      <motion.div 
                        key={glasses}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                                    className="text-6xl font-black text-blue-600 dark:text-blue-400 sm:text-7xl"
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

                     <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-8">
                 <Button 
                   variant="outline" 
                   size="icon" 
                            className="h-14 w-14 rounded-2xl border-2 transition-all hover:bg-blue-50 hover:text-blue-600 sm:h-16 sm:w-16"
                   onClick={() => changeWater(-1)}
                            disabled={isSaving}
                 >
                    <Minus className="h-6 w-6" />
                 </Button>
                 <Button 
                   size="lg" 
                            className="h-14 w-full rounded-2xl bg-blue-600 px-6 text-base font-bold text-white shadow-xl shadow-blue-200 transition-transform active:scale-95 hover:bg-blue-700 sm:h-16 sm:w-auto sm:px-10 sm:text-lg dark:shadow-none"
                   onClick={() => changeWater(1)}
                            disabled={isSaving}
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
                 {milestoneThresholds.map((m) => (
                   <div key={m.label} className="flex items-center justify-between border-b border-muted/40 pb-3 last:border-0 last:pb-0">
                      <div>
                         <p className="text-sm font-bold">{m.label}</p>
                         <p className="text-[10px] text-muted-foreground">{m.time}</p>
                      </div>
                      <Badge variant={glasses >= m.threshold ? "default" : "outline"} className={glasses >= m.threshold ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                         {glasses >= m.threshold ? "Done" : "Pending"}
                      </Badge>
                   </div>
                 ))}
              </CardContent>
           </Card>

                <Card className="border-none shadow-md">
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">Adjust & Configure</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="space-y-2">
                         <Label htmlFor="water-goal" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daily Goal (1–20)</Label>
                         <div className="flex gap-2">
                            <Input
                               id="water-goal"
                               type="number"
                               min={MIN_GOAL}
                               max={MAX_GOAL}
                               value={goalInput}
                               onChange={(e) => setGoalInput(e.target.value)}
                            />
                            <Button variant="outline" onClick={saveGoal} disabled={isSaving}>Save</Button>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <Label htmlFor="water-manual" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Set Today's Glasses (0–20)</Label>
                         <div className="flex gap-2">
                            <Input
                               id="water-manual"
                               type="number"
                               min={0}
                               max={MAX_GLASSES_PER_DAY}
                               value={manualGlassesInput}
                               onChange={(e) => setManualGlassesInput(e.target.value)}
                            />
                            <Button variant="outline" onClick={saveManualGlasses} disabled={isSaving}>Update</Button>
                         </div>
                      </div>
                   </CardContent>
                </Card>
        </div>
      </div>

         <Card className="border-none shadow-md">
            <CardHeader>
               <CardTitle className="text-lg">Weekly Hydration Trend</CardTitle>
               <CardDescription>Latest daily intake for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[0, MAX_GLASSES_PER_DAY]} />
                        <Tooltip
                           contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                           formatter={(value: number) => [`${value} glasses`, "Hydration"]}
                        />
                        <Bar dataKey="glasses" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>
    </motion.div>
  );
}
