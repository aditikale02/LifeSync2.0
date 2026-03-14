import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { Brain, Sun, Heart, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weeklyData = [
  { day: "Mon", mental: 75, physical: 82, social: 68 },
  { day: "Tue", mental: 78, physical: 85, social: 72 },
  { day: "Wed", mental: 82, physical: 80, social: 75 },
  { day: "Thu", mental: 80, physical: 88, social: 70 },
  { day: "Fri", mental: 85, physical: 86, social: 78 },
  { day: "Sat", mental: 88, physical: 90, social: 85 },
  { day: "Sun", mental: 86, physical: 87, social: 82 },
];

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Health Dashboard</h1>
        <p className="text-muted-foreground">Track your physical, mental, and social well-being</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Brain className="h-5 w-5 text-purple-500" />
              Mental Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressRing progress={84} color="hsl(280, 70%, 65%)" />
            <p className="text-sm text-muted-foreground text-center">Based on mood & mindfulness</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Sun className="h-5 w-5 text-yellow-500" />
              Physical Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressRing progress={86} color="hsl(45, 90%, 60%)" />
            <p className="text-sm text-muted-foreground text-center">Based on activity & sleep</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Heart className="h-5 w-5 text-pink-500" />
              Social Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressRing progress={76} color="hsl(320, 75%, 65%)" />
            <p className="text-sm text-muted-foreground text-center">Based on interactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Weekly Health Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))" 
                }}
              />
              <Line type="monotone" dataKey="mental" stroke="hsl(280, 70%, 65%)" strokeWidth={2} name="Mental" />
              <Line type="monotone" dataKey="physical" stroke="hsl(45, 90%, 60%)" strokeWidth={2} name="Physical" />
              <Line type="monotone" dataKey="social" stroke="hsl(320, 75%, 65%)" strokeWidth={2} name="Social" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-accent/20">
        <CardContent className="p-6">
          <p className="text-sm italic text-center">
            💡 <strong>Tip:</strong> You haven't socialized much lately — try talking to a friend today!
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            🐾 Your energy feels balanced today 🌼 Keep it up!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
