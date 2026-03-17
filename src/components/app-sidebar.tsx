import { 
  Home, ListTodo, Timer, Droplet, Brain, Heart, BookOpen, 
  Book, Smile, Moon as MoonIcon, Activity, 
  Users, CheckSquare, Sparkles, Wind, Target, BarChart3, LayoutGrid,
  Gamepad2, MessageSquare, BrainCircuit, User, UtensilsCrossed
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const dashboardItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Dashboard Hub", url: "/dashboard-hub", icon: LayoutGrid },
  { title: "To-Do", url: "/todo", icon: ListTodo },
  { title: "Pomodoro", url: "/pomodoro", icon: Timer },
  { title: "Water Tracker", url: "/water", icon: Droplet },
  { title: "Meditation", url: "/meditation", icon: Brain },
  { title: "Health", url: "/health", icon: Heart },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Study", url: "/study", icon: Book },
  { title: "Mood", url: "/mood", icon: Smile },
  { title: "Sleep", url: "/sleep", icon: MoonIcon },
  { title: "Activity", url: "/activity", icon: Activity },
  { title: "Nutrition", url: "/nutrition", icon: UtensilsCrossed },
  { title: "Social", url: "/social", icon: Users },
  { title: "Habits", url: "/habits", icon: CheckSquare },
  { title: "Gratitude", url: "/gratitude", icon: Sparkles },
  { title: "Mindfulness", url: "/mindfulness", icon: Wind },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Insights", url: "/ai-insights", icon: BrainCircuit },
  { title: "Mind Games", url: "/games", icon: Gamepad2 },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
];


export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">LifeSync</h2>
            <p className="text-xs text-muted-foreground">Sync Your Life, Grow Every Day</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" isActive={location === "/profile"}>
              <Link href="/profile" className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm overflow-hidden">
                  <span className="font-medium truncate w-full">{userDisplayName}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
