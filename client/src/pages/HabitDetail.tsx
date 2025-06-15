"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, parseISO, subDays } from "date-fns"
import { useHabits } from "../context/HabitContext"
import { HabitFormDialog } from "../components/HabitFormDialog"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Calendar } from "../components/ui/calendar"
import { CATEGORY_OPTIONS } from "../types"
import { ArrowLeft, Edit, Loader2, Calendar as CalendarIcon, List, BarChart2,  Award, Info, TrendingUp, CheckCircle } from "lucide-react"
import { motion, Variants } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import { Progress } from "../components/ui/progress"

interface HabitDetail {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  badge?: string;
  createdAt: string;
  frequency?: {
    type: "daily" | "weekly" | "monthly";
    days?: number[];
    dates?: number[];
  };
  goal?: {
    target: number;
    unit: string;
  };
}

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


export default function HabitDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getHabitLogs, getHabit } = useHabits()

  const [habit, setHabit] = useState<HabitDetail | null>(null)
  const [completedDates, setCompletedDates] = useState<Date[]>([])
  const [habitLoading, setHabitLoading] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [completionRate, setCompletionRate] = useState(0)

  const category = CATEGORY_OPTIONS.find((c) => c.value === habit?.category)

  useEffect(() => {
    async function loadHabit() {
      if (!id) return
      setHabitLoading(true)
      try {
        const fetchedHabit = await getHabit(id)
        setHabit(fetchedHabit || null)
      } catch (error) {
        console.error("Failed to fetch habit:", error)
        setHabit(null)
      } finally {
        setHabitLoading(false)
      }
    }
    loadHabit()
  }, [id, getHabit])

  useEffect(() => {
    async function loadHabitLogs() {
      if (!id) return
      setIsLoadingLogs(true)
      try {
        const response = await getHabitLogs(id)
        const dates = response.logs.map((log) => parseISO(log.date))
        setCompletedDates(dates)
        
        // Calculate completion rate (simplified)
        if (habit && dates.length > 0) {
          const daysSinceCreation = Math.floor((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          const rate = Math.min(100, Math.round((dates.length / daysSinceCreation) * 100))
          setCompletionRate(rate)
        }
      } catch (error) {
        console.error("Failed to fetch habit logs:", error)
      } finally {
        setIsLoadingLogs(false)
      }
    }
    loadHabitLogs()
  }, [id, getHabitLogs, habit])

  // Prepare data for charts
  const prepareChartData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      return {
        date: format(date, "MMM dd"),
        completed: completedDates.some(d => 
          d.getDate() === date.getDate() && 
          d.getMonth() === date.getMonth() && 
          d.getFullYear() === date.getFullYear()
        ) ? 1 : 0
      }
    })
    
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = subDays(new Date(), (3 - i) * 7)
      const weekEnd = subDays(weekStart, -6)
      const weekCompletions = completedDates.filter(d => 
        d >= weekStart && d <= weekEnd
      ).length
      return {
        week: `Week ${i + 1}`,
        completions: weekCompletions,
        goal: habit?.frequency?.type === "daily" ? 7 : 
              habit?.frequency?.type === "weekly" ? 1 : 
              habit?.frequency?.days?.length || 0
      }
    }).reverse()
    
    return { last30Days, weeklyData }
  }

  const { last30Days, weeklyData } = prepareChartData()

  if (habitLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-violet-500" />
        </motion.div>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Habit not found</h1>
          <p className="text-gray-600">The habit you're looking for doesn't exist or may have been deleted.</p>
        </div>
        <Button 
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="rounded-full hover:bg-violet-100/80 hover:backdrop-blur-sm transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-violet-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{habit.name}</h1>
            <p className="text-gray-600">{habit.description}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowEditForm(true)}
          className="border-violet-200 bg-white/80 backdrop-blur-sm hover:bg-violet-50/80 rounded-full"
        >
          <Edit className="h-4 w-4 mr-2 text-violet-600" />
          Edit Habit
        </Button>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Completions</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{completedDates.length}</div>
            <p className="text-xs text-green-700 mt-1">times completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Completion Rate</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{completionRate}%</div>
            <Progress 
              value={completionRate} 
              className="h-2 mt-2 bg-blue-100" 
              // @ts-ignore - indicatorClassName is a valid prop but not typed correctly
              indicatorClassName="bg-blue-600" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Current Badge</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src={getBadgeImage(habit.badge || '')} alt={habit.badge || ''} className="h-10 w-10" />
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-full h-full rounded-full bg-amber-500/10" />
                </motion.div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-900">{habit.badge}</div>
                <p className="text-xs text-amber-700">
                  {habit.badge === "Bronze" && "1+ day streak"}
                  {habit.badge === "Silver" && "7+ days streak"}
                  {habit.badge === "Gold" && "30+ days streak"}
                  {habit.badge === "Diamond" && "90+ days streak"}
                  {habit.badge === "Ace" && "180+ days streak"}
                  {habit.badge === "Overachiever" && "365+ days streak"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Visualization */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart2 className="h-5 w-5 text-violet-600" />
                  <span>Progress Overview</span>
                </CardTitle>
                <CardDescription>Your habit completion over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last30Days} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis hide domain={[0, 1]} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.96)',
                          border: '1px solid #eee',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#7c3aed" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#7c3aed' }}
                        activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.96)',
                          border: '1px solid #eee',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="completions" name="Completed" radius={[4, 4, 0, 0]}>
                        {weeklyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.completions >= entry.goal ? '#10b981' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Habit Details */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-violet-600" />
                  <span>Habit Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  {category && (
                    <Badge
                      variant="outline"
                      className="mt-1 px-3 py-1 rounded-full border-0"
                      style={{ 
                        background: `${category.color}10`,
                        color: category.color
                      }}
                    >
                      {category.label}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Frequency</h3>
                  <p className="text-sm text-gray-800 capitalize">
                    {habit.frequency?.type}
                    {habit.frequency?.type === "weekly" && habit.frequency?.days && (
                      <span className="ml-1">
                        (
                        {habit.frequency?.days
                          .map((d: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                          .join(", ")}
                        )
                      </span>
                    )}
                    {habit.frequency?.type === "monthly" && habit.frequency?.dates && (
                      <span className="ml-1">(Days: {habit.frequency?.dates.join(", ")})</span>
                    )}
                  </p>
                </div>
                
                {habit.goal && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                    <p className="text-sm text-gray-800">
                      {habit.goal.target} {habit.goal.unit}
                    </p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-sm text-gray-800">
                    {format(new Date(habit.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* History */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-violet-600" />
                  <span>History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs 
                  defaultValue="calendar" 
                  className="w-full"
                  onValueChange={() => {}}
                >
                  <TabsList className="bg-white/80 backdrop-blur-sm border-0 shadow-sm p-1 h-10">
                    <TabsTrigger 
                      value="calendar" 
                      className="text-xs font-medium px-4 py-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Calendar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="list" 
                      className="text-xs font-medium px-4 py-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg"
                    >
                      <List className="h-3 w-3 mr-1" />
                      List
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="calendar" className="mt-4">
                    {isLoadingLogs ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="h-8 w-8 text-violet-500" />
                        </motion.div>
                        <p className="text-gray-500 text-center">Loading calendar...</p>
                      </div>
                    ) : (
                      <Calendar
                        mode="multiple"
                        selected={completedDates}
                        className="rounded-md border-0"
                        modifiers={{
                          completed: completedDates,
                        }}
                        modifiersStyles={{
                          completed: {
                            background: '#7c3aed',
                            color: 'white',
                            borderRadius: '6px'
                          }
                        }}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="list" className="mt-4">
                    {isLoadingLogs ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="h-8 w-8 text-violet-500" />
                        </motion.div>
                        <p className="text-gray-500 text-center">Loading history...</p>
                      </div>
                    ) : completedDates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <CalendarIcon className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500 text-center">No completed days yet</p>
                        <p className="text-gray-400 text-xs text-center">Complete your habit to see it here</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {completedDates
                          .sort((a, b) => b.getTime() - a.getTime())
                          .map((date) => (
                            <motion.div
                              key={date.toISOString()}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-violet-50/50 hover:bg-violet-100/50 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-800">
                                {format(date, "EEE, MMM d")}
                              </span>
                              <Badge className="bg-violet-600 text-white px-2 py-1 rounded-full text-xs">
                                Completed
                              </Badge>
                            </motion.div>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit Habit Dialog */}
      {showEditForm && (
        <HabitFormDialog
          open={showEditForm}
          onOpenChange={setShowEditForm}
          habitId={habit._id}
        />
      )}
    </motion.div>
  )
}