import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Apple, Plus, Trash2, Coffee, UtensilsCrossed } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weeklyNutrition = [
  { day: "Mon", calories: 1800, nutrients: 85 },
  { day: "Tue", calories: 2000, nutrients: 90 },
  { day: "Wed", calories: 1900, nutrients: 88 },
  { day: "Thu", calories: 2100, nutrients: 92 },
  { day: "Fri", calories: 1850, nutrients: 86 },
  { day: "Sat", calories: 2200, nutrients: 95 },
  { day: "Sun", calories: 2050, nutrients: 90 },
];

interface Meal {
  id: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  food: string;
  calories?: number;
}

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", type: "Breakfast", food: "Oatmeal with berries", calories: 350 },
    { id: "2", type: "Lunch", food: "Grilled chicken salad", calories: 450 },
  ]);
  const [newMeal, setNewMeal] = useState("");
  const [selectedType, setSelectedType] = useState<Meal["type"]>("Breakfast");

  const addMeal = () => {
    if (newMeal.trim()) {
      setMeals([...meals, { id: Date.now().toString(), type: selectedType, food: newMeal }]);
      setNewMeal("");
    }
  };

  const deleteMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Nutrition Dashboard</h1>
        <p className="text-muted-foreground">Maintain a balanced diet and eating routine</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-green-500" />
            Add Meal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                data-testid={`button-meal-type-${type.toLowerCase()}`}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="What did you eat?"
              value={newMeal}
              onChange={(e) => setNewMeal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMeal()}
              data-testid="input-meal"
            />
            <Button onClick={addMeal} data-testid="button-add-meal">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Meals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
            >
              <div className="flex items-center gap-3 flex-1">
                {meal.type === "Breakfast" && <Coffee className="h-4 w-4 text-orange-500" />}
                {meal.type === "Lunch" && <UtensilsCrossed className="h-4 w-4 text-blue-500" />}
                {meal.type === "Dinner" && <UtensilsCrossed className="h-4 w-4 text-purple-500" />}
                {meal.type === "Snack" && <Apple className="h-4 w-4 text-green-500" />}
                <div>
                  <p className="font-medium">{meal.food}</p>
                  <p className="text-xs text-muted-foreground">{meal.type}</p>
                </div>
              </div>
              {meal.calories && <Badge variant="secondary">{meal.calories} cal</Badge>}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMeal(meal.id)}
                data-testid={`button-delete-meal-${meal.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Nutrition Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyNutrition}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))" 
                }}
              />
              <Line type="monotone" dataKey="nutrients" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Balance %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-accent/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">💡 Add more fruits today 🍎</p>
          <p className="text-sm text-muted-foreground mt-2">🐾 Yum! Those meals look healthy!</p>
        </CardContent>
      </Card>
    </div>
  );
}
