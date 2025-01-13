"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Clock, Sparkles, Star, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const stats = [
  {
    title: "Total Score",
    value: "85%",
    description: "Average performance",
    icon: Trophy,
    color: "text-yellow-500",
    trend: "+5%",
    trendType: "positive",
    progress: 85,
    nextMilestone: "90%",
    reward: "+50 XP",
  },
  {
    title: "Interviews",
    value: "12",
    description: "Completed sessions",
    icon: Target,
    color: "text-blue-500",
    trend: "+4",
    trendType: "positive",
    progress: 60,
    nextMilestone: "15",
    reward: "+20 Credits",
  },
  {
    title: "Practice Time",
    value: "15h",
    description: "Total duration",
    icon: Clock,
    color: "text-green-500",
    trend: "+2.5h",
    trendType: "positive",
    progress: 75,
    nextMilestone: "20h",
    reward: "New Badge",
  },
  {
    title: "Credits",
    value: "150",
    description: "Available balance",
    icon: Sparkles,
    color: "text-purple-500",
    trend: "+50",
    trendType: "positive",
    progress: 30,
    nextMilestone: "200",
    reward: "Premium Feature",
  },
];

export function Statistics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="group relative overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <stat.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", stat.color)} />
              {stat.reward && (
                <div className="hidden group-hover:flex items-center text-xs font-medium text-primary animate-in slide-in-from-right-5">
                  <Star className="h-3 w-3 mr-1" />
                  {stat.reward}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={cn(
                "text-xs font-medium flex items-center",
                stat.trendType === "positive" ? "text-green-500" : "text-red-500"
              )}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.trend}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>

            {/* Progress to Next Milestone */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Next: {stat.nextMilestone}</span>
                <span className="font-medium">{stat.progress}%</span>
              </div>
              <Progress 
                value={stat.progress} 
                className="h-1 group-hover:h-2 transition-all"
              >
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    stat.progress >= 100 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                    stat.progress >= 75 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                    stat.progress >= 50 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                    "bg-gradient-to-r from-red-500 to-pink-500"
                  )}
                  style={{ width: `${stat.progress}%` }}
                />
              </Progress>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 