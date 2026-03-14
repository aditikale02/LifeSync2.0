import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, MessageCircle, Heart, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weeklyInteractions = [
  { day: "Mon", count: 3 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 2 },
  { day: "Thu", count: 4 },
  { day: "Fri", count: 6 },
  { day: "Sat", count: 8 },
  { day: "Sun", count: 5 },
];

interface Interaction {
  id: string;
  person: string;
  feeling: string;
  date: string;
}

export default function SocialPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([
    { id: "1", person: "Best friend", feeling: "Happy and energized", date: "Today" },
  ]);
  const [person, setPerson] = useState("");
  const [feeling, setFeeling] = useState("");

  const addInteraction = () => {
    if (person && feeling) {
      setInteractions([...interactions, {
        id: Date.now().toString(),
        person,
        feeling,
        date: "Today"
      }]);
      setPerson("");
      setFeeling("");
    }
  };

  const totalInteractions = weeklyInteractions.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Social Dashboard</h1>
        <p className="text-muted-foreground">Maintain healthy social connections</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalInteractions}</div>
            <p className="text-sm text-muted-foreground mt-1">Social interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">92%</div>
            <p className="text-sm text-muted-foreground mt-1">Social wellness</p>
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person">Who did you interact with?</Label>
            <Input
              id="person"
              placeholder="e.g., Friend, Family, Colleague..."
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              data-testid="input-person"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feeling">How did it make you feel?</Label>
            <Textarea
              id="feeling"
              placeholder="Describe your feelings after this interaction..."
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              data-testid="textarea-feeling"
            />
          </div>

          <Button onClick={addInteraction} className="w-full" data-testid="button-log-interaction">
            <Plus className="h-4 w-4 mr-2" />
            Log Interaction
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Interactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="p-4 rounded-lg border hover-elevate"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{interaction.person}</p>
                <span className="text-xs text-muted-foreground">{interaction.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{interaction.feeling}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Interaction Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyInteractions}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))" 
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-gray-800 dark:to-pink-900">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">
            🐾 {interactions.length === 0 
              ? "Haven't talked to anyone today? A small 'hi' can brighten a day 🌞" 
              : "Great job staying connected! Social bonds matter 💕"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
