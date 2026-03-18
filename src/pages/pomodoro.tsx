import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createWellnessRecord, fetchWellnessRecords } from "@/lib/wellness-api";

type PomodoroSessionRecord = {
  id: string;
  userId: string;
  durationMinutes: number;
  sessionType: "focus" | "break";
  completed: boolean;
  startedAt: string;
  createdAt: string;
};

export default function PomodoroPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);

  const loadPomodoroStats = async (userId: string) => {
    const records = await fetchWellnessRecords<PomodoroSessionRecord>("pomodoro_sessions", userId);
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayRecords = records.filter((record) => String(record.createdAt ?? "").slice(0, 10) === todayKey);
    const focusRecords = todayRecords.filter((record) => record.sessionType === "focus" && record.completed);

    setTodaySessions(focusRecords.length);
    setTodayFocusMinutes(focusRecords.reduce((sum, record) => sum + Number(record.durationMinutes ?? 0), 0));
  };

  useEffect(() => {
    if (!user?.id) return;
    void loadPomodoroStats(user.id).catch(() => {
      setTodaySessions(0);
      setTodayFocusMinutes(0);
    });
  }, [user?.id]);

  const persistSession = async (durationMinutes: number, sessionType: "focus" | "break") => {
    if (!user?.id) return;

    await createWellnessRecord("pomodoro_sessions", {
      user_id: user.id,
      duration: durationMinutes,
      session_type: sessionType,
      completed: true,
      started_at: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
    });

    await loadPomodoroStats(user.id);
    window.dispatchEvent(new CustomEvent("wellness:data-updated", { detail: { table: "pomodoro_sessions" } }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            const completedBreak = isBreak;
            setIsActive(false);
            setIsBreak(!isBreak);
            setMinutes(isBreak ? 25 : 5);

            const completedType = completedBreak ? "break" : "focus";
            const completedDuration = completedBreak ? 5 : 25;

            void persistSession(completedDuration, completedType).catch(() => {
              toast({
                title: "Could not save session",
                description: "Your timer completed, but saving failed. Please try again.",
                variant: "destructive",
              });
            });

            toast({
              title: completedBreak ? "Break ended" : "Focus session complete",
              description: completedBreak ? "Back to work mode." : "Take a short break and reset.",
            });
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak]);

  const toggle = () => setIsActive(!isActive);
  
  const reset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
        <p className="text-muted-foreground">Stay focused with timed work sessions</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {todaySessions} focus session{todaySessions !== 1 ? "s" : ""} today · {todayFocusMinutes} min logged
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {isBreak ? "Break Time 🌿" : "Focus Session 🎯"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-7xl font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={toggle} size="lg" data-testid="button-toggle-timer">
              {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={reset} variant="outline" size="lg" data-testid="button-reset-timer">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>

          <p className="text-sm text-muted-foreground italic">
            {isActive 
              ? "You're doing great! Keep going 🐾" 
              : "Ready to focus? Start your session!"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
