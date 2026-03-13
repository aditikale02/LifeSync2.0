import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, Award, Target, Sparkles, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const weeklyData = [
  { day: "Mon", score: 75 },
  { day: "Tue", score: 82 },
  { day: "Wed", score: 78 },
  { day: "Thu", score: 85 },
  { day: "Fri", score: 88 },
  { day: "Sat", score: 92 },
  { day: "Sun", score: 86 },
];

const categoryData = [
  { name: "Physical", value: 85, color: "#6366f1" },
  { name: "Mental", value: 78, color: "#a855f7" },
  { name: "Social", value: 72, color: "#ec4899" },
  { name: "Nutrition", value: 88, color: "#f59e0b" },
];

export default function AnalyticsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Advanced Analytics</h1>
          <p className="text-muted-foreground italic">Deep data synthesis across your LifeSync ecosystem.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
             <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
             <Calendar className="h-4 w-4" /> Last 30 Days
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "LifeSync Score", val: "84%", trend: "+7%", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
          { label: "Journal Streak", val: "12 Days", trend: "Record", icon: Sparkles, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
          { label: "Active Minutes", val: "340m", trend: "+120m", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
          { label: "Achievements", val: "23", trend: "+5 new", icon: Award, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/20" },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-md hover:shadow-lg transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                 </div>
                 <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0 text-[10px]">{item.trend}</Badge>
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</h3>
              <div className="text-3xl font-black mt-1 group-hover:scale-105 transition-transform origin-left">{item.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Growth Performance Index</CardTitle>
            <CardDescription>Daily synchronization score across all dimensions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#scoreColor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Focus areas this week</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
               {categoryData.map((item) => (
                 <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold uppercase tracking-tighter">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
         <Card className="bg-indigo-600 text-white border-none shadow-2xl p-8 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-10">
               <TrendingUp className="h-32 w-32" />
            </div>
            <h3 className="text-2xl font-black mb-4">Pulse Insight</h3>
            <p className="opacity-90 leading-relaxed mb-6">
               Your <strong>Mental Sync</strong> score has increased by 15% since you started logging 20m of meditation daily. Consistency is paying off.
            </p>
            <Button className="bg-white text-indigo-600 font-bold hover:bg-indigo-50">View Meditation Logs</Button>
         </Card>
         
         <Card className="border-none shadow-lg p-8 bg-muted/20 border-2 border-dashed border-muted flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
               <Award className="h-8 w-8 text-primary/40" />
            </div>
            <h3 className="font-bold text-lg mb-2">New Milestone Approaching</h3>
            <p className="text-sm text-muted-foreground mb-6">You're 3 days away from a 15-day synchronization streak.</p>
            <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-primary w-[80%]" />
            </div>
         </Card>
      </div>
    </motion.div>
  );
}

import { Badge } from "@/components/ui/badge";
