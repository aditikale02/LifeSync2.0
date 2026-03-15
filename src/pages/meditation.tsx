import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMeditationSession } from "@/hooks/use-meditation-session";
import { meditationSounds } from "@/lib/meditation-sounds";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, fetchWellnessRecords } from "@/lib/wellness-api";

type MeditationRecord = { duration: number; createdAt: string };

export default function MeditationPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [duration, setDuration] = useState(10);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [weeklySessions, setWeeklySessions] = useState(0);

  const loadMeditationStats = (userId: string) => {
    fetchWellnessRecords<MeditationRecord>("meditation_sessions", userId)
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
    loadMeditationStats(user.id);
  }, [user?.id]);
  const {
    formattedRemainingTime,
    isSessionActive,
    selectedSoundId,
    selectSound,
    toggleSession,
  } = useMeditationSession({
    sounds: meditationSounds,
    onSessionComplete: () => {
      if (user?.id) {
        void createWellnessRecord("meditation_sessions", {
          userId: user.id,
          duration,
          soundId: selectedSoundId,
          completed: true,
          startedAt: new Date().toISOString(),
        })
          .then(() => loadMeditationStats(user.id))
          .catch(() => undefined);
      }

      toast({
        title: "Meditation session complete",
        description: "Time is over. Take a moment before returning to your day.",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Meditation</h1>
        <p className="text-muted-foreground">Find your inner peace</p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Brain className="h-6 w-6 text-purple-500" />
            Guided Meditation Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold sm:text-5xl">
              {isSessionActive ? formattedRemainingTime : `${duration} min`}
            </div>
            <p className="text-muted-foreground">
              {isSessionActive ? "Time remaining" : "Session Duration"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground" data-testid="text-meditation-weekly-stats">
              {weeklySessions} session{weeklySessions !== 1 ? "s" : ""} • {weeklyMinutes} min this week
            </p>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {[5, 10, 15, 20].map((min) => (
              <Button
                key={min}
                variant={duration === min ? "default" : "outline"}
                onClick={() => setDuration(min)}
                data-testid={`button-duration-${min}`}
              >
                {min} min
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4">
            {meditationSounds.map((sound) => (
              <Button
                key={sound.id}
                variant="outline"
                className={cn(
                  "flex h-20 flex-col gap-2 px-3 transition-colors",
                  selectedSoundId === sound.id && "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-200",
                )}
                data-testid={`button-sound-${sound.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => void selectSound(sound.id)}
              >
                <span className="text-2xl">{sound.emoji}</span>
                <span className="text-sm">{sound.name}</span>
              </Button>
            ))}
          </div>

          <Button
            className="w-full h-14"
            size="lg"
            onClick={() => void toggleSession(duration)}
            data-testid="button-start-meditation"
          >
            {isSessionActive ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause Session
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start Meditation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
