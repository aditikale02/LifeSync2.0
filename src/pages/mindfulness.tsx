import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wind, Play, Pause, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMeditationSession } from "@/hooks/use-meditation-session";
import { meditationSounds } from "@/lib/meditation-sounds";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, fetchWellnessRecords } from "@/lib/wellness-api";

const exercises = [
  "Name 3 things you can see around you",
  "Name 2 things you can hear right now",
  "Name 1 thing you can touch",
  "What made you smile today?",
  "What's something you're looking forward to?",
];

const breathingPhases = ["Inhale", "Hold", "Exhale", "Hold"];
const phaseDurations = [4, 2, 4, 2]; // seconds

type MindfulnessRecord = { duration: number; createdAt: string };

export default function MindfulnessPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timer, setTimer] = useState(4);
  const [reflection, setReflection] = useState("");
  const [sessionDuration, setSessionDuration] = useState(5);
  const [todayExercise] = useState(exercises[Math.floor(Math.random() * exercises.length)]);
  const [weeklySessions, setWeeklySessions] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);

  const loadMindfulnessStats = (userId: string) => {
    fetchWellnessRecords<MindfulnessRecord>("mindfulness_sessions", userId)
      .then((records) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const recent = records.filter((record) => new Date(record.createdAt) >= cutoff);
        setWeeklySessions(recent.length);
        setWeeklyMinutes(recent.reduce((sum, record) => sum + Number(record.duration ?? 0), 0));
      })
      .catch(() => {
        setWeeklySessions(0);
        setWeeklyMinutes(0);
      });
  };

  useEffect(() => {
    if (!user?.id) return;
    loadMindfulnessStats(user.id);
  }, [user?.id]);
  const {
    formattedRemainingTime,
    isSessionActive,
    selectedSoundId,
    selectSound,
    startSession,
    stopSession,
  } = useMeditationSession({
    sounds: meditationSounds,
    onSessionComplete: () => {
      if (user?.id) {
        void createWellnessRecord("mindfulness_sessions", {
          userId: user.id,
          duration: sessionDuration,
          soundId: selectedSoundId,
          phaseCycles: 0,
          completed: true,
          startedAt: new Date().toISOString(),
        })
          .then(() => loadMindfulnessStats(user.id))
          .catch(() => undefined);
      }

      setIsBreathing(false);
      setCurrentPhase(0);
      setTimer(phaseDurations[0]);
      toast({
        title: "Meditation session complete",
        description: "Time is over. Keep that calm with you for the rest of the day.",
      });
    },
  });

  useEffect(() => {
    let interval: number | null = null;

    if (isBreathing) {
      interval = window.setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            let nextPhase = 0;

            setCurrentPhase((phase) => {
              nextPhase = (phase + 1) % breathingPhases.length;
              return nextPhase;
            });

            return phaseDurations[nextPhase];
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

  const handleToggleBreathing = async () => {
    if (isBreathing) {
      setIsBreathing(false);
      setCurrentPhase(0);
      setTimer(phaseDurations[0]);
      stopSession();
      return;
    }

    setCurrentPhase(0);
    setTimer(phaseDurations[0]);
    setIsBreathing(true);
    await startSession(sessionDuration);
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
                className={`absolute w-32 h-32 rounded-full bg-primary/30 transition-transform ease-in-out ${getCircleSize()}`}
                style={{ transitionDuration: "3000ms" }}
              />
              <div className="relative z-10 text-center">
                <div className="text-2xl font-bold">{breathingPhases[currentPhase]}</div>
                <div className="text-4xl font-bold mt-2">{timer}s</div>
                <div className="mt-3 text-sm font-medium text-muted-foreground">
                  {isSessionActive ? `${formattedRemainingTime} remaining` : `${sessionDuration} min session`}
                </div>
                <div className="mt-1 text-xs text-muted-foreground" data-testid="text-mindfulness-weekly-stats">
                  {weeklySessions} session{weeklySessions !== 1 ? "s" : ""} • {weeklyMinutes} min this week
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[5, 10, 15, 20].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant={sessionDuration === minutes ? "default" : "outline"}
                  onClick={() => setSessionDuration(minutes)}
                  data-testid={`button-mindfulness-duration-${minutes}`}
                >
                  {minutes} min
                </Button>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => void handleToggleBreathing()}
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
            {meditationSounds.map((sound) => (
              <Button
                key={sound.id}
                variant="outline"
                className={cn(
                  "w-full justify-start",
                  selectedSoundId === sound.id && "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-200",
                )}
                data-testid={`button-music-${sound.id}`}
                onClick={() => void selectSound(sound.id)}
              >
                {sound.emoji} {sound.name}
              </Button>
            ))}
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
          <Button
            variant="outline"
            className="w-full"
            data-testid="button-save-reflection-log"
            onClick={() => {
              if (!user?.id || !reflection.trim()) return;
              void createWellnessRecord("journal_entries", {
                userId: user.id,
                title: "Mindfulness Reflection",
                body: reflection.trim(),
                moodEmoji: null,
                wordCount: reflection.trim().split(/\s+/).filter(Boolean).length,
              })
                .then(() => {
                  toast({
                    title: "Reflection saved",
                    description: "Your reflection now contributes to emotional insights.",
                  });
                })
                .catch(() => {
                  toast({
                    title: "Could not save reflection",
                    description: "Please try again.",
                    variant: "destructive",
                  });
                });
            }}
          >
            Save Reflection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
