import { useEffect, useState, type ComponentType } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Book,
  BookOpen,
  Brain,
  BrainCircuit,
  CheckSquare,
  Droplet,
  Gamepad2,
  Heart,
  Home,
  ListTodo,
  MessageSquare,
  Moon,
  Search,
  Smile,
  Sparkles,
  Target,
  Timer,
  User,
  Users,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DashboardCategory = "Productivity" | "Wellbeing" | "Insights";

type DashboardItem = {
  title: string;
  description: string;
  url: string;
  category: DashboardCategory;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  accentText: string;
};

const dashboardCatalog: DashboardItem[] = [
  { title: "Home", description: "Return to your main LifeSync overview and daily command center.", url: "/dashboard", category: "Productivity", icon: Home, accent: "bg-sky-50 dark:bg-sky-950/20", accentText: "text-sky-600" },
  { title: "To-Do", description: "Organize tasks, track progress, and clear your daily priorities.", url: "/todo", category: "Productivity", icon: ListTodo, accent: "bg-violet-50 dark:bg-violet-950/20", accentText: "text-violet-600" },
  { title: "Pomodoro", description: "Stay focused with timer-based work sessions and breaks.", url: "/pomodoro", category: "Productivity", icon: Timer, accent: "bg-amber-50 dark:bg-amber-950/20", accentText: "text-amber-600" },
  { title: "Study", description: "Manage learning blocks, study routines, and academic momentum.", url: "/study", category: "Productivity", icon: Book, accent: "bg-indigo-50 dark:bg-indigo-950/20", accentText: "text-indigo-600" },
  { title: "Journal", description: "Capture reflections, thoughts, and meaningful daily entries.", url: "/journal", category: "Productivity", icon: BookOpen, accent: "bg-orange-50 dark:bg-orange-950/20", accentText: "text-orange-600" },
  { title: "Habits", description: "Build routines and measure streaks across your daily habits.", url: "/habits", category: "Productivity", icon: CheckSquare, accent: "bg-emerald-50 dark:bg-emerald-950/20", accentText: "text-emerald-600" },
  { title: "Goals", description: "Track long-term targets and turn plans into measurable action.", url: "/goals", category: "Productivity", icon: Target, accent: "bg-fuchsia-50 dark:bg-fuchsia-950/20", accentText: "text-fuchsia-600" },

  { title: "Water Tracker", description: "Monitor hydration and stay on top of your intake goals.", url: "/water", category: "Wellbeing", icon: Droplet, accent: "bg-blue-50 dark:bg-blue-950/20", accentText: "text-blue-600" },
  { title: "Meditation", description: "Create mindful moments and keep your meditation routine steady.", url: "/meditation", category: "Wellbeing", icon: Brain, accent: "bg-purple-50 dark:bg-purple-950/20", accentText: "text-purple-600" },
  { title: "Health", description: "View holistic health indicators and wellness checkpoints.", url: "/health", category: "Wellbeing", icon: Heart, accent: "bg-rose-50 dark:bg-rose-950/20", accentText: "text-rose-600" },
  { title: "Mood", description: "Log emotions, identify trends, and reflect on how you feel.", url: "/mood", category: "Wellbeing", icon: Smile, accent: "bg-yellow-50 dark:bg-yellow-950/20", accentText: "text-yellow-600" },
  { title: "Sleep", description: "Review sleep habits and support better recovery patterns.", url: "/sleep", category: "Wellbeing", icon: Moon, accent: "bg-slate-100 dark:bg-slate-800", accentText: "text-slate-600 dark:text-slate-300" },
  { title: "Activity", description: "Follow physical movement and stay consistent with active living.", url: "/activity", category: "Wellbeing", icon: Activity, accent: "bg-orange-50 dark:bg-orange-950/20", accentText: "text-orange-600" },
  { title: "Nutrition", description: "Log meals and snacks to maintain a balanced diet.", url: "/nutrition", category: "Wellbeing", icon: UtensilsCrossed, accent: "bg-lime-50 dark:bg-lime-950/20", accentText: "text-lime-600" },
  { title: "Social", description: "Reflect on connection, relationships, and your support network.", url: "/social", category: "Wellbeing", icon: Users, accent: "bg-cyan-50 dark:bg-cyan-950/20", accentText: "text-cyan-600" },
  { title: "Gratitude", description: "Capture moments of appreciation and strengthen positive reflection.", url: "/gratitude", category: "Wellbeing", icon: Sparkles, accent: "bg-pink-50 dark:bg-pink-950/20", accentText: "text-pink-600" },
  { title: "Mindfulness", description: "Ground yourself with calm practices and mental reset tools.", url: "/mindfulness", category: "Wellbeing", icon: Wind, accent: "bg-teal-50 dark:bg-teal-950/20", accentText: "text-teal-600" },

  { title: "AI Insights", description: "Generate personalized recommendations from your recent patterns.", url: "/ai-insights", category: "Insights", icon: BrainCircuit, accent: "bg-indigo-50 dark:bg-indigo-950/20", accentText: "text-indigo-600" },
  { title: "Analytics", description: "Study cross-dashboard trends and performance over time.", url: "/analytics", category: "Insights", icon: BarChart3, accent: "bg-violet-50 dark:bg-violet-950/20", accentText: "text-violet-600" },
  { title: "Mind Games", description: "Sharpen focus and cognition through playful brain exercises.", url: "/games", category: "Insights", icon: Gamepad2, accent: "bg-red-50 dark:bg-red-950/20", accentText: "text-red-600" },
  { title: "Feedback", description: "Share your experience and help improve LifeSync over time.", url: "/feedback", category: "Insights", icon: MessageSquare, accent: "bg-neutral-100 dark:bg-neutral-800", accentText: "text-neutral-700 dark:text-neutral-300" },
  { title: "Profile", description: "Manage your account details and personal LifeSync preferences.", url: "/profile", category: "Insights", icon: User, accent: "bg-sky-50 dark:bg-sky-950/20", accentText: "text-sky-600" },
  { title: "Wellness Test", description: "Open your guided assessment and check overall wellness status.", url: "/wellness-test", category: "Insights", icon: Sparkles, accent: "bg-emerald-50 dark:bg-emerald-950/20", accentText: "text-emerald-600" },
];

