import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { BookOpen, Save } from "lucide-react";

const moodEmojis = ["😊", "😔", "😡", "😴", "🤔", "😌", "🥳", "😐"];

export default function JournalPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const handleEntryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEntry(text);
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  };

  const handleSave = () => {
    console.log("Saving journal entry", { date, title, entry, mood: selectedMood });
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
                <span>Auto-saved</span>
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

        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
