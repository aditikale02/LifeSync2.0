import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Sparkles, TrendingUp, AlertCircle, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface AIInsightRecord {
  id?: string;
  user_id?: string;
  summary: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  wellness_score: number;
  generated_at?: string;
}

export default function AiInsightsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insight, setInsight] = useState<AIInsightRecord | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const generateInsights = async () => {
    setIsGenerating(true);
    setInsight(null);

    try {
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to generate personalized AI insights.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      const response = await fetch(`/api/ai-insights/${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to generate insights.");
      }

      setInsight(data);
      
      toast({
        title: "Insights Generated! 🎉",
        description: "Your personalized weekly wellness report is ready.",
      });

    } catch (err: any) {
      console.error(err);
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-indigo-500" />
          AI Wellness Insights
        </h1>
        <p className="text-muted-foreground">
          Personalized recommendations based on your weekly activity, mood, sleep, and habits.
        </p>
      </div>

      {!insight && !isGenerating ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-dashed">
          <Sparkles className="h-16 w-16 text-indigo-400 mb-4 opacity-80" />
          <h2 className="text-xl font-semibold mb-2">Ready to analyze your week?</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Our AI will securely analyze your logged activities across all dashboards for the last 7 days to generate a personalized wellness plan.
          </p>
          <Button size="lg" onClick={generateInsights} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <BrainCircuit className="mr-2 h-5 w-5" />
            Generate Weekly Insights
          </Button>
        </Card>
      ) : isGenerating ? (
        <Card className="p-12">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/20 animate-pulse"></div>
              <BrainCircuit className="h-16 w-16 text-indigo-500 animate-bounce relative z-10" />
            </div>
            <div className="space-y-2 text-center w-full max-w-md">
              <h3 className="font-semibold text-lg animate-pulse">Analyzing your wellness data...</h3>
              <Progress value={undefined} className="h-2 w-full bg-indigo-100 dark:bg-indigo-950 [&>div]:bg-indigo-500" />
              <p className="text-sm text-muted-foreground">Cross-referencing habits, mood, and sleep patterns remotely</p>
            </div>
          </div>
        </Card>
      ) : insight ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Weekly Summary</h2>
                    <p className="opacity-90 max-w-xl">{insight.summary}</p>
                  </div>
                  <Sparkles className="h-8 w-8 opacity-80" />
                </div>
                <div className="flex items-center gap-2 text-sm opacity-80 mt-6 bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <CalendarDays className="h-4 w-4" />
                  <span>Based on last 7 days of data</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-center items-center text-center p-6 border-indigo-100 dark:border-indigo-900 shadow-lg">
              <h3 className="text-muted-foreground font-medium mb-2">Wellness Score</h3>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 56} 
                    strokeDashoffset={2 * Math.PI * 56 * (1 - insight.wellness_score / 100)} 
                    className="text-indigo-500" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {insight.wellness_score}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">Calculated from your tracking history</p>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-green-100 dark:border-green-900 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  Your Strengths
                </CardTitle>
                <CardDescription>What you did brilliantly this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insight.strengths.map((str, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">{str}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-orange-100 dark:border-orange-900 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="h-5 w-5" />
                  Areas to Focus On
                </CardTitle>
                <CardDescription>Where you can improve next week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insight.improvements.map((imp, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">{imp}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md border-indigo-100 dark:border-indigo-900">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 border-b">
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <BrainCircuit className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Actionable steps to synchronize your wellness</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {insight.recommendations.map((rec, i) => (
                  <div key={i} className="bg-background rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center pt-4">
             <Button variant="outline" onClick={() => setInsight(null)}>
               Reset Assessment
             </Button>
          </div>

        </div>
      ) : null}
    </div>
  );
}
