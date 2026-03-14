import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon as MoonIcon, Sun, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weeklySleep = [
  { day: "Mon", hours: 7.5 },
  { day: "Tue", hours: 6.5 },
  { day: "Wed", hours: 7.0 },
  { day: "Thu", hours: 6.0 },
  { day: "Fri", hours: 8.0 },
  { day: "Sat", hours: 9.0 },
  { day: "Sun", hours: 8.5 },
];

export default function SleepPage() {
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");

  const calculateSleepHours = () => {
    const bed = new Date(`2000-01-01 ${bedtime}`);
    let wake = new Date(`2000-01-01 ${wakeTime}`);
    if (wake < bed) wake = new Date(`2000-01-02 ${wakeTime}`);
    const diff = wake.getTime() - bed.getTime();
    return (diff / (1000 * 60 * 60)).toFixed(1);
  };

  const avgSleep = (weeklySleep.reduce((sum, d) => sum + d.hours, 0) / weeklySleep.length).toFixed(1);

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
                <MoonIcon className="h-4 w-4" />
                Bedtime
              </Label>
              <Input
                id="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                data-testid="input-bedtime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waketime" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Wake Time
              </Label>
              <Input
                id="waketime"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                data-testid="input-waketime"
              />
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{calculateSleepHours()}h</div>
              <p className="text-sm text-muted-foreground">Total sleep</p>
            </div>

            <Button className="w-full" data-testid="button-log-sleep">
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
                <div className="text-2xl font-bold">86%</div>
                <p className="text-xs text-muted-foreground">Quality score</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Sleep Consistency</p>
              <div className="flex gap-1">
                {weeklySleep.map((day, i) => (
                  <div
                    key={day.day}
                    className="flex-1 bg-accent/20 rounded-t-md"
                    style={{ height: `${day.hours * 12}px` }}
                    title={`${day.day}: ${day.hours}h`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Sleep Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklySleep}>
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))" 
                }}
              />
              <Area type="monotone" dataKey="hours" stroke="hsl(var(--chart-5))" fillOpacity={1} fill="url(#sleepGradient)" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 bg-accent/20 p-4 rounded-lg text-center">
            <p className="text-sm italic">💡 You slept better on weekends — aim for consistency!</p>
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
