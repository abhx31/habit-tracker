import { useEffect, useState } from 'react';
import axios from 'axios';
import { Separator } from "../components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { 
  CheckCircle2, 
  Trophy, 
  Target, 
  Award,
  Loader2
} from 'lucide-react';
import { toast } from "sonner";
import { API_URL } from "../config";
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion, easeOut } from "framer-motion";
import { Badge } from "../components/ui/badge";

interface HabitStats {
  habitId: string;
  name: string;
  badge: string | null;
  completionRate: string;
  maxStreak: number;
}

interface Statistics {
  totalHabits: number;
  totalCompletions: number;
  mostConsistentHabit: {
    habitId: string;
    habitName: string;
    badge: string | null;
    completionRate: string;
  } | null;
  longestStreakHabit: {
    habitId: string;
    habitName: string;
    badge: string | null;
    maxStreak: number;
  } | null;
  earnedBadges: Array<{
    habitId: string;
    badge: string;
    dateEarned: string;
  }>;
  habits: HabitStats[];
}

const COLORS = ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeOut }
};

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Analytics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBadgeImage = (badge: string) => {
    const badgeMap: { [key: string]: string } = {
        "Bronze": "/src/assets/badges/bronze.png",
        "Silver": "/src/assets/badges/silver.png",
        "Gold": "/src/assets/badges/gold.png",
        "Diamond": "/src/assets/badges/diamond.png",
        "Ace": "/src/assets/badges/ace.png",
        "Overachiever": "/src/assets/badges/over-achiever.png"
    }
    return badgeMap[badge] || ""
}

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const response = await axios.get(`${API_URL}/track/stats`, config);
      
      // Ensure we have default values for arrays
      setStatistics({
        ...response.data,
        habits: response.data.habits || [],
        earnedBadges: response.data.earnedBadges || [],
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch statistics";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Prepare data for charts only if statistics exist
  const completionRateData = statistics?.habits?.map(habit => ({
    name: habit.name,
    rate: parseFloat(habit.completionRate.replace('%', '')),
  })) || [];

  const streakData = statistics?.habits?.map(habit => ({
    name: habit.name,
    streak: habit.maxStreak,
  })) || [];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-violet-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gradient-to-b from-white to-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-red-500 text-xl mb-4">{error}</div>
      </motion.div>
    );
  }

  if (!statistics) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gradient-to-b from-white to-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-gray-500 text-xl">No statistics available.</div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div {...fadeInUp} className="mb-8">
          <Badge className="bg-violet-100 text-violet-700 border-violet-200 px-4 py-2 text-sm font-medium mb-4">
            📊 Your Progress Dashboard
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Habit Analytics</h1>
          <p className="text-gray-600">Track your progress and celebrate your achievements</p>
        </motion.div>

        <Separator className="my-8" />

        {/* Overview Cards */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-700">Total Habits</CardTitle>
                <Target className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{statistics.totalHabits || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-700">Total Completions</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{statistics.totalCompletions || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-700">Best Streak</CardTitle>
                <Trophy className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.longestStreakHabit?.maxStreak || 0}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-700">Earned Badges</CardTitle>
                <Award className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{statistics.earnedBadges?.length || 0}</div>
                {statistics.earnedBadges?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {statistics.earnedBadges.map((badge, index) => (
                      <TooltipPrimitive.Provider key={index}>
                        <TooltipPrimitive.Root>
                          <TooltipPrimitive.Trigger asChild>
                            <img
                              src={getBadgeImage(badge.badge)}
                              alt={badge.badge}
                              className="w-6 h-6 hover:scale-125 transition-transform cursor-help"
                            />
                          </TooltipPrimitive.Trigger>
                          <TooltipPrimitive.Portal>
                            <TooltipPrimitive.Content
                              className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm"
                              sideOffset={5}
                            >
                              {badge.badge}
                              <TooltipPrimitive.Arrow className="fill-gray-900" />
                            </TooltipPrimitive.Content>
                          </TooltipPrimitive.Portal>
                        </TooltipPrimitive.Root>
                      </TooltipPrimitive.Provider>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 mt-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader>
                <CardTitle className="text-violet-700">Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {completionRateData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completionRateData}
                          dataKey="rate"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {completionRateData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              className="hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      No completion data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader>
                <CardTitle className="text-violet-700">Streak Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {streakData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={streakData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="streak" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      No streak data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 mt-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader>
                <CardTitle className="text-violet-700">Most Consistent Habit</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics.mostConsistentHabit ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-primary">
                      {statistics.mostConsistentHabit.habitName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completion Rate: {statistics.mostConsistentHabit.completionRate}
                    </p>
                    {statistics.mostConsistentHabit.badge && (
                      <div className="flex items-center gap-2">
                        <img
                          src={getBadgeImage(statistics.mostConsistentHabit.badge)}
                          alt={statistics.mostConsistentHabit.badge}
                          className="w-8 h-8"
                        />
                        <p className="text-sm font-medium text-green-600">
                          {statistics.mostConsistentHabit.badge}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No consistent habits yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={cardHover}>
            <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
              <CardHeader>
                <CardTitle className="text-violet-700">Longest Streak Achievement</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics.longestStreakHabit ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-primary">
                      {statistics.longestStreakHabit.habitName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {statistics.longestStreakHabit.maxStreak} days
                    </p>
                    {statistics.longestStreakHabit.badge && (
                      <div className="flex items-center gap-2">
                        <img
                          src={getBadgeImage(statistics.longestStreakHabit.badge)}
                          alt={statistics.longestStreakHabit.badge}
                          className="w-8 h-8"
                        />
                        <p className="text-sm font-medium text-green-600">
                          {statistics.longestStreakHabit.badge}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No streak achievements yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* All Habits List */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mt-8"
        >
          <Card className="bg-white/50 backdrop-blur-lg border-violet-100">
            <CardHeader>
              <CardTitle className="text-violet-700">All Habits Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.habits && statistics.habits.length > 0 ? (
                  statistics.habits.map((habit, index) => (
                    <motion.div
                      key={habit.habitId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{habit.name}</h3>
                        {habit.badge && (
                          <div className="flex items-center gap-2">
                            <img
                              src={getBadgeImage(habit.badge)}
                              alt={habit.badge}
                              className="w-6 h-6"
                            />
                            <span className="text-sm font-medium text-green-600">
                              {habit.badge}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Completion Rate: {habit.completionRate}</p>
                        <p>Best Streak: {habit.maxStreak} days</p>
                      </div>
                      <Separator />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500">No habits data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
