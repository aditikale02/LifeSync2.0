import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Book, Plus, Clock, Flame, Star, Trash2, TrendingUp, Brain, CalendarDays } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, fetchWellnessRecords, deleteWellnessRecord } from "@/lib/wellness-api";
import { useToast } from "@/hooks/use-toast";

type StudyLog = {
  id: string;
  userId: string;
  subject: string;
  durationMinutes: number;
  focusRating: number;
  notes?: string | null;
  studyDate: string;
  createdAt: string;
};

const FOCUS_LABELS = ["", "Very distracted", "Distracted", "Average focus", "Good focus", "Highly focused"];

function buildLast7DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export default function StudyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [focusRating, setFocusRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [studyDate, setStudyDate] = useState(() => new Date().toISOString().slice(0, 10));

  const userId = user?.id ?? "guest";

  const loadLogs = async () => {
    try {
      const data = await fetchWellnessRecords<StudyLog>("study_logs", userId);
      setLogs(data);
    } catch {
      // silently handle network issues
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const resetForm = () => {
    setSubject("");
    setDurationMinutes("");
    setFocusRating(3);
    setNotes("");
    setStudyDate(new Date().toISOString().slice(0, 10));
  };

  const handleAdd = async () => {
    const dur = parseInt(durationMinutes, 10);
    if (!subject.trim()) {
      toast({ title: "Subject is required.", variant: "destructive" });
      return;
    }
    if (isNaN(dur) || dur < 1) {
      toast({ title: "Enter a valid duration in minutes.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createWellnessRecord("study_logs", {
        userId,
        subject: subject.trim(),
        durationMinutes: dur,
        focusRating,
        notes: notes.trim() || null,
        studyDate,
      });
      toast({ title: "Study session logged!" });
      resetForm();
      setOpen(false);
      await loadLogs();
    } catch {
      toast({ title: "Failed to save session.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWellnessRecord("study_logs", id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Session removed." });
    } catch {
      toast({ title: "Failed to remove session.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  // --- Analytics computed from live data ---
  const last7DayKeys = useMemo(buildLast7DayKeys, []);

  const weekLogs = useMemo(
    () => logs.filter((l) => last7DayKeys.includes(l.studyDate)),
    [logs, last7DayKeys],
  );

  const totalMinutesThisWeek = useMemo(
    () => weekLogs.reduce((s, l) => s + l.durationMinutes, 0),
    [weekLogs],
  );

  const activeDaysThisWeek = useMemo(
    () => new Set(weekLogs.map((l) => l.studyDate)).size,
    [weekLogs],
  );

  const avgFocus = useMemo(() => {
    if (!weekLogs.length) return 0;
    return parseFloat((weekLogs.reduce((s, l) => s + l.focusRating, 0) / weekLogs.length).toFixed(1));
  }, [weekLogs]);

  // Daily study minutes – last 7 days
  const dailyChartData = useMemo(() => {
    return last7DayKeys.map((key) => {
      const label = new Date(key + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
      const mins = logs.filter((l) => l.studyDate === key).reduce((s, l) => s + l.durationMinutes, 0);
      return { day: label, minutes: mins };
    });
  }, [logs, last7DayKeys]);

  // Total minutes per subject this week
  const subjectChartData = useMemo(() => {
    const map: Record<string, number> = {};
    weekLogs.forEach((l) => { map[l.subject] = (map[l.subject] ?? 0) + l.durationMinutes; });
    return Object.entries(map)
      .map(([subject, minutes]) => ({ subject, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8);
  }, [weekLogs]);

  // Focus rating trend – last 12 sessions this week, chronological
  const focusTrendData = useMemo(() => {
    return [...weekLogs]
      .sort((a, b) => {
        const d = a.studyDate.localeCompare(b.studyDate);
        return d !== 0 ? d : a.createdAt.localeCompare(b.createdAt);
      })
      .slice(-12)
      .map((l, i) => ({
        session: i + 1,
        focus: l.focusRating,
        label: FOCUS_LABELS[l.focusRating],
        subject: l.subject,
      }));
  }, [weekLogs]);

  const hrsDisplay = `${Math.floor(totalMinutesThisWeek / 60)}h ${totalMinutesThisWeek % 60}m`;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Study Dashboard</h1>
          <p className="text-muted-foreground">Track focused study sessions and analyse your learning habits</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Log Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log a Study Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="study-subject">Subject *</Label>
                <Input
                  id="study-subject"
                  placeholder="e.g., Mathematics – Calculus"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="study-duration">Duration (minutes) *</Label>
                  <Input
                    id="study-duration"
                    type="number"
                    min={1}
                    max={720}
                    placeholder="e.g., 45"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="study-date">Date</Label>
                  <Input
                    id="study-date"
                    type="date"
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Focus Rating: <strong>{focusRating} / 5</strong>
                  {" — "}
                  <span className="font-normal text-muted-foreground">{FOCUS_LABELS[focusRating]}</span>
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFocusRating(r)}
                      aria-label={`Focus rating ${r} – ${FOCUS_LABELS[r]}`}
                      className={`h-9 w-9 rounded-lg border text-sm font-bold transition-all ${
                        r <= focusRating
                          ? "bg-amber-400 border-amber-500 text-white shadow-sm"
                          : "border-input text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  1 – Very distracted · 2 – Distracted · 3 – Average · 4 – Good focus · 5 – Highly focused
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="study-notes">Notes (optional)</Label>
                <Textarea
                  id="study-notes"
                  placeholder="What did you study? e.g., Completed calculus chapter 3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                />
              </div>

              <Button className="w-full" onClick={handleAdd} disabled={saving}>
                {saving ? "Saving…" : "Save Session"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 text-blue-500" />
              Weekly Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMinutesThisWeek > 0 ? hrsDisplay : "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">Total study time this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              Study Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDaysThisWeek} / 7</div>
            <p className="text-xs text-muted-foreground mt-1">Days with at least one session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Star className="h-4 w-4 text-amber-500" />
              Average Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFocus > 0 ? `${avgFocus} / 5` : "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgFocus > 0 ? FOCUS_LABELS[Math.round(avgFocus)] : "No sessions this week"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Brain className="h-4 w-4 text-purple-500" />
              Sessions This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Logged study sessions (last 7 days)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Daily Study Minutes
            </CardTitle>
            <p className="text-xs text-muted-foreground">Minutes studied per day over the last 7 days</p>
          </CardHeader>
          <CardContent>
            {dailyChartData.every((d) => d.minutes === 0) ? (
              <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
                Log sessions to see your daily study chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} unit="m" />
                  <Tooltip
                    formatter={(value: number) => [`${value} min`, "Study time"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="minutes" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-4 w-4 text-emerald-500" />
              Study Time by Subject
            </CardTitle>
            <p className="text-xs text-muted-foreground">Total minutes per subject this week</p>
          </CardHeader>
          <CardContent>
            {subjectChartData.length === 0 ? (
              <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
                No subject data for this week yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={subjectChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} unit="m" />
                  <YAxis
                    dataKey="subject"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} min`, "Study time"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="minutes" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Focus trend – only shown once there are at least 2 sessions */}
      {focusTrendData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Focus Trend
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Focus rating (1–5) across your recent sessions this week — hover a point to see details
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={focusTrendData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="session"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Session #", position: "insideBottomRight", offset: -4, fontSize: 11 }}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [FOCUS_LABELS[value] ?? value, "Focus"]}
                  labelFormatter={(label) => `Session ${label}`}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Line
                  type="monotone"
                  dataKey="focus"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Session log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-4 w-4 text-blue-500" />
            Recent Sessions
          </CardTitle>
          <p className="text-xs text-muted-foreground">All logged study sessions, most recent first</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading sessions…</p>
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No study sessions yet. Click <strong>Log Session</strong> to add your first one!
            </p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 25).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">{log.subject}</p>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {log.durationMinutes} min
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {"★".repeat(log.focusRating)}{"☆".repeat(5 - log.focusRating)}{" "}
                        {FOCUS_LABELS[log.focusRating]}
                      </Badge>
                    </div>
                    {log.notes && (
                      <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{log.studyDate}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === log.id}
                    onClick={() => handleDelete(log.id)}
                    className="shrink-0 text-destructive hover:text-destructive"
                    aria-label="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-accent/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">🐾 Focus time activated! You got this 💪</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
