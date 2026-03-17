import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UtensilsCrossed, Apple, Flame, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, fetchWellnessRecords, deleteWellnessRecord } from "@/lib/wellness-api";

type NutritionRecord = {
  id: string;
  mealType: string;
  foodName: string;
  calories: number | null;
  notes: string | null;
  createdAt: string;
};

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

const mealEmojis: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Snack: "🍪",
};

function buildWeeklyMealChart(records: NutritionRecord[]) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayName = dayNames[d.getDay()];
    const dateStr = d.toISOString().slice(0, 10);
    const dayRecords = records.filter((r) => String(r.createdAt ?? "").slice(0, 10) === dateStr);
    return { day: dayName, meals: dayRecords.length };
  });
}

function buildMealTypeBreakdown(records: NutritionRecord[]) {
  const counts: Record<string, number> = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };
  for (const r of records) {
    if (r.mealType in counts) {
      counts[r.mealType]++;
    }
  }
  return counts;
}

export default function NutritionPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [mealType, setMealType] = useState<string>("Breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<NutritionRecord[]>([]);

  const loadData = (uid: string) => {
    fetchWellnessRecords<NutritionRecord>("nutrition_logs", uid)
      .then((data) => setRecords(data))
      .catch(() => {
        toast({ title: "Could not load nutrition data", description: "Please refresh the page.", variant: "destructive" });
      });
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    loadData(user.id);
    setLoading(false);
  }, [user?.id]);

  const logMeal = async () => {
    if (!foodName.trim()) {
      toast({ title: "Food name required", description: "Please enter what you ate.", variant: "destructive" });
      return;
    }
    try {
      if (user?.id) {
        await createWellnessRecord("nutrition_logs", {
          userId: user.id,
          mealType,
          foodName: foodName.trim(),
          calories: calories ? Number(calories) : null,
          notes: notes.trim() || null,
        });
        loadData(user.id);
      }
      setFoodName("");
      setCalories("");
      setNotes("");
      toast({ title: "Meal logged", description: "Your nutrition data now contributes to analytics and AI insights." });
    } catch {
      toast({ title: "Could not log meal", description: "Please try again.", variant: "destructive" });
    }
  };

  const removeMeal = async (recordId: string) => {
    try {
      await deleteWellnessRecord("nutrition_logs", recordId);
      if (user?.id) loadData(user.id);
      toast({ title: "Meal removed" });
    } catch {
      toast({ title: "Could not remove meal", variant: "destructive" });
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

  const weeklyChart = buildWeeklyMealChart(records);
  const mealBreakdown = buildMealTypeBreakdown(records);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeals = records.filter((r) => String(r.createdAt ?? "").slice(0, 10) === todayStr);
  const todayCalories = todayMeals.reduce((sum, r) => sum + (r.calories ?? 0), 0);
  const hasData = records.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Nutrition Dashboard</h1>
        <p className="text-muted-foreground">Log meals and maintain a balanced diet</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Log Meal Card */}
        <Card className="bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-800 dark:to-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-green-600" />
              Log a Meal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger data-testid="select-meal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {mealEmojis[type]} {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="food-name">Food Name</Label>
              <Input
                id="food-name"
                placeholder="e.g. Oatmeal with berries"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                data-testid="input-food-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories (optional)</Label>
              <Input
                id="calories"
                type="number"
                placeholder="e.g. 350"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                data-testid="input-calories"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-notes">Notes (optional)</Label>
              <Textarea
                id="meal-notes"
                placeholder="Any notes about this meal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                data-testid="input-meal-notes"
              />
            </div>
            <Button className="w-full" data-testid="button-log-meal" onClick={() => void logMeal()}>
              Log Meal
            </Button>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-red-500" />
              Today's Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold">{todayMeals.length}</div>
                <p className="text-xs text-muted-foreground">Meals today</p>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {todayCalories > 0 ? todayCalories : "—"}
                </div>
                <p className="text-xs text-muted-foreground">Calories today</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Meal Breakdown</p>
              <div className="grid grid-cols-2 gap-2">
                {mealTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2 p-2 bg-accent/10 rounded-md">
                    <span>{mealEmojis[type]}</span>
                    <span className="text-sm">{type}</span>
                    <span className="ml-auto text-sm font-bold">{mealBreakdown[type]}</span>
                  </div>
                ))}
              </div>
            </div>

            {todayMeals.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <p className="text-sm font-medium">Today's Log</p>
                {todayMeals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-2 bg-card border rounded-md text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span>{mealEmojis[meal.mealType] ?? "🍽️"}</span>
                      <span className="truncate">{meal.foodName}</span>
                      {meal.calories !== null && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{meal.calories} cal</span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void removeMeal(meal.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="meals" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground gap-3">
              <UtensilsCrossed className="h-12 w-12 opacity-20" />
              <p className="text-sm">Log meals to see your weekly trends.</p>
            </div>
          )}
          <div className="mt-4 bg-accent/20 p-4 rounded-lg text-center">
            <p className="text-sm italic">
              {todayMeals.length >= 3
                ? "💡 Great job balancing your meals today!"
                : todayMeals.length > 0
                ? "💡 Add more fruits and veggies to complete your daily nutrition."
                : "💡 Start logging meals to track your dietary habits."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cat Message */}
      <Card className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-800 dark:to-green-900">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">🐾 Yum! That meal looks healthy 🐾</p>
        </CardContent>
      </Card>
    </div>
  );
}
