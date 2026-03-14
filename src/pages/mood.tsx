import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Smile, Frown, Meh, Battery, Moon as MoonIcon, Zap, Wind, Clock, Sparkles, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const moods = [
  { emoji: "🤩", label: "Excited", value: 5, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
  { emoji: "😊", label: "Happy", value: 4, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
  { emoji: "😌", label: "Calm", value: 3.5, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
  { emoji: "😐", label: "Neutral", value: 3, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-950/20" },
  { emoji: "😴", label: "Tired", value: 2.5, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
  { emoji: "😔", label: "Sad", value: 2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
  { emoji: "😡", label: "Angry", value: 1, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
  { emoji: "😪", label: "Sleepy", value: 1.5, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
];

const mockWeeklyData = [
  { day: "Mon", value: 4, label: "Happy" },
  { day: "Tue", value: 3.5, label: "Calm" },
  { day: "Wed", value: 5, label: "Excited" },
  { day: "Thu", value: 2, label: "Sad" },
  { day: "Fri", value: 4, label: "Happy" },
  { day: "Sat", value: 4.5, label: "Happy" },
  { day: "Sun", value: 3.5, label: "Calm" },
];

export default function MoodPage() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveMood = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Mood Logged ✨",
        description: `You logged your mood as "${selectedMood}". Take care!`,
      });
      setSelectedMood("");
      setNote("");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Card className="p-8 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </Card>
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
            <Smile className="h-8 w-8 text-yellow-500" />
            Mood Dashboard
          </h1>
          <p className="text-muted-foreground">Log your emotions and visualize mental health patterns over time.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden bg-card">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle>How are you feeling right now?</CardTitle>
              <CardDescription>Select the emoji that best represents your state</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={mood.label}
                    onClick={() => setSelectedMood(mood.label)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedMood === mood.label
                        ? `border-indigo-500 ${mood.bg} ring-2 ring-indigo-500/20`
                        : "border-muted bg-background hover:border-indigo-200"
                    }`}
                  >
                    <span className="text-4xl filter drop-shadow-sm">{mood.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{mood.label}</span>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {selectedMood && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-8"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="note" className="text-sm font-medium">Add a note (context helps with patterns)</Label>
                      <Textarea
                        id="note"
                        placeholder="What's causing this feeling? (Optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[100px] border-indigo-100 focus:border-indigo-500 bg-muted/5"
                      />
                    </div>
                    <Button 
                      onClick={handleSaveMood} 
                      disabled={isSaving}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                    >
                      {isSaving ? "Saving..." : <><Clock className="h-4 w-4 mr-2" /> Log Emotional State</>}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Weekly Resonance
              </CardTitle>
              <CardDescription>Your emotional fluctuations through the week</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockWeeklyData}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                       dataKey="day" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#64748b', fontSize: 12}}
                       dy={10}
                    />
                    <YAxis hide domain={[0, 6]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Mood Level"
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#moodGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl overflow-hidden relative">
             <div className="absolute -right-4 -top-4 opacity-10">
                <Sparkles className="h-24 w-24" />
             </div>
             <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Reflect & Sync</h3>
                <p className="text-sm opacity-90 leading-relaxed italic">
                  "Emotions are like waves; we can't stop them from coming, but we can choose which one to surf."
                </p>
                <div className="mt-6 flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                      7d
                   </div>
                   <div className="text-sm">
                      <p className="font-bold">Consistency Streak</p>
                      <p className="opacity-70">3 days in a row logged</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex gap-3">
                  <div className="h-8 w-8 rounded bg-green-100 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                     <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Your mood improves significantly on days you track over 30m of activity.</p>
               </div>
               <div className="flex gap-3">
                  <div className="h-8 w-8 rounded bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center shrink-0">
                     <Battery className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Thursday evening logs show recurrent lower energy. Consider a meditation session then.</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
