import { useEffect, useMemo, useState } from "react";
import { format, isSameDay, parseISO, startOfDay, subDays } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Heart, Loader2, MessageCircle, Plus, TrendingUp, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  interactionCategories,
  interactionCategoryMultipliers,
  interactionRatingScores,
  interactionRatings,
  type InteractionCategory,
  type InteractionRating,
} from "@shared/social";

type SocialInteractionRecord = {
  id: string;
  userId: string;
  category: InteractionCategory;
  rating: InteractionRating;
  note: string | null;
  createdAt: string;
};

const categoryAccent: Record<InteractionCategory, string> = {
  Friends: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
  Family: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900 dark:bg-pink-950/30 dark:text-pink-200",
  Strangers: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  Animals: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
};

const ratingAccent: Record<InteractionRating, string> = {
  "Very Positive": "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
  Positive: "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200",
  Neutral: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  Negative: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200",
  "Very Negative": "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200",
};

function computeInteractionScore(interaction: SocialInteractionRecord) {
  const baseScore = interactionRatingScores[interaction.rating];
  const multiplier = interactionCategoryMultipliers[interaction.category];

  return Math.min(100, Math.round(baseScore * multiplier));
}

export default function SocialPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [interactions, setInteractions] = useState<SocialInteractionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InteractionCategory>(interactionCategories[0]);
  const [selectedRating, setSelectedRating] = useState<InteractionRating>(interactionRatings[1]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadInteractions = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/social-interactions/${user.id}`);
        const result = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load interactions.");
        }

        if (!cancelled) {
          setInteractions(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Could not load interactions",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInteractions();

    return () => {
      cancelled = true;
    };
  }, [toast, user?.id]);

  const addInteraction = async () => {
    if (!user?.id) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/social-interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          category: selectedCategory,
          rating: selectedRating,
          note,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to save interaction.");
      }

      setInteractions((current) => [result, ...current]);
      setNote("");

      toast({
        title: "Interaction logged",
        description: "Your social check-in was saved.",
      });
    } catch (error) {
      toast({
        title: "Could not save interaction",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const today = startOfDay(new Date());
  const recentInteractions = interactions.slice(0, 6);
  const lastSevenDaysInteractions = interactions.filter((interaction) => {
    const interactionDate = startOfDay(parseISO(interaction.createdAt));
    return interactionDate >= subDays(today, 6);
  });

  const weeklyInteractionCount = lastSevenDaysInteractions.length;

  const connectionWellnessScore = useMemo(() => {
    if (lastSevenDaysInteractions.length === 0) {
      return 0;
    }

    const averageImpact =
      lastSevenDaysInteractions.reduce((sum, interaction) => sum + computeInteractionScore(interaction), 0) /
      lastSevenDaysInteractions.length;

    const frequencyScore = Math.min(100, Math.round((lastSevenDaysInteractions.length / 10) * 100));

    return Math.round(averageImpact * 0.75 + frequencyScore * 0.25);
  }, [lastSevenDaysInteractions]);

  const positiveShare = useMemo(() => {
    if (lastSevenDaysInteractions.length === 0) {
      return 0;
    }

    const positiveCount = lastSevenDaysInteractions.filter((interaction) => {
      return interaction.rating === "Very Positive" || interaction.rating === "Positive";
    }).length;

    return Math.round((positiveCount / lastSevenDaysInteractions.length) * 100);
  }, [lastSevenDaysInteractions]);

  const weeklyTrendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = subDays(today, 6 - index);
      const dayInteractions = interactions.filter((interaction) => isSameDay(parseISO(interaction.createdAt), date));
      const dailyScore = dayInteractions.length
        ? Math.round(
            dayInteractions.reduce((sum, interaction) => sum + computeInteractionScore(interaction), 0) /
              dayInteractions.length,
          )
        : 0;

      return {
        day: format(date, "EEE"),
        count: dayInteractions.length,
        score: dailyScore,
      };
    });
  }, [interactions, today]);

  const categoryBreakdown = useMemo(() => {
    return interactionCategories.map((category) => ({
      category,
      count: lastSevenDaysInteractions.filter((interaction) => interaction.category === category).length,
    }));
  }, [lastSevenDaysInteractions]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Social Dashboard</h1>
        <p className="text-muted-foreground">
          Log interactions quickly and track how your connections affect your wellbeing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{weeklyInteractionCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Interactions logged in the last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Connection Wellness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{connectionWellnessScore}%</div>
            <p className="mt-1 text-sm text-muted-foreground">Quality and consistency of recent interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Positive Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{positiveShare}%</div>
            <p className="mt-1 text-sm text-muted-foreground">Positive or very positive interactions this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-500" />
            Log Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Who did you interact with?</Label>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {interactionCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                    selectedCategory === category
                      ? categoryAccent[category]
                      : "border-border bg-background hover:bg-muted/60",
                  )}
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`button-category-${category.toLowerCase()}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>How did the interaction feel?</Label>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {interactionRatings.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                    selectedRating === rating
                      ? ratingAccent[rating]
                      : "border-border bg-background hover:bg-muted/60",
                  )}
                  onClick={() => setSelectedRating(rating)}
                  data-testid={`button-rating-${rating.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interaction-note">Optional note</Label>
            <Textarea
              id="interaction-note"
              placeholder="Add any extra context if you want, but it is not required."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-[110px]"
              data-testid="textarea-social-note"
            />
          </div>

          <Button
            onClick={() => void addInteraction()}
            className="w-full"
            data-testid="button-log-interaction"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Log Interaction
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Interaction Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Wellness Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Mix</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {categoryBreakdown.map((item) => (
            <div key={item.category} className={cn("rounded-xl border p-4", categoryAccent[item.category])}>
              <div className="text-sm font-medium">{item.category}</div>
              <div className="mt-2 text-2xl font-bold">{item.count}</div>
              <div className="text-xs opacity-80">Interactions in the last 7 days</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Interactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentInteractions.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No interactions logged yet. Start with a quick category and rating above.
            </div>
          ) : (
            recentInteractions.map((interaction) => (
              <div key={interaction.id} className="rounded-lg border p-4 hover-elevate">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", categoryAccent[interaction.category])}>
                      {interaction.category}
                    </span>
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", ratingAccent[interaction.rating])}>
                      {interaction.rating}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(interaction.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {interaction.note?.trim() || "No extra note added."}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-gray-800 dark:to-pink-900">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">
            🐾 {interactions.length === 0
              ? "A small moment of connection still counts. Log the next one in just two taps."
              : connectionWellnessScore >= 75
                ? "Your recent connections are supporting your wellbeing. Keep that rhythm going."
                : "Your social energy looks mixed this week. A positive check-in with someone close could help."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
