import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplet, Brain, Heart, Target, TrendingUp, Flame, Sparkles, BrainCircuit, ArrowRight, Activity, Smile, CheckCircle2, LayoutGrid } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import { fetchWellnessRecords } from "@/lib/wellness-api";

type WaterEntry = { glasses?: number; amount?: number; goal?: number; createdAt?: string };
type MindfulnessEntry = { duration?: number; createdAt?: string };
type TaskEntry = { text?: string; completed?: boolean; createdAt?: string };
type ActivityEntry = { duration?: number; type?: string; createdAt?: string };
type GenericEntry = { createdAt?: string; [key: string]: unknown };

type TimelineEvent = {
  id: string;
  text: string;
  createdAt: string;
  color: string;
};

export default function Home() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || "there";
  const [loading, setLoading] = useState(true);
  const [hydrationText, setHydrationText] = useState("—");
  const [hydrationSub, setHydrationSub] = useState("No hydration data yet");
  const [mindfulnessText, setMindfulnessText] = useState("—");
  const [mindfulnessSub, setMindfulnessSub] = useState("No mindfulness sessions yet");
  const [tasksText, setTasksText] = useState("—");
  const [tasksSub, setTasksSub] = useState("No tasks yet");
  const [wellnessScoreText, setWellnessScoreText] = useState("—");
  const [wellnessScoreSub, setWellnessScoreSub] = useState("No activity data yet");
  const [habitProgress, setHabitProgress] = useState(0);
  const [activityMinutesToday, setActivityMinutesToday] = useState(0);
  const [moodStatus, setMoodStatus] = useState("No mood entries yet");
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [hasAnyData, setHasAnyData] = useState(false);

  const timeAgo = (isoDate: string) => {
    const timestamp = new Date(isoDate).getTime();
    if (!Number.isFinite(timestamp)) return "just now";

    const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  const formatMoodStatus = (moodLabel: unknown) => {
    if (typeof moodLabel !== "string" || !moodLabel.trim()) {
      return "No mood entries yet";
    }

    return `${moodLabel.trim()} mood`;
  };

  const buildTimelineText = (table: string, record: GenericEntry) => {
    if (table === "tasks") {
      const taskText = typeof record.text === "string" ? record.text : "Task";
      if (record.completed === true) {
        return `Completed task: ${taskText}`;
      }
      return `Added task: ${taskText}`;
    }

    if (table === "water_entries") {
      const glasses = Number(record.glasses ?? 0);
      return `Logged hydration: ${glasses} glass${glasses === 1 ? "" : "es"}`;
    }

    if (table === "meditation_sessions") {
      const duration = Number(record.duration ?? 0);
      return `Meditation session: ${duration} min`;
    }

    if (table === "mindfulness_sessions") {
      const duration = Number(record.duration ?? 0);
      return `Mindfulness session: ${duration} min`;
    }

    if (table === "journal_entries") {
      const title = typeof record.title === "string" ? record.title : "Journal entry";
      return `Journaled: ${title}`;
    }

    if (table === "study_sessions") {
      const subject = typeof record.subject === "string" ? record.subject : "Study";
      const duration = Number(record.durationMinutes ?? 0);
      return `Study session: ${subject} (${duration} min)`;
    }

    if (table === "social_interactions") {
      const category = typeof record.category === "string" ? record.category : "Social";
      const rating = typeof record.rating === "string" ? record.rating : "interaction";
      return `${category} interaction: ${rating}`;
    }

    if (table === "mood_entries") {
      const mood = typeof record.moodLabel === "string" ? record.moodLabel : "Mood";
      return `Logged mood: ${mood}`;
    }

    if (table === "pomodoro_sessions") {
      const duration = Number(record.durationMinutes ?? 0);
      return `Pomodoro complete: ${duration} min`;
    }

    if (table === "sleep_entries") {
      const hours = Number(record.durationH ?? 0);
      return `Sleep logged: ${hours.toFixed(1)}h`;
    }

    return "Activity logged";
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadHomeData = async () => {
      setLoading(true);

      const [
        waterEntries,
        mindfulnessSessions,
        taskEntries,
        activityEntries,
        moodEntries,
        meditationEntries,
        journalEntries,
        studyEntries,
        socialEntries,
        pomodoroEntries,
        sleepEntries,
      ] = await Promise.all([
        fetchWellnessRecords<WaterEntry>("water_entries", user.id).catch(() => []),
        fetchWellnessRecords<MindfulnessEntry>("mindfulness_sessions", user.id).catch(() => []),
        fetchWellnessRecords<TaskEntry>("tasks", user.id).catch(() => []),
        fetchWellnessRecords<ActivityEntry>("activities", user.id).catch(() => []),
        fetchWellnessRecords<GenericEntry>("mood_entries", user.id).catch(() => []),
        fetchWellnessRecords<GenericEntry>("meditation_sessions", user.id).catch(() => []),
        fetchWellnessRecords<GenericEntry>("journal_entries", user.id).catch(() => []),
        fetchWellnessRecords<GenericEntry>("study_sessions", user.id).catch(() => []),
        fetchWellnessRecords<GenericEntry>("social_interactions", user.id).catch(() => []),
        fetchWellnessRecords<GenericEntry>("pomodoro_sessions", user.id).catch(() => []),
        fetchWellnessRecords<GenericEntry>("sleep_entries", user.id).catch(() => []),
      ]);

      if (cancelled) return;

      const todayKey = new Date().toISOString().slice(0, 10);

      const latestWater = waterEntries[0];
      const totalWaterAmount = waterEntries.reduce((sum, entry) => sum + Number(entry.amount ?? entry.glasses ?? 0), 0);
      const waterGoal = Number(latestWater?.goal ?? 8) || 8;
      setHydrationText(`${totalWaterAmount} glasses`);
      setHydrationSub(waterEntries.length ? `Goal baseline: ${waterGoal} glasses/day` : "No hydration data yet");

      const weekCutoff = new Date();
      weekCutoff.setDate(weekCutoff.getDate() - 7);
      const recentMindfulness = mindfulnessSessions.filter((entry) => {
        return entry.createdAt ? new Date(entry.createdAt) >= weekCutoff : false;
      });
      const mindfulnessMinutes = recentMindfulness.reduce((sum, entry) => sum + Number(entry.duration ?? 0), 0);
      setMindfulnessText(`${mindfulnessMinutes}m`);
      setMindfulnessSub(
        recentMindfulness.length
          ? `${recentMindfulness.length} session${recentMindfulness.length !== 1 ? "s" : ""} this week`
          : "No mindfulness sessions yet",
      );

      const completedTasks = taskEntries.filter((entry) => entry.completed).length;
      setTasksText(taskEntries.length ? `${completedTasks}/${taskEntries.length}` : "—");
      setTasksSub(taskEntries.length ? `${taskEntries.length - completedTasks} remaining` : "No tasks yet");

      const todaysActivities = activityEntries.filter((entry) => String(entry.createdAt ?? "").slice(0, 10) === todayKey);
      const todaysMinutes = todaysActivities.reduce((sum, entry) => sum + Number(entry.duration ?? 0), 0);
      setActivityMinutesToday(todaysMinutes);

      const latestMood = moodEntries[0];
      setMoodStatus(formatMoodStatus(latestMood?.moodLabel));

      const recentSleep = sleepEntries
        .filter((entry) => (entry.createdAt ? new Date(entry.createdAt) >= weekCutoff : false))
        .map((entry) => Number(entry.durationH ?? entry.duration ?? 0))
        .filter((value) => Number.isFinite(value) && value > 0);
      const sleepAvg = recentSleep.length ? recentSleep.reduce((sum, value) => sum + value, 0) / recentSleep.length : 0;
      const sleepPct = sleepAvg > 0 ? Math.min(100, Math.round((sleepAvg / 8) * 100)) : 0;

      const recentMood = moodEntries
        .filter((entry) => (entry.createdAt ? new Date(entry.createdAt) >= weekCutoff : false))
        .map((entry) => Number(entry.moodScore ?? 0))
        .filter((value) => Number.isFinite(value) && value > 0);
      const moodAvg = recentMood.length ? recentMood.reduce((sum, value) => sum + value, 0) / recentMood.length : 0;
      const moodPct = moodAvg > 0 ? Math.min(100, Math.round((moodAvg / 5) * 100)) : 0;

      const mindfulnessPct = Math.min(100, Math.round((mindfulnessMinutes / 70) * 100));

      const recentSocial = socialEntries.filter((entry) => (entry.createdAt ? new Date(entry.createdAt) >= weekCutoff : false));
      const positiveSocial = recentSocial.filter((entry) => {
        const rating = String(entry.rating ?? "").toLowerCase();
        return rating.includes("positive");
      }).length;
      const socialPct = recentSocial.length ? Math.round((positiveSocial / recentSocial.length) * 100) : 0;

      const availableScores = [sleepPct, moodPct, mindfulnessPct, socialPct].filter((value) => value > 0);
      const wellnessScore = availableScores.length
        ? Math.round(availableScores.reduce((sum, value) => sum + value, 0) / availableScores.length)
        : 0;
      setWellnessScoreText(availableScores.length ? String(wellnessScore) : "—");
      setWellnessScoreSub(availableScores.length ? "Derived from tracked activity" : "No activity data yet");
      const taskPct = taskEntries.length ? (completedTasks / taskEntries.length) * 100 : 0;
      setHabitProgress(Math.round(taskPct));

      const timelineSources: Array<{ table: string; color: string; records: GenericEntry[] }> = [
        { table: "tasks", color: "bg-violet-500", records: taskEntries as GenericEntry[] },
        { table: "water_entries", color: "bg-blue-500", records: waterEntries as GenericEntry[] },
        { table: "meditation_sessions", color: "bg-purple-500", records: meditationEntries },
        { table: "mindfulness_sessions", color: "bg-indigo-500", records: mindfulnessSessions as GenericEntry[] },
        { table: "journal_entries", color: "bg-pink-500", records: journalEntries },
        { table: "study_sessions", color: "bg-emerald-500", records: studyEntries },
        { table: "social_interactions", color: "bg-cyan-500", records: socialEntries },
        { table: "mood_entries", color: "bg-amber-500", records: moodEntries },
        { table: "pomodoro_sessions", color: "bg-red-500", records: pomodoroEntries },
        { table: "sleep_entries", color: "bg-slate-500", records: sleepEntries },
      ];

      const events = timelineSources
        .flatMap((source) =>
          source.records.map((record, index) => {
            const createdAt = typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString();
            return {
              id: `${source.table}-${String(record.id ?? index)}`,
              text: buildTimelineText(source.table, record),
              createdAt,
              color: source.color,
            } as TimelineEvent;
          }),
        )
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 8);

      setTimelineEvents(events);

      const totalRecords = timelineSources.reduce((sum, source) => sum + source.records.length, 0);
      setHasAnyData(totalRecords > 0);
      setLoading(false);
    };

    void loadHomeData();

    const handleDataUpdated = () => {
      void loadHomeData();
    };

    window.addEventListener("wellness:data-updated", handleDataUpdated as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("wellness:data-updated", handleDataUpdated as EventListener);
    };
  }, [user?.id]);

  const statCards = useMemo(
    () => [
      { title: "Hydration", value: hydrationText, icon: Droplet, sub: hydrationSub, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
      { title: "Mindfulness", value: mindfulnessText, icon: Brain, sub: mindfulnessSub, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
      { title: "Wellness Score", value: wellnessScoreText, icon: Heart, sub: wellnessScoreSub, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
      { title: "Today's Habits", value: tasksText, icon: CheckCircle2, sub: tasksSub, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    ],
    [hydrationSub, hydrationText, mindfulnessSub, mindfulnessText, tasksSub, tasksText, wellnessScoreSub, wellnessScoreText],
  );

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
        {statCards.map((stat, i) => (
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
                <ProgressRing progress={habitProgress} size={120} strokeWidth={12} />
                <h4 className="font-bold mt-4">Habit Sync</h4>
                <p className="text-xs text-muted-foreground">
                  {hasAnyData ? "Based on completed tasks" : "Log tasks to unlock progress"}
                </p>
             </div>
             <div className="grid grid-rows-2 gap-4">
                <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-orange-700 dark:text-orange-300" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-orange-800">Activity</p>
                     <p className="text-sm font-black">{loading ? "…" : `${activityMinutesToday}m today`}</p>
                   </div>
                </div>
                <div className="p-5 rounded-2xl bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-100 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-yellow-200 dark:bg-yellow-900 flex items-center justify-center">
                      <Smile className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-yellow-800">Mood</p>
                     <p className="text-sm font-black text-yellow-700">{moodStatus}</p>
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
            {!hasAnyData ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No activity yet. Start logging entries in your dashboards to build a real timeline.
              </div>
            ) : (
              timelineEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 group cursor-pointer">
                <div className={`h-2 w-2 rounded-full ${event.color} mt-1.5 shrink-0 group-hover:scale-150 transition-transform`} />
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{event.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(event.createdAt)}</p>
                </div>
              </div>
            ))) }
            <Button asChild variant="outline" className="w-full mt-4 group">
              <Link href="/timeline">
                View Full Timeline <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
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
