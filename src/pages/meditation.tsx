import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Pause } from "lucide-react";

export default function MeditationPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(10);

  const sounds = [
    { name: "Ocean Waves", emoji: "🌊" },
    { name: "Rain Forest", emoji: "🌧️" },
    { name: "Gentle Wind", emoji: "💨" },
    { name: "Bird Songs", emoji: "🐦" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Meditation</h1>
        <p className="text-muted-foreground">Find your inner peace</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Brain className="h-6 w-6 text-purple-500" />
            Guided Meditation Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{duration} min</div>
            <p className="text-muted-foreground">Session Duration</p>
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

          <div className="grid grid-cols-2 gap-4">
            {sounds.map((sound) => (
              <Button
                key={sound.name}
                variant="outline"
                className="h-20 flex flex-col gap-2"
                data-testid={`button-sound-${sound.name.toLowerCase().replace(' ', '-')}`}
                onClick={() => console.log(`Playing ${sound.name}`)}
              >
                <span className="text-2xl">{sound.emoji}</span>
                <span className="text-sm">{sound.name}</span>
              </Button>
            ))}
          </div>

          <Button
            className="w-full h-14"
            size="lg"
            onClick={() => setIsPlaying(!isPlaying)}
            data-testid="button-start-meditation"
          >
            {isPlaying ? (
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
