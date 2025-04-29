"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PlusCircle, Search, Loader2, CheckCircle2 } from "lucide-react";
import { useHabits } from "../context/HabitContext";
import { HabitCard } from "../components/HabitCard";
import { HabitFormDialog } from "../components/HabitFormDialog";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { API_URL } from "../config";

export default function Dashboard() {
    const { habits, isLoading, trackHabit } = useHabits();
    const [showHabitForm, setShowHabitForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [completedToday, setCompletedToday] = useState<Record<string, boolean>>({});
    const [isTracking, setIsTracking] = useState<Record<string, boolean>>({}); // new - loading per habit

    // Fetch today's completed habits on mount
    useEffect(() => {
        const fetchCompletedHabits = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("User not logged in, skipping habits fetch.");
                return;
            }

            try {
                const res = await fetch(`${API_URL}/track/today`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status === 404) {
                    console.warn("No completions found for today.");
                    return;
                }

                if (!res.ok) {
                    throw new Error(`Unexpected API error: ${res.status}`);
                }

                const data = await res.json();
                console.log(data);
                const logs = Array.isArray(data) ? data : data.logs ?? [];

                const completionMap: Record<string, boolean> = {};
                logs.forEach((log: { habitId: string }) => {
                    completionMap[log.habitId] = true;
                });

                setCompletedToday(completionMap);
            } catch (error) {
                console.error("Error fetching today's completions:", error);
                toast.error("Server error while loading completions.", {
                    style: { background: "#1e293b", color: "#f1f5f9" },
                });
            }
        };

        fetchCompletedHabits();
    }, []);




    // Handle completing a habit
    const handleToggleComplete = async (habitId: string) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const newCompletedStatus = !completedToday[habitId];

            // Show loading spinner for this habit
            setIsTracking(prev => ({ ...prev, [habitId]: true }));

            await trackHabit(habitId, today, newCompletedStatus);

            // Update local UI state after backend success
            setCompletedToday(prev => ({
                ...prev,
                [habitId]: newCompletedStatus,
            }));

            toast.success("Habit updated!", {
                icon: <CheckCircle2 className="text-green-400" />,
                style: { background: "#1e293b", color: "#f1f5f9" },
            });
        } catch (error) {
            console.error(error);
            toast.error("Error updating habit", {
                style: { background: "#1e293b", color: "#f1f5f9" },
            });
        } finally {
            setIsTracking(prev => ({ ...prev, [habitId]: false }));
        }
    };

    const filteredHabits = (habits ?? []).filter(habit =>
        [habit.name, habit.description, habit.category]
            .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const categorizeHabits = (type: string) =>
        filteredHabits.filter(habit => habit.frequency.type === type);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        {format(new Date(), "EEEE, MMMM d, yyyy")}
                    </p>
                </div>
                <Button onClick={() => setShowHabitForm(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Habit
                </Button>
            </div>

            {/* Search Box */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search habits..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Main Habits */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All ({filteredHabits.length})</TabsTrigger>
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>

                    {["all", "daily", "weekly", "monthly"].map(type => (
                        <TabsContent key={type} value={type} className="mt-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(type === "all" ? filteredHabits : categorizeHabits(type)).map(habit => (
                                    <HabitCard
                                        key={habit._id}
                                        habit={habit}
                                        completed={!!completedToday[habit._id]}
                                        onToggleComplete={() => handleToggleComplete(habit._id)}
                                        isLoading={!!isTracking[habit._id]} // optional loading spinner per habit
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            {/* Habit Form Modal */}
            {showHabitForm && (
                <HabitFormDialog open={showHabitForm} onOpenChange={setShowHabitForm} />
            )}
        </div>
    );
}
