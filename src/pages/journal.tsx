import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, fetchWellnessRecords } from "@/lib/wellness-api";

const moodEmojis = ["😊", "😔", "😡", "😴", "🤔", "😌", "🥳", "😐"];

type JournalRecord = { title: string; body: string; moodEmoji: string; wordCount: number; createdAt: string };

export default function JournalPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [pastEntries, setPastEntries] = useState<JournalRecord[]>([]);

  const loadEntries = (uid: string) => {
    fetchWellnessRecords<JournalRecord>("journal_entries", uid)
      .then(records => setPastEntries(records))
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.id) loadEntries(user.id);
  }, [user?.id]);

  const handleEntryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEntry(text);
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  };

  const handleSave = async () => {
    if (!title.trim() || !entry.trim()) {
      toast({
        title: "Title and entry required",
        description: "Please add a title and write your entry before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (user?.id) {
        await createWellnessRecord("journal_entries", {
          userId: user.id,
          title: title.trim(),
          body: entry.trim(),
          moodEmoji: selectedMood || null,
          wordCount,
        });
        loadEntries(user.id);
      }

      toast({ title: "Journal saved", description: "Your entry now contributes to emotional trends and AI insights." });
      setTitle("");
      setEntry("");
      setSelectedMood("");
      setWordCount(0);
    } catch {
      toast({ title: "Could not save journal", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Journal Dashboard</h1>
        <p className="text-muted-foreground">A personal space for emotional reflection and writing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Today's Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your entry a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-journal-title"
              />
            </div>

            <div className="space-y-2">
              <Label>Mood Tag</Label>
              <div className="flex gap-2 flex-wrap">
                {moodEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedMood(emoji)}
                    className={`text-3xl p-2 rounded-lg transition-transform hover:scale-110 ${
                      selectedMood === emoji ? "bg-accent" : ""
                    }`}
                    data-testid={`button-mood-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry">Your Thoughts</Label>
              <Textarea
                id="entry"
                placeholder="Tell me about your day... I'm listening 🐾"
                value={entry}
                onChange={handleEntryChange}
                className="min-h-[300px] resize-none"
                data-testid="textarea-journal-entry"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{wordCount} words</span>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" data-testid="button-save-journal">
              <Save className="h-4 w-4 mr-2" />
              Save Entry
            </Button>

            {entry.length > 50 && (
              <div className="bg-accent/20 p-4 rounded-lg text-center">
                <p className="text-sm italic">Writing helps heal the mind 💌</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          {pastEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Recent Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastEntries.slice(0, 5).map((e, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-1 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{e.title}</p>
                      {e.moodEmoji && <span className="text-lg">{e.moodEmoji}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground line-clamp-1">{e.body?.slice(0, 60)}{(e.body?.length ?? 0) > 60 ? "…" : ""}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{e.wordCount ?? 0}w</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{new Date(e.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
