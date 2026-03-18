import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RotateCcw } from "lucide-react";

type GameCard = {
  id: string;
  symbol: string;
  matched: boolean;
};

const symbols = ["🧠", "🌿", "💧", "😌", "⭐", "🎯"];

function buildDeck() {
  const deck = [...symbols, ...symbols]
    .map((symbol, index) => ({ id: `${symbol}-${index}`, symbol, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

export default function GamesPage() {
  const [deck, setDeck] = useState<GameCard[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const allMatched = useMemo(() => deck.every((card) => card.matched), [deck]);

  const resetGame = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMoves(0);
    setBusy(false);
  };

  const handleFlip = (cardId: string) => {
    if (busy || flipped.includes(cardId)) return;

    const currentCard = deck.find((card) => card.id === cardId);
    if (!currentCard || currentCard.matched) return;

    const nextFlipped = [...flipped, cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length < 2) return;

    setMoves((prev) => prev + 1);
    const [first, second] = nextFlipped
      .map((id) => deck.find((card) => card.id === id))
      .filter(Boolean) as GameCard[];

    if (first.symbol === second.symbol) {
      setDeck((current) =>
        current.map((card) =>
          card.id === first.id || card.id === second.id ? { ...card, matched: true } : card,
        ),
      );
      setFlipped([]);
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      setFlipped([]);
      setBusy(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mind Games</h1>
        <p className="text-muted-foreground">Play an in-app memory match challenge to sharpen your focus.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" /> Memory Match
          </CardTitle>
          <Button variant="outline" size="sm" onClick={resetGame} data-testid="button-reset-memory-game">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Moves: {moves}</span>
            <span>{allMatched ? "Completed 🎉" : "Find all matching pairs"}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {deck.map((card) => {
              const visible = card.matched || flipped.includes(card.id);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleFlip(card.id)}
                  disabled={card.matched || busy}
                  className={`h-20 rounded-xl border text-3xl transition-all ${
                    visible
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card hover:bg-muted/50"
                  }`}
                  data-testid={`card-memory-${card.id}`}
                  aria-label="Memory game card"
                >
                  {visible ? card.symbol : "❔"}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm italic">
            Time to refresh your mind 🧠 Complete the board and come back recharged 🎮
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
