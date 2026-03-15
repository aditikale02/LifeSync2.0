import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Shield, Palette, Globe, Save, LogOut, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    bio: "",
    avatarUrl: "",
    timezone: "UTC",
    theme: "system",
    notifications: {
      dailyReminders: true,
      streakAlerts: true,
      aiInsights: false,
      weeklyReport: true
    }
  });

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (settingsData?.theme) {
        setTheme(settingsData.theme as any);
      }

      setProfile({
        fullName: profileData?.full_name || user.user_metadata?.full_name || "",
        email: user.email || "",
        bio: profileData?.bio || "",
        avatarUrl: profileData?.avatar_url || user.user_metadata?.avatar_url || "",
        timezone: profileData?.timezone || "UTC",
        theme: settingsData?.theme || "system",
        notifications: {
          dailyReminders: settingsData?.daily_goal_reminders ?? true,
          streakAlerts: settingsData?.habit_reminders ?? true,
          aiInsights: settingsData?.mood_reminders ?? false, // mapping mood_reminders to AI for now
          weeklyReport: settingsData?.notifications_enabled ?? true
        }
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update email if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: profile.email });
        if (emailError) throw emailError;
        toast({
          title: "Email Change Requested",
          description: "Please check your new email for a verification link.",
        });
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.fullName,
          bio: profile.bio,
          timezone: profile.timezone,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: profile.theme,
          daily_goal_reminders: profile.notifications.dailyReminders,
          habit_reminders: profile.notifications.streakAlerts,
          mood_reminders: profile.notifications.aiInsights,
          notifications_enabled: profile.notifications.weeklyReport,
          updated_at: new Date().toISOString()
        });

      if (settingsError) throw settingsError;

      setTheme(profile.theme as any);

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile changes.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: "There was a problem signing out.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2">User Profile</h1>
        <p className="text-muted-foreground">Manage your personal settings and preferences</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[250px_1fr]">
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center border-none shadow-md">
            <div className="relative group cursor-pointer mb-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-4xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('') : user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold">{profile.fullName || "Sync User"}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Button variant="outline" size="sm" className="mt-4 w-full">Edit Avatar</Button>
          </Card>

          <Card className="p-2 space-y-1 border-none shadow-md">
            <Button variant="ghost" className="w-full justify-start gap-2 bg-accent text-accent-foreground">
              <User className="h-4 w-4" /> Personal Info
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Shield className="h-4 w-4" /> Security
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Palette className="h-4 w-4" /> Appearance
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input 
                    id="fullname" 
                    placeholder="Enter your full name"
                    value={profile.fullName} 
                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profile.email} 
                    onChange={e => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio"
                  placeholder="Tell us about yourself..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={profile.timezone} onValueChange={v => setProfile({...profile, timezone: v})}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">Universal Time (UTC)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Asia/Kolkata">Mumbai (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Global Preferences</CardTitle>
              <CardDescription>Customize your LifeSync experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Appearance</h4>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme Mode</Label>
                    <p className="text-sm text-muted-foreground">Select how LifeSync looks to you</p>
                  </div>
                  <Select value={profile.theme} onValueChange={v => setProfile({...profile, theme: v})}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Notifications</h4>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Sync Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts for your tracked habits and goals</p>
                  </div>
                  <Switch 
                    checked={profile.notifications.dailyReminders} 
                    onCheckedChange={v => setProfile({...profile, notifications: {...profile.notifications, dailyReminders: v}})}
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <Label>Streak Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you are close to breaking a streak</p>
                  </div>
                  <Switch 
                    checked={profile.notifications.streakAlerts} 
                    onCheckedChange={v => setProfile({...profile, notifications: {...profile.notifications, streakAlerts: v}})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Wellness Notifications</Label>
                    <p className="text-sm text-muted-foreground">Alerts for new personalized recommendations</p>
                  </div>
                  <Switch 
                    checked={profile.notifications.aiInsights} 
                    onCheckedChange={v => setProfile({...profile, notifications: {...profile.notifications, aiInsights: v}})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 bg-muted/20 rounded-b-xl">
              <Button onClick={handleSave} disabled={isSaving} className="ml-auto gap-2 bg-indigo-600 hover:bg-indigo-700">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
