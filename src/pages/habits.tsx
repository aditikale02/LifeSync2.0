import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Flame, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  completedToday: boolean;
  successRate: number;
}

export default function HabitsPage() {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => {
      setHabits([
        { id: "1", name: "Read 10 pages", emoji: "📚", streak: 7, completedToday: true, successRate: 85 },
        { id: "2", name: "Stretch", emoji: "🧘", streak: 5, completedToday: false, successRate: 78 },
        { id: "3", name: "Drink water", emoji: "💧", streak: 12, completedToday: true, successRate: 95 },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isCompleting = !habit.completedToday;
        if (isCompleting) {
          toast({
            title: "Habit Completed! 🎉",
            description: `Great job on "${habit.name}"! +1 streak day.`,
          });
        }
        return { ...habit, completedToday: isCompleting, streak: isCompleting ? habit.streak + 1 : habit.streak - 1 };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabit.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a habit name.",
        variant: "destructive"
      });
      return;
    }
    
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit,
      emoji: "⭐",
      streak: 0,
      completedToday: false,
      successRate: 0
    };
    
    setHabits([...habits, habit]);
    setNewHabit("");
    toast({
      title: "Habit Added",
      description: `"${newHabit}" has been added to your routines.`,
    });
  };

  const deleteHabit = (id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    setHabits(habits.filter(h => h.id !== id));
    toast({
      title: "Habit Removed",
      description: `"${habitToDelete?.name}" was deleted.`,
    });
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalSuccessRate = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.successRate, 0) / habits.length) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-48 w-full" />
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
            <CheckCircle2 className="h-8 w-8 text-indigo-500" />
            Habits Dashboard
          </h1>
          <p className="text-muted-foreground">Build positive habits and maintain consistency for a synchronized life.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-900 flex items-center gap-2">
           <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
           <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Sync Score: {totalSuccessRate}%</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-elevate transition-all border-none shadow-md bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCount}/{habits.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Completion today</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-none shadow-md bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-orange-600">
              <Flame className="h-4 w-4" />
              Top Streak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-none shadow-md bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              Success
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSuccessRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Accuracy last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm overflow-hidden bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg">Add New Habit</CardTitle>
          <CardDescription>What routine would you like to build today?</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="e.g., Read for 30 minutes, 5km Run, Drink 2L water..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                className="pr-10 h-12 border-indigo-100 focus:border-indigo-300"
              />
              <Plus className="absolute right-3 top-3.5 h-5 w-5 text-indigo-300" />
            </div>
            <Button onClick={addHabit} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
              Create Habit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Your Routines
          <Badge variant="outline" className="font-normal">{habits.length}</Badge>
        </h2>
        
        <AnimatePresence mode="popLayout">
          {habits.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center bg-muted/20 rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                 <Plus className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No habits yet</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">Every great journey starts with a small routine. Add your first habit above to begin tracking.</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-3">
              {habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center gap-4 p-5 rounded-xl border transition-all hover:shadow-md ${habit.completedToday ? 'bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900' : 'bg-card'}`}
                >
                  <Checkbox
                    checked={habit.completedToday}
                    onCheckedChange={() => toggleHabit(habit.id)}
                    className="h-6 w-6 rounded-md data-[state=checked]:bg-indigo-600 border-2"
                  />
                  <span className="text-3xl filter saturate-[0.8]">{habit.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${habit.completedToday ? 'text-indigo-900/40 dark:text-indigo-100/30 line-through' : 'text-foreground'}`}>
                      {habit.name}
                    </p>
                    <div className="flex gap-2 mt-1.5">
                      <Badge variant={habit.completedToday ? "default" : "secondary"} className={`flex items-center gap-1.5 py-1 ${habit.completedToday ? 'bg-indigo-600' : ''}`}>
                        <Flame className={`h-3.5 w-3.5 ${habit.streak > 5 ? 'text-orange-400 animate-pulse' : ''}`} />
                        {habit.streak} day streak
                      </Badge>
                      <Badge variant="outline" className="py-1 border-muted-foreground/20">{habit.successRate}% Success</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteHabit(habit.id)}
                    className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {habits.some(h => h.streak >= 7) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-600 rounded-2xl p-6 text-white text-center shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
            <Sparkles className="h-24 w-24" />
          </div>
          <p className="text-lg font-bold mb-1 italic">🎉 Milestone Achieved!</p>
          <p className="opacity-90">One of your streaks reached 7 days. You're building powerful life-sync habits 🌱</p>
        </motion.div>
      )}
    </motion.div>
  );
}
