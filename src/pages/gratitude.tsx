import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Sparkles, MessageCircleHeart, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, deleteWellnessRecord, fetchWellnessRecords } from "@/lib/wellness-api";

const categories = ["Health", "Family", "Nature", "Work", "Friends", "Self"];
const emojis = ["🌸", "❤️", "🌟", "🌈", "☀️", "💫", "🌺", "🦋", "🍄", "🏡", "📖", "🚲"];

interface GratitudeEntry {
  id: string;
  text: string;
  emoji: string;
  category: string;
  date: string;
}

export default function GratitudePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🌸");
  const [selectedCategory, setSelectedCategory] = useState("Nature");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchWellnessRecords<{ text: string; emoji: string; category: string; createdAt: string }>("gratitude_entries", user.id)
      .then(records => {
        const today = new Date().toISOString().slice(0, 10);
        const loaded: GratitudeEntry[] = records.map(r => ({
          id: String((r as Record<string, unknown>).id ?? Date.now()),
          text: r.text ?? "",
          emoji: r.emoji ?? "🌸",
          category: r.category ?? "Nature",
          date: String(r.createdAt ?? "").slice(0, 10) === today
            ? "Today"
            : new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        }));
        setEntries(loaded);
      })
      .catch((error: unknown) => {
        console.error("[LifeSync] Failed to load gratitude entries:", error);
        toast({
          title: "Could not load gratitude entries",
          description: "Please refresh or sign in again.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [user?.id, toast]);

  const addEntry = async () => {
    if (!newEntry.trim()) {
      toast({ title: "Write something!", description: "What are you grateful for?", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const previousEntries = entries;

    try {
      const entry: GratitudeEntry = {
        id: Date.now().toString(),
        text: newEntry,
        emoji: selectedEmoji,
        category: selectedCategory,
        date: "Today"
      };

      setEntries([entry, ...previousEntries]);

      if (user?.id) {
        await createWellnessRecord("gratitude_entries", {
          userId: user.id,
          text: newEntry.trim(),
          emoji: selectedEmoji,
          category: selectedCategory,
        });
        // Refresh list from server
        const today = new Date().toISOString().slice(0, 10);
        fetchWellnessRecords<{ text: string; emoji: string; category: string; createdAt: string }>("gratitude_entries", user.id)
          .then(records => {
            const loaded: GratitudeEntry[] = records.map(r => ({
              id: String((r as Record<string, unknown>).id ?? Date.now()),
              text: r.text ?? "",
              emoji: r.emoji ?? "🌸",
              category: r.category ?? "Nature",
              date: String(r.createdAt ?? "").slice(0, 10) === today ? "Today"
                : new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            }));
            setEntries(loaded);
          })
          .catch((error: unknown) => {
            console.error("[LifeSync] Failed to refresh gratitude entries:", error);
          });
      }
      setNewEntry("");
      setIsSaving(false);
      toast({
        title: "Gratitude Logged 💖",
        description: "Focusing on the good attracts more good.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setEntries(previousEntries);
      setIsSaving(false);
      toast({
        title: "Could not save gratitude entry",
        description: message,
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (id: string) => {
    const previousEntries = entries;
    setEntries(entries.filter(e => e.id !== id));

    try {
      await deleteWellnessRecord("gratitude_entries", id);
      toast({ title: "Entry Removed", description: "Your memory is preserved in your heart." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setEntries(previousEntries);
      toast({ title: "Could not remove entry", description: message, variant: "destructive" });
    }
  };

  const todayEntries = entries.filter(e => e.date === "Today");
  const randomMemory = entries.length > 0 ? entries[Math.floor(Math.random() * entries.length)] : null;

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-rose-500" />
            Gratitude Dashboard
          </h1>
          <p className="text-muted-foreground">Appreciate the small joys in life to attract more abundance.</p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 px-4 py-2 rounded-full border border-rose-100 dark:border-rose-900">
           <Sparkles className="h-4 w-4 text-rose-400" />
           <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Grateful Mindset</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-gray-950">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg">Add Gratitude</CardTitle>
            <CardDescription>What's a small win today?</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose an emoji</label>
              <div className="flex gap-2 flex-wrap">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-xl transition-all hover:bg-muted/50 ${
                      selectedEmoji === emoji ? "bg-rose-100 dark:bg-rose-900/30 scale-110 ring-2 ring-rose-200" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1 text-xs ${selectedCategory === cat ? 'bg-rose-500 hover:bg-rose-600' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="I am grateful for..."
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEntry()}
                className="h-12 border-rose-100 focus:border-rose-300"
              />
              <Button onClick={addEntry} disabled={isSaving || todayEntries.length >= 3} className="h-12 bg-rose-500 hover:bg-rose-600 shadow-lg px-6">
                {isSaving ? "Saving..." : <Plus className="h-5 w-5" />}
              </Button>
            </div>
            
            {todayEntries.length >= 3 && (
               <p className="text-xs text-center text-green-600 font-medium">Daily goal reached! Keep it up. ✨</p>
            )}
          </CardContent>
        </Card>

        {randomMemory && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="h-full border-none shadow-md bg-gradient-to-br from-yellow-50 to-rose-50 dark:from-gray-900 dark:to-rose-950/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <MessageCircleHeart className="h-24 w-24" />
                 </div>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-600">
                       <Sparkles className="h-5 w-5" />
                       Memory Lane
                    </CardTitle>
                    <CardDescription>A random moment of joy from your past</CardDescription>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <span className="text-6xl filter saturate-[1.2] drop-shadow-md group-hover:scale-110 transition-transform">{randomMemory.emoji}</span>
                    <p className="text-2xl font-black text-rose-900 dark:text-rose-100 italic leading-snug">
                       "{randomMemory.text}"
                    </p>
                    <Badge variant="secondary" className="bg-rose-100/50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                       <Calendar className="h-3 w-3" /> {randomMemory.date} • {randomMemory.category}
                    </Badge>
                 </CardContent>
              </Card>
            </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black flex items-center gap-2">
           Journal Timeline
           <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded ml-2">{entries.length} Entries</span>
        </h2>

        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <EmptyState 
               icon={MessageCircleHeart}
               title="Heart is empty"
               description="Logging gratitude daily has been scientifically proven to increase happiness. Start with one thing you liked about today."
               actionText="Write First Entry"
               onAction={() => document.querySelector('input')?.focus()}
            />
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex items-start gap-5 p-6 bg-card border rounded-2xl hover:shadow-lg transition-all hover:bg-rose-50/20 dark:hover:bg-rose-950/10"
                >
                  <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                     {entry.emoji}
                  </div>
                  <div className="flex-1 space-y-2">
                     <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-rose-500 border-rose-100">{entry.category}</Badge>
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                     </div>
                     <p className="font-bold text-lg leading-snug tracking-tight">{entry.text}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition-all rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
