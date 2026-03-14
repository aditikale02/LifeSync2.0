import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Book, Plus, Clock, CheckCircle2, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weeklyStudyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.0 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 4.0 },
  { day: "Fri", hours: 2.0 },
  { day: "Sat", hours: 3.5 },
  { day: "Sun", hours: 2.5 },
];

interface Topic {
  id: string;
  name: string;
  hours: number;
  completed: boolean;
}

export default function StudyPage() {
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", name: "Mathematics - Calculus", hours: 5.5, completed: false },
    { id: "2", name: "Physics - Quantum Mechanics", hours: 3.0, completed: true },
  ]);
  const [newTopic, setNewTopic] = useState("");
  const [streak, setStreak] = useState(7);

  const totalHours = weeklyStudyData.reduce((sum, day) => sum + day.hours, 0);
  const productivity = Math.round((topics.filter(t => t.completed).length / topics.length) * 100) || 0;

  const addTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, { id: Date.now().toString(), name: newTopic, hours: 0, completed: false }]);
      setNewTopic("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Study Dashboard</h1>
        <p className="text-muted-foreground">Track your focused study sessions and productivity</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Total study time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak} days</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productivity}%</div>
            <p className="text-xs text-muted-foreground mt-1">Topics completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Study Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyStudyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))" 
                }}
              />
              <Bar dataKey="hours" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-blue-500" />
            Study Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new topic or subject..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTopic()}
              data-testid="input-new-topic"
            />
            <Button onClick={addTopic} data-testid="button-add-topic">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
              >
                <div className="flex-1">
                  <p className={topic.completed ? "line-through text-muted-foreground" : ""}>
                    {topic.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{topic.hours}h studied</p>
                </div>
                {topic.completed && <Badge variant="secondary">Completed</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">🐾 Focus time activated! You got this 💪</p>
        </CardContent>
      </Card>
    </div>
  );
}
