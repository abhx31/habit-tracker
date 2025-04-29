"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useHabits } from "../context/HabitContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Loader2, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Habit } from "../types";
import { API_URL } from "../config";

export default function Analytics() {
    const { habits, isLoading } = useHabits();
    const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
    const [habitStats, setHabitStats] = useState<any>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    useEffect(() => {
        if (habits.length > 0 && !selectedHabit) {
            setSelectedHabit(habits[0]._id);
        }
    }, [habits, selectedHabit]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!selectedHabit) return;

            setIsLoadingStats(true);

            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${API_URL}/analytics/${selectedHabit}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch habit stats");
                }

                const data = await res.json();
                const logs = data.logs || [];

                const weeklyProgress = logs.slice(-7).map((log: any) => ({
                    date: format(new Date(log.date), "EEE"),
                    value: 1,
                }));

                const monthlyProgress = logs.slice(-30).map((log: any) => ({
                    date: format(new Date(log.date), "MMM d"),
                    value: 1,
                }));

                setHabitStats({
                    totalCompletions: data.totalLogs,
                    firstLog: data.firstLog,
                    lastLog: data.lastLog,
                    weeklyProgress,
                    monthlyProgress,
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [selectedHabit]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (habits.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <h3 className="text-lg font-semibold">No habits found</h3>
                    <p className="text-muted-foreground mt-1">Create habits to see analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <p className="text-muted-foreground">Track your progress and see insights about your habits</p>

                <Select value={selectedHabit || ""} onValueChange={setSelectedHabit}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a habit" />
                    </SelectTrigger>
                    <SelectContent>
                        {habits.map((habit: Habit) => (
                            <SelectItem key={habit._id} value={habit._id}>
                                {habit.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoadingStats ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : habitStats ? (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{habitStats.totalCompletions}</div>
                                <p className="text-xs text-muted-foreground">
                                    From: {format(new Date(habitStats.firstLog), "PPP")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Start Date</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{format(new Date(habitStats.firstLog), "PPP")}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Last Entry</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{format(new Date(habitStats.lastLog), "PPP")}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="weekly" className="mt-6">
                        <TabsList>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        </TabsList>

                        <TabsContent value="weekly">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Weekly Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={habitStats.weeklyProgress}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="hsl(var(--primary))" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="monthly">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={habitStats.monthlyProgress}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="hsl(var(--primary))" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            ) : (
                <div className="flex justify-center py-12 text-muted-foreground">
                    No data available for this habit yet.
                </div>
            )}
        </div>
    );
}