const categories: DashboardCategory[] = ["Productivity", "Wellbeing", "Insights"];

function DashboardCarouselSection({ category, items }: { category: DashboardCategory; items: DashboardItem[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on("select", updateScrollState);
    api.on("reInit", updateScrollState);

    return () => {
      api.off("select", updateScrollState);
    };
  }, [api]);

  return (
    <section className="space-y-4 overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{category}</h2>
          <p className="text-sm text-muted-foreground">{items.length} dashboard{items.length === 1 ? "" : "s"} available</p>
        </div>
        <div className="flex w-full items-center gap-2 self-end sm:w-auto sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-full bg-white/75 backdrop-blur-md shadow-sm disabled:opacity-40 sm:flex-none dark:bg-slate-950/70"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-full bg-white/75 backdrop-blur-md shadow-sm disabled:opacity-40 sm:flex-none dark:bg-slate-950/70"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{ align: "start", dragFree: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 pb-4">
          {items.map((item, index) => (
            <CarouselItem
              key={item.title}
              className="basis-[84%] pl-3 min-[480px]:basis-[68%] sm:basis-[48%] lg:basis-[30%] 2xl:basis-[22%]"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link href={item.url}>
                  <a
                    className="group block"
                    data-testid={`link-hub-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    <Card className="overflow-hidden border border-white/60 bg-white/80 shadow-[0_3px_14px_rgba(15,23,42,0.07)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_28px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-950/75">
                      <div className="rounded-[inherit] transition-transform duration-300 ease-out group-hover:[transform:perspective(800px)_rotateX(2deg)_rotateY(-3deg)_translateY(-4px)] [transform-style:preserve-3d]">
                        <CardHeader className="p-4 space-y-3">
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5",
                            item.accent,
                            item.accentText,
                          )}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold tracking-tight leading-snug">{item.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs leading-relaxed line-clamp-1">
                              {item.description}
                            </CardDescription>
                          </div>
                        </CardHeader>
                      </div>
                    </Card>
                  </a>
                </Link>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export default function DashboardHubPage() {
  const [query, setQuery] = useState("");
  const searchTerm = query.trim().toLowerCase();

  const filteredCatalog = dashboardCatalog.filter((item) =>
    item.title.toLowerCase().includes(searchTerm),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-8 overflow-hidden pb-12"
    >
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900 p-5 text-white shadow-2xl sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.14),_transparent_32%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="secondary" className="bg-white/15 text-white border-none px-3 py-1">Dashboard Hub</Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">Explore every dashboard in one place.</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
                Jump between productivity, wellbeing, and insight tools without changing your main dashboard. Search by name and open the space you need right now.
              </p>
            </div>
          </div>
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dashboards by name"
                className="h-12 rounded-2xl border-white/15 bg-white/10 pl-11 text-white placeholder:text-white/55 backdrop-blur-md"
                data-testid="input-dashboard-search"
              />
            </div>
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const items = filteredCatalog.filter((item) => item.category === category);

        if (items.length === 0) {
          return null;
        }

        return <DashboardCarouselSection key={category} category={category} items={items} />;
      })}

      {filteredCatalog.length === 0 && (
        <Card className="border-none bg-white/75 shadow-md dark:bg-slate-950/70 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="text-xl font-black">No dashboards found</h3>
              <p className="text-muted-foreground">Try a different search term or browse the categories above.</p>
            </div>
            <Button variant="outline" onClick={() => setQuery("")}>Clear Search</Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}