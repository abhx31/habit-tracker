export interface User {
    id: string
    name: string
    email: string
    age: number
    createdAt: string
    preferences?: {
        theme?: "light" | "dark"
        reminderTime?: string
        weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    }
}

export interface Habit {
    _id: string
    userId: string
    name: string
    description?: string
    category: string
    frequency: {
        type: "daily" | "weekly" | "monthly"
        days?: number[]
        dates?: number[]
    }
    goal?: {
        target: number
        unit: string
    }
    badge?: string
    color?: string
    icon?: string
    reminderTime?: string
    createdAt: string
    updatedAt: string
    archivedAt?: string
}

export interface HabitLog {
    id: string
    habitId: string
    userId: string
    date: string
    completed: boolean
    value?: number
    notes?: string
    createdAt: string
}

export interface HabitLogResponse {
    logs: HabitLog[]
    currentStreak: number
}

export interface HabitStats {
    habitId: string
    currentStreak: number
    longestStreak: number
    completionRate: number
    totalCompletions: number
    weeklyProgress: {
        date: string
        completed: boolean
    }[]
    monthlyProgress: {
        date: string
        completionRate: number
    }[]
}

export interface CategoryOption {
    value: string
    label: string
    color: string
    icon?: string
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
    { value: "health", label: "Health", color: "#10b981" },
    { value: "fitness", label: "Fitness", color: "#3b82f6" },
    { value: "productivity", label: "Productivity", color: "#8b5cf6" },
    { value: "learning", label: "Learning", color: "#f59e0b" },
    { value: "finance", label: "Finance", color: "#10b981" },
    { value: "mindfulness", label: "Mindfulness", color: "#ec4899" },
    { value: "social", label: "Social", color: "#ef4444" },
    { value: "creativity", label: "Creativity", color: "#6366f1" },
    { value: "other", label: "Other", color: "#6b7280" },
]
export interface TodayHabitLog {
    _id: string;
    userId: string;
    habitId: string;
    date: string;
}

