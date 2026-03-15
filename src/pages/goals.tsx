import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trophy, Mountain, Sparkles, CheckCircle2, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, deleteWellnessRecordsByField, fetchWellnessRecords } from "@/lib/wellness-api";

type GoalRecord = { title: string; type: string; targetDate: string; progress: number; completed: boolean; createdAt: string };

interface Goal {
  id: string;
  title: string;
  type: "short" | "long";
  targetDate: string;
  progress: number;
  completed: boolean;
}

export default function GoalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState("");
  const [goalType, setGoalType] = useState<"short" | "long">("short");
  const [targetDate, setTargetDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchWellnessRecords<GoalRecord>("goals", user.id)
      .then(records => {
        // Group by title, keep latest state per goal title
        const map = new Map<string, GoalRecord & { id?: string }>();
        [...records].reverse().forEach(r => {
          if (!map.has(r.title)) map.set(r.title, r);
        });
        const loaded: Goal[] = Array.from(map.values()).map(r => ({
          id: String((r as Record<string, unknown>).id ?? r.title),
          title: r.title ?? "",
          type: (r.type as Goal["type"]) ?? "short",
          targetDate: r.targetDate ?? "",
          progress: r.progress ?? 0,
          completed: r.completed ?? false,
        }));
        setGoals(loaded);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const addGoal = () => {
    if (!newGoal.trim() || !targetDate) {
      toast({ title: "Incomplete details", description: "Title and target date are required.", variant: "destructive" });
      return;
    }

    setIsAdding(true);
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.trim(),
      type: goalType,
      targetDate,
      progress: 0,
      completed: false
    };
    setGoals([goal, ...goals]);

    if (user?.id) {
      void createWellnessRecord("goals", {
        userId: user.id,
        title: goal.title,
        type: goal.type,
        targetDate: goal.targetDate,
        progress: goal.progress,
        completed: goal.completed,
      }).catch(() => undefined);
    }

    setNewGoal("");
    setTargetDate("");
    setIsAdding(false);
    toast({
      title: "Goal Created 🏔️",
      description: `Your journey towards "${goal.title}" begins today.`,
    });
  };

  const deleteGoal = (id: string) => {
    const toDelete = goals.find(g => g.id === id);
    setGoals(goals.filter(g => g.id !== id));

    if (user?.id && toDelete?.title) {
      void deleteWellnessRecordsByField("goals", user.id, "title", toDelete.title).catch(() => undefined);
    }

    toast({ title: "Goal Removed", description: "The mountain hasn't changed, only your path." });
  };

  const updateProgress = (id: string, delta: number) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const newProgress = Math.min(100, Math.max(0, g.progress + delta));
        const isNowCompleted = newProgress === 100;
        const nextGoal = { ...g, progress: newProgress, completed: isNowCompleted };

        if (user?.id) {
          void createWellnessRecord("goals", {
            userId: user.id,
            title: nextGoal.title,
            type: nextGoal.type,
            targetDate: nextGoal.targetDate,
            progress: nextGoal.progress,
            completed: nextGoal.completed,
          }).catch(() => undefined);
        }

        if (isNowCompleted && !g.completed) {
           toast({ title: "Achievement Unlocked! 🏆", description: `You reached your goal: "${g.title}"` });
        }
        return nextGoal;
      }
      return g;
    }));
  };

  const completedGoals = goals.filter(g => g.completed);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
            <Mountain className="h-8 w-8 text-indigo-600" />
            Goals Dashboard
          </h1>
          <p className="text-muted-foreground">Architect your future through deliberate synchronization.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-900 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{completedGoals.length} Completed</span>
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md overflow-hidden bg-white/50 dark:bg-gray-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" /> Active
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black">{goals.filter(g => !g.completed).length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md overflow-hidden bg-white/50 dark:bg-gray-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" /> Progress Avg
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black">
                {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}%
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden bg-indigo-600 text-white">
           <CardHeader className="pb-2 text-indigo-100">
              <CardDescription className="text-indigo-100">Sync Tier</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-black flex items-center gap-2 uppercase tracking-widest">
                 Visionary <Sparkles className="h-5 w-5 text-cyan-300" />
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card className="border shadow-lg">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle>Map New Objective</CardTitle>
              <CardDescription>Define a clear target for the next season.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex p-1 bg-muted rounded-xl gap-1">
                {(["short", "long"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={goalType === type ? "default" : "ghost"}
                    className={`flex-1 rounded-lg capitalize ${goalType === type ? 'bg-indigo-600 shadow-md' : ''}`}
                    onClick={() => setGoalType(type)}
                  >
                    {type}-term
                  </Button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Goal Vision</Label>
                  <Input
                    id="goal"
                    placeholder="e.g., Summit Mount Everest"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="h-12 border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Horizon</Label>
                  <Input
                    id="date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="h-12 border-muted-foreground/20"
                  />
                </div>
              </div>

              <Button onClick={addGoal} disabled={isAdding} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 dark:shadow-none font-bold">
                {isAdding ? "Manifesting..." : "Initialize Goal"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
             <h2 className="text-xl font-black px-1 flex items-center justify-between">
                Active Pursuits
                <Badge variant="outline" className="text-[10px]">{goals.length} total</Badge>
             </h2>
             
             <AnimatePresence mode="popLayout">
               {goals.length === 0 ? (
                 <EmptyState 
                    icon={Target}
                    title="No vision mapped"
                    description="Setting goals is the first step in turning the invisible into the visible. Map your first objective."
                 />
               ) : (
                 <div className="space-y-4">
                   {goals.map((goal) => (
                     <motion.div
                       key={goal.id}
                       layout
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className={`p-6 rounded-2xl border transition-all hover:shadow-lg relative overflow-hidden group ${
                         goal.completed ? "bg-emerald-50/20 border-emerald-100" : "bg-card border-border"
                       }`}
                     >
                       <div className="flex items-start justify-between mb-6 relative z-10">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <h3 className={`font-black text-xl tracking-tight ${goal.completed ? 'text-emerald-900/40 line-through' : 'text-foreground'}`}>
                                {goal.title}
                              </h3>
                              {goal.completed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                           </div>
                           <p className="text-xs text-muted-foreground flex items-center gap-2">
                             <Calendar className="h-3 w-3" /> Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                           </p>
                         </div>
                         <div className="flex items-center gap-2">
                            <Badge variant={goal.type === "short" ? "secondary" : "default"} className="uppercase text-[10px] tracking-widest font-black">
                              {goal.type}
                            </Badge>
                            <Button 
                               variant="ghost" 
                               size="icon" 
                               onClick={() => deleteGoal(goal.id)}
                               className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full h-8 w-8"
                            >
                               <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                       </div>

                       <div className="space-y-3 relative z-10">
                         <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Synchronization</span>
                            <span className="text-lg font-black">{goal.progress}%</span>
                         </div>
                         <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }} 
                               animate={{ width: `${goal.progress}%` }} 
                               className={`h-full ${goal.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                            />
                         </div>
                         {!goal.completed && (
                           <div className="flex gap-2 justify-end pt-2">
                              <Button variant="outline" size="sm" onClick={() => updateProgress(goal.id, -10)}>-10%</Button>
                              <Button variant="outline" size="sm" onClick={() => updateProgress(goal.id, 10)}>+10%</Button>
                              <Button size="sm" onClick={() => updateProgress(goal.id, 100)} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none font-bold">Mark Complete</Button>
                           </div>
                         )}
                       </div>
                     </motion.div>
                   ))}
                 </div>
               )}
             </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-950/20 dark:to-orange-950/20 border-none shadow-xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="h-32 w-32" />
             </div>
             <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">Sync Hall of Fame</h3>
             <p className="text-sm text-orange-800/80 dark:text-orange-200/80 mb-6">
                You've completed {completedGoals.length} major objectives recently. Every win fuels the fire of discipline.
             </p>
             <div className="flex flex-wrap gap-2">
                {[...Array(Math.min(5, completedGoals.length))].map((_, i) => (
                   <div key={i} className="h-10 w-10 rounded-full bg-white/50 flex items-center justify-center text-xl shadow-inner">
                      🏆
                   </div>
                ))}
             </div>
          </Card>
          
          <Card className="p-8 border-none bg-muted/20 flex flex-col items-center justify-center text-center">
             <Mountain className="h-12 w-12 text-indigo-400/30 mb-4" />
             <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">The Long Road</h4>
             <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                Active long-term goals require daily habits to maintain synchronization.
             </p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
