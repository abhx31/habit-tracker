"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { useHabits } from "../context/HabitContext"
import { HabitProgress } from "../components/HabitProgress"
import { HabitFormDialog } from "../components/HabitFormDialog"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Calendar } from "../components/ui/calendar"
import { CATEGORY_OPTIONS } from "../types"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"

export default function HabitDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { getHabitLogs, getHabit } = useHabits()

    const [habit, setHabit] = useState<any>(null)
    const [completedDates, setCompletedDates] = useState<Date[]>([])
    const [habitLoading, setHabitLoading] = useState(true)
    const [isLoadingLogs, setIsLoadingLogs] = useState(true)
    const [showEditForm, setShowEditForm] = useState(false)

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
                const logs = await getHabitLogs(id)
                // console.log("Fetched logs:", logs) // <-- ADD THIS
                const dates = logs.map((log) => parseISO(log.date))
                // console.log("Parsed Date:", dates)
                setCompletedDates(dates)
            } catch (error) {
                console.error("Failed to fetch habit logs:", error)
            } finally {
                setIsLoadingLogs(false)
            }
        }
        loadHabitLogs()
    }, [id, getHabitLogs])

    if (habitLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    if (!habit) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <h1 className="text-2xl font-bold mb-4">Habit not found</h1>
                <Button onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const category = CATEGORY_OPTIONS.find((c) => c.value === habit.category)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{habit.name}</h1>
                <Button variant="outline" size="icon" onClick={() => setShowEditForm(true)}>
                    <Edit className="h-4 w-4" />
                </Button>
            </div>

            {/* Details and Progress */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {habit.description && (
                            <div>
                                <h3 className="text-sm font-medium">Description</h3>
                                <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-medium">Category</h3>
                            {category && (
                                <Badge
                                    variant="outline"
                                    className="mt-1"
                                    style={{
                                        borderColor: category.color,
                                        color: category.color,
                                    }}
                                >
                                    {category.label}
                                </Badge>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Frequency</h3>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">
                                {habit.frequency.type}
                                {habit.frequency.type === "weekly" && habit.frequency.days && (
                                    <span className="ml-1">
                                        (
                                        {habit.frequency.days
                                            .map((d: number) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d])
                                            .join(", ")}
                                        )
                                    </span>
                                )}
                                {habit.frequency.type === "monthly" && habit.frequency.dates && (
                                    <span className="ml-1">(Days: {habit.frequency.dates.join(", ")})</span>
                                )}
                            </p>
                        </div>
                        {habit.goal && (
                            <div>
                                <h3 className="text-sm font-medium">Goal</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {habit.goal.target} {habit.goal.unit}
                                </p>
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-medium">Created</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(habit.createdAt), "MMMM d, yyyy")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <HabitProgress habit={habit} />
            </div>

            {/* History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingLogs ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Tabs defaultValue="calendar" className="w-full">
                            <TabsList>
                                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                                <TabsTrigger value="list">List</TabsTrigger>
                            </TabsList>

                            <TabsContent value="calendar" className="mt-4">
                                <Calendar
                                    mode="multiple"
                                    selected={completedDates}
                                    className="rounded-md border"
                                />
                            </TabsContent>

                            <TabsContent value="list" className="mt-4">
                                {completedDates.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">No completed days yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {completedDates
                                            .sort((a, b) => b.getTime() - a.getTime())
                                            .map((date) => (
                                                <div
                                                    key={date.toISOString()}
                                                    className="flex items-center justify-between p-2 rounded-md border"
                                                >
                                                    <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
                                                    <Badge>Completed</Badge>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            {/* Edit Habit Dialog */}
            {showEditForm && (
                <HabitFormDialog
                    open={showEditForm}
                    onOpenChange={setShowEditForm}
                    habitId={habit._id}
                />
            )}
        </div>
    )
}
