import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Puzzle, Grid3x3, Hash } from "lucide-react";

const games = [
  { 
    name: "Memory Match", 
    icon: Brain, 
    color: "text-purple-500",
    url: "https://www.google.com/search?q=memory+game"
  },
  { 
    name: "Puzzle", 
    icon: Puzzle, 
    color: "text-blue-500",
    url: "https://www.google.com/search?q=online+puzzle+game"
  },
  { 
    name: "Sudoku", 
    icon: Grid3x3, 
    color: "text-green-500",
    url: "https://www.google.com/search?q=sudoku+game"
  },
  { 
    name: "Word Search", 
    icon: Hash, 
    color: "text-pink-500",
    url: "https://www.google.com/search?q=word+search+game"
  },
];

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mind Games</h1>
        <p className="text-muted-foreground">Refresh your mind with fun brain games</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <Card 
            key={game.name}
            className="hover-elevate cursor-pointer transition-transform hover:scale-105"
            onClick={() => window.open(game.url, '_blank')}
            data-testid={`card-game-${game.name.toLowerCase().replace(' ', '-')}`}
          >
            <CardHeader>
              <CardTitle className="flex flex-col items-center gap-4 text-center">
                <game.icon className={`h-12 w-12 ${game.color}`} />
                {game.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Click to play
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-accent/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">
            Time to refresh your mind 🧠 Play a quick game and come back recharged 🎮
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
