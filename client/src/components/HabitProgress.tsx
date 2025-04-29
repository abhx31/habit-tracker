"use client"

import { useEffect, useState } from "react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { useHabits } from "../context/HabitContext"
import type { Habit, HabitLog } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { Loader2 } from "lucide-react"

interface HabitProgressProps {
    habit: Habit
}

export function HabitProgress({ habit }: HabitProgressProps) {
    const { getHabitLogs, getHabitStats } = useHabits()
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [stats, setStats] = useState<{ currentStreak: number; completionRate: number } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [logsData, statsData] = await Promise.all([getHabitLogs(habit._id), getHabitStats(habit._id)])
                setLogs(logsData)
                setStats({
                    currentStreak: statsData.currentStreak,
                    completionRate: statsData.completionRate,
                })
            } catch (error) {
                console.error("Error fetching habit data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [habit._id, getHabitLogs, getHabitStats])

    // Generate week days for the current week
    const today = new Date()
    const startOfCurrentWeek = startOfWeek(today)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))

    // Check if a day has a completed log
    const isDayCompleted = (date: Date) => {
        return logs.some((log) => isSameDay(new Date(log.date), date) && log.completed)
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{stats?.completionRate ? `${Math.round(stats.completionRate * 100)}%` : "0%"}</span>
                    </div>
                    <Progress value={stats?.completionRate ? stats.completionRate * 100 : 0} />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">Current Streak:</span>
                        <Badge variant="outline" className="ml-2">
                            {stats?.currentStreak || 0} days
                        </Badge>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="text-sm font-medium mb-2">This Week:</div>
                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map((day) => (
                            <div key={day.toString()} className="flex flex-col items-center">
                                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                                <div
                                    className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center text-xs ${isDayCompleted(day)
                                        ? "bg-primary text-primary-foreground"
                                        : isSameDay(day, today)
                                            ? "border-2 border-primary"
                                            : "bg-muted"
                                        }`}
                                >
                                    {format(day, "d")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
