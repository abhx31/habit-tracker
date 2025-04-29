"use client"

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react"
import type { Habit, HabitLog, HabitStats } from "../types"
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
    createHabit: (habit: Omit<Habit, "_id" | "userId" | "createdAt">) => Promise<Habit>
    updateHabit: (id: string, habit: Partial<Habit>) => Promise<Habit>
    deleteHabit: (id: string) => Promise<void>
    trackHabit: (habitId: string, date: string, completed: boolean) => Promise<void>
    getHabitLogs: (habitId: string) => Promise<HabitLog[]>
    getHabitStats: (habitId: string) => Promise<HabitStats>
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
            console.log("data.logs:", data.logs);

            if (Array.isArray(data.logs)) {
                const habitIds = data.logs.map((log: any) => log.habitId.toString());
                setCompletedToday(habitIds);
            } else {
                console.error("logs is not an array!", data.logs);
                setCompletedToday([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not load completed habits today");
        }
    };




    useEffect(() => {
        if (isAuthenticated && token) {
            fetchHabits()
            fetchCompletedToday()
        }
    }, [isAuthenticated, token])

    const getHabit = (id: string) => habits.find(habit => habit._id === id)

    const createHabit = async (habit: Omit<Habit, "_id" | "userId" | "createdAt">) => {
        const res = await authFetch(`${API_URL}/habits`, {
            method: "POST",
            body: JSON.stringify(habit),
        })
        const newHabit = await res.json()
        setHabits(prev => [...prev, newHabit])
        return newHabit
    }

    const updateHabit = async (id: string, habit: Partial<Habit>) => {
        const res = await authFetch(`${API_URL}/habits/${id}`, {
            method: "PUT",
            body: JSON.stringify(habit),
        })
        const updatedHabit = await res.json()
        setHabits(prev => prev.map(h => (h._id === id ? { ...h, ...updatedHabit } : h)))
        return updatedHabit
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


    const getHabitLogs = async (habitId: string): Promise<HabitLog[]> => {
        const res = await authFetch(`${API_URL}/track/${habitId}`)
        const data = await res.json()

        if (!Array.isArray(data.logs)) {
            console.error("Invalid logs data:", data)
            return []
        }

        return data.logs
    }

    const getHabitStats = async (habitId: string): Promise<HabitStats> => {
        const res = await authFetch(`${API_URL}/track/summary/${habitId}`)
        return res.json()
    }

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
