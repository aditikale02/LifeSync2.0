import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wind, Play, Pause, Music } from "lucide-react";

const exercises = [
  "Name 3 things you can see around you",
  "Name 2 things you can hear right now",
  "Name 1 thing you can touch",
  "What made you smile today?",
  "What's something you're looking forward to?",
];

const breathingPhases = ["Inhale", "Hold", "Exhale", "Hold"];
const phaseDurations = [4, 2, 4, 2]; // seconds

export default function MindfulnessPage() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timer, setTimer] = useState(4);
  const [reflection, setReflection] = useState("");
  const [todayExercise] = useState(exercises[Math.floor(Math.random() * exercises.length)]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isBreathing) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCurrentPhase((phase) => (phase + 1) % 4);
            return phaseDurations[(currentPhase + 1) % 4];
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing, currentPhase]);

  const getCircleSize = () => {
    const phase = breathingPhases[currentPhase];
    if (phase === "Inhale") return "scale-150";
    if (phase === "Exhale") return "scale-75";
    return "scale-100";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mindfulness Dashboard</h1>
        <p className="text-muted-foreground">Promote awareness, calmness, and relaxation</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Wind className="h-5 w-5 text-blue-500" />
            Guided Breathing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div
                className={`absolute w-32 h-32 rounded-full bg-primary/30 transition-transform duration-[3000ms] ease-in-out ${getCircleSize()}`}
              />
              <div className="relative z-10 text-center">
                <div className="text-2xl font-bold">{breathingPhases[currentPhase]}</div>
                <div className="text-4xl font-bold mt-2">{timer}s</div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => {
                setIsBreathing(!isBreathing);
                if (!isBreathing) {
                  setCurrentPhase(0);
                  setTimer(4);
                }
              }}
              data-testid="button-toggle-breathing"
            >
              {isBreathing ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Breathing Exercise
                </>
              )}
            </Button>
          </div>

          {isBreathing && (
            <div className="text-center text-sm italic animate-in fade-in">
              🐾 Take a deep breath, hold... exhale 🌿 Feel the peace.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mindfulness Exercise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-accent/20 rounded-lg">
              <p className="text-lg font-medium text-center">{todayExercise}</p>
            </div>
            <p className="text-sm text-muted-foreground text-center italic">
              Take a moment to reflect on this question
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-500" />
              Meditation Music
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" data-testid="button-music-nature">
              🌊 Ocean Waves
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-music-rain">
              🌧️ Gentle Rain
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-music-forest">
              🌲 Forest Sounds
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-music-birds">
              🐦 Bird Songs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What made you smile today?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[120px]"
            data-testid="textarea-reflection"
          />
          <Button className="w-full" data-testid="button-save-reflection">
            Save Reflection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
