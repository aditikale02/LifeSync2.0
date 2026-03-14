import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity as ActivityIcon, Plus, Award, Flame, Zap, TrendingUp, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const weeklyActivity = [
  { day: "Mon", minutes: 30 },
  { day: "Tue", minutes: 45 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 60 },
  { day: "Fri", minutes: 30 },
  { day: "Sat", minutes: 90 },
  { day: "Sun", minutes: 45 },
];

const activityTypes = [
  { name: "Running", emoji: "🏃", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-100" },
  { name: "Yoga", emoji: "🧘", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-100" },
  { name: "Walking", emoji: "🚶", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-100" },
  { name: "Sports", emoji: "⚽", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-100" },
  { name: "Gym", emoji: "🏋️", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-100" },
];

interface ActivityLog {
  id: string;
  type: string;
  duration: number;
  intensity: string;
  loggedAt: Date;
}

export default function ActivityPage() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities([
        { id: "1", type: "Running", duration: 30, intensity: "Moderate", loggedAt: new Date() },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const addActivity = () => {
    if (!selectedActivity || !duration) {
      toast({
        title: "Incomplete details",
        description: "Please select an activity and enter duration.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        type: selectedActivity,
        duration: parseInt(duration),
        intensity: "Moderate",
        loggedAt: new Date()
      };
      setActivities([newLog, ...activities]);
      setDuration("");
      setSelectedActivity("");
      setIsSaving(false);
      toast({
        title: "Activity Logged! 💪",
        description: `You did ${duration} minutes of ${selectedActivity}. Keep it up!`,
      });
    }, 1000);
  };

  const totalMinutes = weeklyActivity.reduce((sum, day) => sum + day.minutes, 0);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ActivityIcon className="h-8 w-8 text-orange-500" />
            Activity Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor your physical movement and strive for peak synchronization.</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-4 py-2 rounded-full border border-orange-100 dark:border-orange-900">
           <Zap className="h-4 w-4 text-orange-500" />
           <span className="text-sm font-bold text-orange-700 dark:text-orange-400">Streak: 5 Days</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-elevate transition-all border-none bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-gray-950 shadow-sm capitalize group">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 group-hover:text-orange-600 transition-colors">
              <ActivityIcon className="h-4 w-4" /> This Week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-orange-600">{totalMinutes}m</div>
            <p className="text-xs text-muted-foreground mt-1">Movement recorded</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-none bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-950 shadow-sm group">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 group-hover:text-red-500 transition-colors">
              <Flame className="h-4 w-4" /> Active Energy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-red-500">{Math.round(totalMinutes * 4.5)}</div>
            <p className="text-xs text-muted-foreground mt-1">Est. Calories burned</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-none bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-gray-950 shadow-sm group">
          <CardHeader className="pb-2" >
            <CardDescription className="flex items-center gap-2 group-hover:text-yellow-600 transition-colors">
              <Award className="h-4 w-4" /> Badges Earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <span title="5-Day Streak" className="text-2xl filter drop-shadow hover:scale-120 transition-transform cursor-pointer">🏅</span>
              <span title="Fitness Champ" className="text-2xl filter drop-shadow hover:scale-120 transition-transform cursor-pointer">💪</span>
              <span title="Early Bird" className="text-2xl filter drop-shadow hover:scale-120 transition-transform cursor-pointer">🌅</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-yellow-600 font-bold">New Badge Available! 🌟</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card className="border shadow-md">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle>Log Physical Movement</CardTitle>
              <CardDescription>Select activity and duration to stay synced</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {activityTypes.map((activity) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={activity.name}
                    onClick={() => setSelectedActivity(activity.name)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedActivity === activity.name
                        ? `border-orange-500 ${activity.bg} ring-2 ring-orange-100`
                        : "border-transparent bg-muted/40 hover:bg-muted"
                    }`}
                  >
                    <div className="text-3xl mb-1 filter drop-shadow-sm">{activity.emoji}</div>
                    <div className="text-xs font-bold uppercase tracking-tighter">{activity.name}</div>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {selectedActivity && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col sm:flex-row gap-4 pt-4 border-t"
                  >
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="duration" className="text-xs font-bold text-muted-foreground uppercase">Duration (mins)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="e.g., 45"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="h-12 border-orange-100 focus:border-orange-300"
                        min="1"
                        max="1440"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addActivity} disabled={isSaving} className="w-full sm:w-auto h-12 bg-orange-600 hover:bg-orange-700 text-white shadow-xl px-8">
                        {isSaving ? "Syncing..." : "Log Activity"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Weekly Intensity Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                       dataKey="day" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#64748b', fontSize: 12}}
                       dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc', radius: 8}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Bar dataKey="minutes" name="Activity (min)" radius={[8, 8, 0, 0]}>
                      {weeklyActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.minutes > 60 ? '#f97316' : '#fdba74'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/30 border-none shadow-inner p-6">
             <div className="flex items-center gap-2 mb-4 text-orange-600">
                <Info className="h-5 w-5" />
                <h3 className="font-bold">Sync Tip</h3>
             </div>
             <p className="text-sm text-balance leading-relaxed">
                Consistency is more effective than intensity. Log even short walks to keep your <strong>Activity Sync Score</strong> high.
             </p>
          </Card>

          <h3 className="font-bold text-lg flex items-center justify-between px-1">
             Recent Logs
             <span className="text-xs font-normal text-muted-foreground">{activities.length} total</span>
          </h3>
          
          <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
               <motion.div className="p-8 text-center bg-muted/20 border-2 border-dashed rounded-xl border-muted">
                  <p className="text-sm text-muted-foreground italic">No movement logged yet.</p>
               </motion.div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-sm hover:border-orange-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-xl">
                          {activityTypes.find(t => t.name === activity.type)?.emoji || "🏅"}
                       </div>
                       <div>
                          <p className="font-bold text-sm">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">{activity.duration} minutes • {activity.intensity}</p>
                       </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                       JUST NOW
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
