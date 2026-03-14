import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

const questions = [
  {
    id: "hydration",
    question: "How many glasses of water do you drink daily?",
    options: ["Less than 4", "4-6 glasses", "7-8 glasses", "More than 8"],
  },
  {
    id: "stress",
    question: "How would you rate your stress level?",
    options: ["Very Low", "Low", "Moderate", "High"],
  },
  {
    id: "focus",
    question: "How well can you maintain focus throughout the day?",
    options: ["Poorly", "Fair", "Good", "Excellent"],
  },
  {
    id: "exercise",
    question: "How often do you exercise per week?",
    options: ["Never", "1-2 times", "3-4 times", "5+ times"],
  },
  {
    id: "mood",
    question: "How would you describe your overall mood?",
    options: ["Often sad", "Sometimes down", "Generally happy", "Very positive"],
  },
  {
    id: "diet",
    question: "How balanced is your diet?",
    options: ["Poor", "Fair", "Good", "Excellent"],
  },
];

export default function WellnessTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentStep].id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
      console.log("Wellness test completed", answers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (showResults) {
    const score = Math.floor(Math.random() * 30) + 70;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-2xl bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <Sparkles className="h-12 w-12 text-pink-400 mx-auto mb-4" />
            <CardTitle className="text-3xl text-white">Your Wellness Score</CardTitle>
            <CardDescription className="text-gray-400">
              Based on your responses, here's your personalized wellness profile
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-cyan-400 to-green-400">
                {score}%
              </div>
              <p className="text-gray-300 mt-2">Great foundation for growth!</p>
            </div>
            <Button className="w-full" data-testid="button-start-journey">
              Start Your Wellness Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-400 mt-2">
              Question {currentStep + 1} of {questions.length}
            </p>
          </div>
          <CardTitle className="text-white">{currentQuestion.question}</CardTitle>
          <CardDescription className="text-gray-400">
            Choose the option that best describes you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg border border-gray-700 p-4 hover-elevate"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-gray-200"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
              data-testid="button-previous"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="flex-1"
              data-testid="button-next"
            >
              {currentStep === questions.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
