import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState({
    experience: "",
    suggestions: "",
    favorite: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback submitted", { rating, ...feedback });
    window.open("https://forms.google.com/", "_blank");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Feedback</h1>
        <p className="text-muted-foreground">Your feedback helps me grow too! 🐾</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Experience</CardTitle>
          <CardDescription>
            Tell us what you loved and what we can improve 🌷
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Rate Your Experience</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    data-testid={`button-star-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">How was your experience?</Label>
              <Textarea
                id="experience"
                placeholder="Tell us about your overall experience..."
                value={feedback.experience}
                onChange={(e) => setFeedback({ ...feedback, experience: e.target.value })}
                data-testid="textarea-experience"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favorite">What's your favorite feature?</Label>
              <Input
                id="favorite"
                placeholder="e.g., Meditation dashboard, Cat companion..."
                value={feedback.favorite}
                onChange={(e) => setFeedback({ ...feedback, favorite: e.target.value })}
                data-testid="input-favorite"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions">Suggestions for improvement</Label>
              <Textarea
                id="suggestions"
                placeholder="What can we do better?"
                value={feedback.suggestions}
                onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
                data-testid="textarea-suggestions"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" data-testid="button-submit-feedback">
              Submit Google Form
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
