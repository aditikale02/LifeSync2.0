import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon as MoonIcon, Sun, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, fetchWellnessRecords } from "@/lib/wellness-api";

type SleepRecord = { durationH: number; createdAt: string };

function buildWeeklySleepChart(records: SleepRecord[]) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayName = dayNames[d.getDay()];
    const dateStr = d.toISOString().slice(0, 10);
    const dayRecords = records.filter(r => String(r.createdAt ?? "").slice(0, 10) === dateStr);
    const latest = dayRecords.length > 0 ? dayRecords[dayRecords.length - 1] : null;
    return { day: dayName, hours: latest?.durationH ?? 0 };
  });
}

export default function SleepPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [loading, setLoading] = useState(true);
  const [weeklySleep, setWeeklySleep] = useState<{ day: string; hours: number }[]>([]);
  const [avgSleep, setAvgSleep] = useState("0.0");

  const loadSleepData = (uid: string) => {
    fetchWellnessRecords<SleepRecord>("sleep_logs", uid)
      .then(records => {
        const chart = buildWeeklySleepChart(records);
        setWeeklySleep(chart);
        const withData = chart.filter(d => d.hours > 0);
        setAvgSleep(withData.length > 0
          ? (withData.reduce((s, d) => s + d.hours, 0) / withData.length).toFixed(1)
          : "0.0");
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    loadSleepData(user.id);
    setLoading(false);
  }, [user?.id]);

  const calculateSleepHours = () => {
    const bed = new Date(`2000-01-01 ${bedtime}`);
    let wake = new Date(`2000-01-01 ${wakeTime}`);
    if (wake < bed) wake = new Date(`2000-01-02 ${wakeTime}`);
    return ((wake.getTime() - bed.getTime()) / (1000 * 60 * 60)).toFixed(1);
  };

  const qualityScore = parseFloat(avgSleep) > 0
    ? Math.min(100, Math.round(parseFloat(avgSleep) / 8 * 100))
    : 0;

  const logSleep = async () => {
    try {
      if (user?.id) {
        await createWellnessRecord("sleep_logs", {
          userId: user.id,
          bedtime,
          wakeTime,
          durationH: Number(calculateSleepHours()),
        });
        loadSleepData(user.id);
      }
      toast({ title: "Sleep logged", description: "Your sleep data now contributes to analytics and AI insights." });
    } catch {
      toast({ title: "Could not log sleep", description: "Please try again.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasData = weeklySleep.some(d => d.hours > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sleep Dashboard</h1>
        <p className="text-muted-foreground">Track your sleep patterns and rest quality</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MoonIcon className="h-5 w-5 text-purple-500" />
              Tonight's Sleep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bedtime" className="flex items-center gap-2">
                <MoonIcon className="h-4 w-4" /> Bedtime
              </Label>
              <Input id="bedtime" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} data-testid="input-bedtime" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waketime" className="flex items-center gap-2">
                <Sun className="h-4 w-4" /> Wake Time
              </Label>
              <Input id="waketime" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} data-testid="input-waketime" />
            </div>
            <div className="text-center p-4 bg-card rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{calculateSleepHours()}h</div>
              <p className="text-sm text-muted-foreground">Total sleep</p>
            </div>
            <Button className="w-full" data-testid="button-log-sleep" onClick={() => void logSleep()}>
              Log Sleep Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sleep Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold">{avgSleep}h</div>
                <p className="text-xs text-muted-foreground">Avg this week</p>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold">{qualityScore > 0 ? `${qualityScore}%` : "—"}</div>
                <p className="text-xs text-muted-foreground">Quality score</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Sleep Consistency</p>
              {hasData ? (
                <div className="flex gap-1 items-end h-16">
                  {weeklySleep.map((day) => (
                    <div
                      key={day.day}
                      className="flex-1 bg-purple-500/60 rounded-t-md transition-all"
                      style={{ height: day.hours > 0 ? `${Math.round(day.hours / 10 * 100)}%` : "4px" }}
                      title={`${day.day}: ${day.hours > 0 ? `${day.hours}h` : "no data"}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Log sleep to see consistency bars.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Sleep Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklySleep}>
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="hours" stroke="hsl(var(--chart-5))" fillOpacity={1} fill="url(#sleepGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MoonIcon className="h-12 w-12 opacity-20" />
              <p className="text-sm">Log sleep data to see your weekly pattern.</p>
            </div>
          )}
          <div className="mt-4 bg-accent/20 p-4 rounded-lg text-center">
            <p className="text-sm italic">
              {parseFloat(avgSleep) >= 8
                ? "💡 You're hitting 8+ hours — great sleep discipline!"
                : parseFloat(avgSleep) >= 7
                ? "💡 Good sleep average. Aim for 8 hours for peak performance."
                : parseFloat(avgSleep) > 0
                ? "💡 Try going to bed 30 minutes earlier to improve your average."
                : "💡 Start logging your sleep to discover patterns."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-purple-900">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">🐾 You deserve a nap 😴 Don't forget to rest.</p>
        </CardContent>
      </Card>
    </div>
  );
}
