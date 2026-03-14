import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            setIsBreak(!isBreak);
            setMinutes(isBreak ? 25 : 5);
            console.log(isBreak ? "Break ended! Back to work" : "Session complete! Take a break");
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
