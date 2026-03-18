import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { fetchWellnessRecords } from "@/lib/wellness-api";

type TimelineEvent = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  source: string;
};

type GenericRecord = { id?: string; createdAt?: string; [key: string]: unknown };

type SourceConfig = {
  table: string;
  source: string;
  buildType: (record: GenericRecord) => string;
  buildTitle: (record: GenericRecord) => string;
};

const sourceConfigs: SourceConfig[] = [
  {
    table: "tasks",
    source: "To-Do",
    buildType: (record) => (record.completed ? "task_completed" : "task_created"),
    buildTitle: (record) => `Task: ${String(record.title ?? record.text ?? "Untitled")}`,
  },
  {
    table: "water_entries",
    source: "Water",
    buildType: () => "water_logged",
    buildTitle: (record) => `Water: ${Number(record.amount ?? record.glasses ?? 0)} glasses`,
  },
  {
    table: "meditation_sessions",
    source: "Meditation",
    buildType: () => "meditation_completed",
    buildTitle: (record) => `Meditation: ${Number(record.duration ?? 0)} min`,
  },
  {
    table: "mindfulness_sessions",
    source: "Mindfulness",
    buildType: () => "mindfulness_completed",
    buildTitle: (record) => `Mindfulness: ${Number(record.duration ?? 0)} min`,
  },
  {
    table: "study_sessions",
    source: "Study",
    buildType: () => "study_logged",
    buildTitle: (record) => `Study: ${String(record.subject ?? "General")} (${Number(record.duration ?? record.durationMinutes ?? 0)} min)`,
  },
  {
    table: "journal_entries",
    source: "Journal",
    buildType: () => "journal_written",
    buildTitle: (record) => `Journal: ${String(record.title ?? "Reflection")}`,
  },
  {
    table: "mood_entries",
    source: "Mood",
    buildType: () => "mood_logged",
    buildTitle: (record) => `Mood: ${String(record.moodLabel ?? record.mood ?? "Unknown")}`,
  },
  {
    table: "sleep_entries",
    source: "Sleep",
    buildType: () => "sleep_logged",
    buildTitle: (record) => `Sleep: ${Number(record.duration ?? record.durationH ?? 0).toFixed(1)}h`,
  },
  {
    table: "social_interactions",
    source: "Social",
    buildType: () => "social_logged",
    buildTitle: (record) => `Social: ${String(record.type ?? record.category ?? "interaction")}`,
  },
  {
    table: "pomodoro_sessions",
    source: "Pomodoro",
    buildType: () => "pomodoro_completed",
    buildTitle: (record) => `Pomodoro: ${Number(record.duration ?? record.durationMinutes ?? 0)} min`,
  },
  {
    table: "habits",
    source: "Habits",
    buildType: (record) => (record.completedToday ? "habit_completed" : "habit_created"),
    buildTitle: (record) => `Habit: ${String(record.habitName ?? record.name ?? "Habit")}`,
  },
  {
    table: "goals",
    source: "Goals",
    buildType: (record) => (record.completed ? "goal_completed" : "goal_updated"),
    buildTitle: (record) => `Goal: ${String(record.title ?? "Goal")}`,
  },
];

function timeAgo(isoDate: string) {
  const timestamp = new Date(isoDate).getTime();
  if (!Number.isFinite(timestamp)) return "just now";
  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export default function TimelinePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadTimeline = async () => {
      setLoading(true);

      const recordsBySource = await Promise.all(
        sourceConfigs.map(async (config) => {
          const records = await fetchWellnessRecords<GenericRecord>(config.table as any, user.id).catch(() => []);
          return { config, records };
        }),
      );

      if (cancelled) return;

      const merged = recordsBySource
        .flatMap(({ config, records }) =>
          records.map((record, index) => {
            const timestamp = typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString();
            return {
              id: `${config.table}-${String(record.id ?? index)}`,
              type: config.buildType(record),
              title: config.buildTitle(record),
              timestamp,
              source: config.source,
            } as TimelineEvent;
          }),
        )
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

      setEvents(merged);
      setLoading(false);
    };

    void loadTimeline();

    const handleDataUpdated = () => {
      void loadTimeline();
    };

    window.addEventListener("wellness:data-updated", handleDataUpdated as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("wellness:data-updated", handleDataUpdated as EventListener);
    };
  }, [user?.id]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const event of events) {
      const key = new Date(event.timestamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(event);
    }
    return Array.from(map.entries());
  }, [events]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Full Timeline</h1>
        <p className="text-sm text-muted-foreground">
          Unified history across dashboards: tasks, water, meditation, mindfulness, study, journal, mood, sleep, social, pomodoro, habits, and goals.
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No activity yet. Start logging entries in any dashboard to build your timeline.
          </CardContent>
        </Card>
      ) : (
        grouped.map(([date, dayEvents]) => (
          <Card key={date}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{date}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayEvents.map((event) => (
                <div key={event.id} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline">{event.source}</Badge>
                    <span className="text-xs text-muted-foreground">{event.type}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{timeAgo(event.timestamp)}</span>
                  </div>
                  <p className="text-sm font-medium">{event.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
