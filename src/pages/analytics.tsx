import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Award, Brain, Heart, Loader2, Target, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

type WellnessSummary = {
  scores: {
    lifeSyncScore: number;
    mindScore: number;
    emotionalScore: number;
    socialScore: number;
    productivityScore: number;
    physicalScore: number;
  };
  metrics: {
    activityMinutes: number;
    habitCompletionPct: number;
    avgSleep: number;
    socialPositiveRatio: number;
  };
  trends: {
    lifeSync7d: Array<{ day: string; value?: number }>;
    socialFrequency7d: Array<{ day: string; count: number }>;
  };
  crossPillar: {
    sleepVsMood: { correlationHint: string };
    meditationVsProductivity: { signal: string };
    activityVsEmotional: { signal: string };
    gratitudeVsMood: { signal: string };
    socialVsMood: { signal: string };
  };
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<WellnessSummary | null>(null);

  const loadSummary = async (userId: string, cancelledRef: { cancelled: boolean }) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wellness-summary/${userId}?days=30`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load analytics.");
      }

      if (!cancelledRef.cancelled) {
        setSummary(payload);
      }
    } catch {
      if (!cancelledRef.cancelled) {
        setSummary(null);
      }
    } finally {
      if (!cancelledRef.cancelled) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const cancelledRef = { cancelled: false };

    const handleDataUpdated = () => {
      void loadSummary(user.id, cancelledRef);
    };

    void loadSummary(user.id, cancelledRef);
    window.addEventListener("wellness:data-updated", handleDataUpdated as EventListener);

    return () => {
      cancelledRef.cancelled = true;
      window.removeEventListener("wellness:data-updated", handleDataUpdated as EventListener);
    };
  }, [user?.id]);

  const pillarData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Mind", value: summary.scores.mindScore, color: "#6366f1" },
      { name: "Emotional", value: summary.scores.emotionalScore, color: "#a855f7" },
      { name: "Social", value: summary.scores.socialScore, color: "#ec4899" },
      { name: "Productivity", value: summary.scores.productivityScore, color: "#f97316" },
      { name: "Physical", value: summary.scores.physicalScore, color: "#14b8a6" },
    ];
  }, [summary]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <p className="text-muted-foreground">No analytics data available yet. Start logging activities to unlock insights.</p>
      </div>
    );
  }

  const cards = [
    {
      label: "LifeSync Score",
      value: `${summary.scores.lifeSyncScore}`,
      trend: `${summary.scores.lifeSyncScore >= 75 ? "Balanced" : "Growing"}`,
      icon: Target,
    },
    {
      label: "Active Minutes",
      value: `${summary.metrics.activityMinutes}m`,
      trend: summary.metrics.activityMinutes >= 150 ? "On Track" : "Build More",
      icon: TrendingUp,
    },
    {
      label: "Sleep Average",
      value: `${summary.metrics.avgSleep.toFixed(1)}h`,
      trend: summary.metrics.avgSleep >= 7 ? "Healthy" : "Low",
      icon: Brain,
    },
    {
      label: "Social Positivity",
      value: `${Math.round(summary.metrics.socialPositiveRatio)}%`,
      trend: summary.metrics.socialPositiveRatio >= 70 ? "Strong" : "Improve",
      icon: Heart,
    },
  ];

  const patternRows = [
    ["Sleep vs Mood", summary.crossPillar.sleepVsMood.correlationHint],
    ["Meditation vs Productivity", summary.crossPillar.meditationVsProductivity.signal],
    ["Activity vs Emotional", summary.crossPillar.activityVsEmotional.signal],
    ["Gratitude vs Mood", summary.crossPillar.gratitudeVsMood.signal],
    ["Social vs Mood", summary.crossPillar.socialVsMood.signal],
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">Live wellness metrics and cross-pillar patterns based on your real activity logs.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label} className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary">{item.trend}</Badge>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</h3>
              <div className="mt-1 text-3xl font-black">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="border-none shadow-xl lg:col-span-2">
          <CardHeader>
            <CardTitle>LifeSync Trend (7 days)</CardTitle>
            <CardDescription>Composite score progression from your daily logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.trends.lifeSync7d}>
                  <defs>
                    <linearGradient id="lifeSyncFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#lifeSyncFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Pillar Distribution</CardTitle>
            <CardDescription>Normalized 0-100 sub-scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pillarData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={6}>
                    {pillarData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {pillarData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-auto text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Social Frequency (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.trends.socialFrequency7d}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Cross-Pillar Signals</CardTitle>
            <CardDescription>Automatically computed relationships from your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {patternRows.map(([label, signal]) => (
              <div key={label} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <span className="font-medium">{label}</span>
                <Badge className="ml-auto" variant={signal === "positive" ? "default" : "secondary"}>
                  {signal}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
