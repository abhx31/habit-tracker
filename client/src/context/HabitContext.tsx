"use client"

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react"
import type { Habit, HabitStats, HabitLogResponse } from "../types"
import { useAuth } from "./AuthContext"
import { API_URL } from "../config"
import { toast } from "sonner"

interface HabitContextType {
    habits: Habit[]
    isLoading: boolean
    isHydrated: boolean // <-- NEW
    error: string | null
    completedToday: string[]
    fetchHabits: () => Promise<void>
    getHabit: (id: string) => Habit | undefined
    createHabit: (habit: Omit<Habit, "_id" | "userId" | "createdAt" | "updatedAt">) => Promise<Habit>
    updateHabit: (id: string, habit: Partial<Habit>) => Promise<Habit>
    deleteHabit: (id: string) => Promise<void>
    trackHabit: (habitId: string, date: string, completed: boolean) => Promise<void>
    getHabitLogs: (habitId: string) => Promise<HabitLogResponse>
    getHabitStats: (habitId: string) => Promise<HabitStats>
    getHeatmapData: (habitId: string) => Promise<Array<{ date: string; count: number }>>
    getCombinedHeatmapData: () => Promise<Array<{ date: string; count: number }>>
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

export const HabitProvider = ({ children }: { children: ReactNode }) => {
    const { token, isAuthenticated, logout } = useAuth()
    const [habits, setHabits] = useState<Habit[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isHydrated, setIsHydrated] = useState(false) // <-- NEW
    const [error, setError] = useState<string | null>(null)
    const [completedToday, setCompletedToday] = useState<string[]>([])

    const authFetch = async (url: string, options: RequestInit = {}) => {
        if (!token) throw new Error("Not authenticated");
        const res = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                // token expired / invalid
                toast.error("Session expired. Please login again.");
                logout(); // <-- useAuthContext logout function
                throw new Error("Unauthorized");
            }

            const { message } = await res.json();
            throw new Error(message || "Something went wrong");
        }

        return res;
    };


    const fetchHabits = async () => {
        if (!token) return
        setIsLoading(true)
        setError(null)
        try {
            const res = await authFetch(`${API_URL}/habits`, { method: "GET" })
            const data = await res.json()
            setHabits(data.habits || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load habits")
        } finally {
            setIsLoading(false)
            setIsHydrated(true) // <-- mark as hydrated after first load
        }
    }
    const fetchCompletedToday = async () => {
        if (!token) return;
        try {
            const res = await authFetch(`${API_URL}/track/today`);
            const data = await res.json();

            // Type guard for logs array
            if (!data || !Array.isArray(data.logs)) {
                console.error("Invalid response format:", data);
                setCompletedToday([]);
                return;
            }

            const habitIds = data.logs
                .filter((log: any) => log && log.habitId) // Filter out invalid logs
                .map((log: any) => log.habitId.toString());
            setCompletedToday(habitIds);
        } catch (error) {
            console.error("Failed to fetch completed habits:", error);
            toast.error("Could not load completed habits");
            setCompletedToday([]);
        }
    };




    useEffect(() => {
        if (isAuthenticated && token) {
            fetchHabits()
            fetchCompletedToday()
        }
    }, [isAuthenticated, token])

    const getHabit = (id: string) => {
        if (!id) return undefined;
        return habits.find(habit => habit._id === id);
    }

    const createHabit = async (habit: Omit<Habit, "_id" | "userId" | "createdAt" | "updatedAt">) => {
        try {
            const res = await authFetch(`${API_URL}/habits`, {
                method: "POST",
                body: JSON.stringify(habit),
            });
            const data = await res.json();
            
            if (!data || !data._id) {
                throw new Error("Invalid response format from server");
            }

            setHabits(prev => [...prev, data]);
            return data;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create habit";
            toast.error(message);
            throw error;
        }
    }

    const updateHabit = async (id: string, habit: Partial<Habit>) => {
        if (!id) throw new Error("Habit ID is required");
        
        try {
            const res = await authFetch(`${API_URL}/habits/${id}`, {
                method: "PUT",
                body: JSON.stringify(habit),
            });
            const data = await res.json();

            if (!data || !data._id) {
                throw new Error("Invalid response format from server");
            }

            setHabits(prev => prev.map(h => (h._id === id ? { ...h, ...data } : h)));
            return data;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update habit";
            toast.error(message);
            throw error;
        }
    }

    const deleteHabit = async (id: string) => {
        await authFetch(`${API_URL}/habits/${id}`, {
            method: "DELETE",
        })
        setHabits(prev => prev.filter(h => h._id !== id))
    }

    const trackHabit = async (habitId: string, date: string, completed: boolean) => {
        try {
            await authFetch(`${API_URL}/track`, {
                method: "POST",
                body: JSON.stringify({ habitId, date, completed }),
            })

            setCompletedToday(prev => {
                if (completed) {
                    // Add habitId if marking completed
                    return [...prev, habitId]
                } else {
                    // Remove habitId if unmarking completed
                    return prev.filter(id => id !== habitId)
                }
            })

        } catch (err) {
            console.error("Failed to track habit", err)
        }
    }


    const getHabitLogs = async (habitId: string): Promise<HabitLogResponse> => {
        const res = await authFetch(`${API_URL}/track/${habitId}`)
        const data = await res.json()

        if (!Array.isArray(data.logs)) {
            console.error("Invalid logs data:", data)
            return { logs: [], currentStreak: 0 }
        }

        return data
    }

    const getHabitStats = async (habitId: string): Promise<HabitStats> => {
        const res = await authFetch(`${API_URL}/track/summary/${habitId}`)
        return res.json()
    }

    const getHeatmapData = async (habitId: string) => {
        const res = await authFetch(`${API_URL}/track/heatmap/${habitId}`);
        const data = await res.json();
        console.log('Habit specific heatmap data:', data);
        return data;
    };

    const getCombinedHeatmapData = async () => {
        const res = await authFetch(`${API_URL}/track/heatmap/combined`);
        const data = await res.json();
        console.log('Combined heatmap data:', data);
        return data;
    };

    return (
        <HabitContext.Provider
            value={{
                habits,
                isLoading,
                isHydrated, // <-- NEW here
                error,
                completedToday,
                fetchHabits,
                getHabit,
                createHabit,
                updateHabit,
                deleteHabit,
                trackHabit,
                getHabitLogs,
                getHabitStats,
                getHeatmapData,
                getCombinedHeatmapData,
            }}
        >
            {children}
        </HabitContext.Provider>
    )
}

export const useHabits = () => {
    const context = useContext(HabitContext)
    if (!context) {
        throw new Error("useHabits must be used within a HabitProvider")
    }
    return context
}
