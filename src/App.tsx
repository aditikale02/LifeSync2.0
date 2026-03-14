import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { CatMascot } from "@/components/cat-mascot";
import { NatureBackground } from "@/components/nature-background";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import WellnessTest from "@/pages/wellness-test";
import Home from "@/pages/home";
import TodoPage from "@/pages/todo";
import PomodoroPage from "@/pages/pomodoro";
import WaterPage from "@/pages/water";
import MeditationPage from "@/pages/meditation";
import GamesPage from "@/pages/games";
import FeedbackPage from "@/pages/feedback";
import AnalyticsPage from "@/pages/analytics";
import HealthPage from "@/pages/health";
import JournalPage from "@/pages/journal";
import StudyPage from "@/pages/study";
import MoodPage from "@/pages/mood";
import NutritionPage from "@/pages/nutrition";
import SleepPage from "@/pages/sleep";
import ActivityPage from "@/pages/activity";
import SocialPage from "@/pages/social";
import HabitsPage from "@/pages/habits";
import GratitudePage from "@/pages/gratitude";
import MindfulnessPage from "@/pages/mindfulness";
import GoalsPage from "@/pages/goals";
import AiInsightsPage from "@/pages/ai-insights";
import ProfilePage from "@/pages/profile";
import LandingPage from "@/pages/landing";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/signup" component={Register} />
      <ProtectedRoute path="/dashboard" component={Home} />
      <ProtectedRoute path="/wellness-test" component={WellnessTest} />
      <ProtectedRoute path="/todo" component={TodoPage} />
      <ProtectedRoute path="/pomodoro" component={PomodoroPage} />
      <ProtectedRoute path="/water" component={WaterPage} />
      <ProtectedRoute path="/meditation" component={MeditationPage} />
      <ProtectedRoute path="/health" component={HealthPage} />
      <ProtectedRoute path="/journal" component={JournalPage} />
      <ProtectedRoute path="/study" component={StudyPage} />
      <ProtectedRoute path="/mood" component={MoodPage} />
      <ProtectedRoute path="/nutrition" component={NutritionPage} />
      <ProtectedRoute path="/sleep" component={SleepPage} />
      <ProtectedRoute path="/activity" component={ActivityPage} />
      <ProtectedRoute path="/social" component={SocialPage} />
      <ProtectedRoute path="/habits" component={HabitsPage} />
      <ProtectedRoute path="/gratitude" component={GratitudePage} />
      <ProtectedRoute path="/mindfulness" component={MindfulnessPage} />
      <ProtectedRoute path="/goals" component={GoalsPage} />
      <ProtectedRoute path="/ai-insights" component={AiInsightsPage} />
      <ProtectedRoute path="/games" component={GamesPage} />
      <ProtectedRoute path="/feedback" component={FeedbackPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [catMessage, setCatMessage] = useState("Welcome! Let's sync your life today 🐾");
  const [showCatMessage, setShowCatMessage] = useState(true);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AppLayout 
              catMessage={catMessage} 
              showCatMessage={showCatMessage} 
              style={style as React.CSSProperties}
            >
              <Router />
            </AppLayout>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppLayout({ children, catMessage, showCatMessage, style }: any) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  const isAuthPage = ["/", "/login", "/register", "/signup"].includes(location);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthPage || !user) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-40">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 relative">
            <NatureBackground />
            {children}
          </main>
        </div>
        <CatMascot message={catMessage} showMessage={showCatMessage} />
      </div>
    </SidebarProvider>
  );
}
