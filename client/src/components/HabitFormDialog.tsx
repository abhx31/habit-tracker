"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useHabits } from "../context/HabitContext"
import { CATEGORY_OPTIONS } from "../types"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Loader2 } from "lucide-react"

const habitSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    frequencyType: z.enum(["daily", "weekly", "monthly"]),
    days: z.array(z.number()).optional(),
    dates: z.array(z.number()).optional(),
    goalTarget: z.string().optional(),
    goalUnit: z.string().optional(),
})

type HabitFormValues = z.infer<typeof habitSchema>

interface HabitFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    habitId?: string
}

export function HabitFormDialog({ open, onOpenChange, habitId }: HabitFormDialogProps) {
    const { createHabit, updateHabit, habits } = useHabits()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const habit = habits.find(h => h._id === habitId)

    const form = useForm<HabitFormValues>({
        resolver: zodResolver(habitSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            frequencyType: "daily",
            days: [],
            dates: [],
            goalTarget: "",
            goalUnit: "",
        },
    })

    useEffect(() => {
        if (habit) {
            form.reset({
                name: habit.name || "",
                description: habit.description || "",
                category: habit.category || "",
                frequencyType: (habit.frequency?.type as "daily" | "weekly" | "monthly") || "daily",
                days: habit.frequency?.days || [],
                dates: habit.frequency?.dates || [],
                goalTarget: habit.goal?.target?.toString() || "",
                goalUnit: habit.goal?.unit || "",
            })
        }
        setIsLoading(false)
    }, [habit, form])

    const frequencyType = form.watch("frequencyType")

    const onSubmit = async (values: HabitFormValues) => {
        setIsSubmitting(true)

        try {
            const habitData = {
                name: values.name,
                description: values.description,
                category: values.category,
                frequency: {
                    type: values.frequencyType,
                    days: values.frequencyType === "weekly" ? values.days : undefined,
                    dates: values.frequencyType === "monthly" ? values.dates : undefined,
                },
                goal:
                    values.goalTarget && values.goalUnit
                        ? {
                            target: Number.parseFloat(values.goalTarget),
                            unit: values.goalUnit,
                        }
                        : undefined,
            }

            if (habitId) {
                await updateHabit(habitId, habitData)
                toast.success("Habit updated successfully!", {
                    className: "bg-green-50 border border-green-200",
                    description: "Your changes have been saved.",
                })
            } else {
                await createHabit(habitData)
                toast.success("Habit created successfully!", {
                    className: "bg-green-50 border border-green-200",
                    description: "Your new habit has been created.",
                })
            }

            onOpenChange(false)
        } catch (error) {
            toast.error("Something went wrong", {
                className: "bg-red-50 border border-red-200",
                description: error instanceof Error ? error.message : "Failed to save habit",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const weekdays = [
        { value: 0, label: "Sunday" },
        { value: 1, label: "Monday" },
        { value: 2, label: "Tuesday" },
        { value: 3, label: "Wednesday" },
        { value: 4, label: "Thursday" },
        { value: 5, label: "Friday" },
        { value: 6, label: "Saturday" },
    ]

    const monthDates = Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}`,
    }))

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] p-6 bg-white/95 backdrop-blur-sm">
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-6 bg-white/95 backdrop-blur-sm">
                <DialogHeader className="space-y-3 pb-4 border-b">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {habitId ? "Edit Habit" : "Create New Habit"}
                    </DialogTitle>
                    <p className="text-gray-500 text-sm">
                        {habitId
                            ? "Update your habit details and preferences below."
                            : "Fill in the details below to create your new habit."}
                    </p>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-gray-700">Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter habit name"
                                            className="h-11 bg-white/50 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-gray-700">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What would you like to achieve with this habit?"
                                            className="min-h-[100px] bg-white/50 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-xs" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Category</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 bg-white/50 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                                                {CATEGORY_OPTIONS.map((category) => (
                                                    <SelectItem
                                                        key={category.value}
                                                        value={category.value}
                                                        className="hover:bg-violet-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-3 w-3 rounded-full"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            {category.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="frequencyType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Frequency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 bg-white/50 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20">
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                                                <SelectItem value="daily" className="hover:bg-violet-50">Daily</SelectItem>
                                                <SelectItem value="weekly" className="hover:bg-violet-50">Weekly</SelectItem>
                                                <SelectItem value="monthly" className="hover:bg-violet-50">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {frequencyType === "weekly" && (
                            <FormField
                                control={form.control}
                                name="days"
                                render={({ field }) => (
                                    <FormItem className="bg-violet-50/50 p-4 rounded-lg border border-violet-100">
                                        <FormLabel className="text-sm font-semibold text-gray-700">Days of the Week</FormLabel>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                            {weekdays.map((day) => (
                                                <FormControl key={day.value}>
                                                    <div className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
                                                        <Checkbox
                                                            checked={field.value?.includes(day.value)}
                                                            onCheckedChange={(checked) => {
                                                                const updatedDays = checked
                                                                    ? [...(field.value || []), day.value]
                                                                    : (field.value || []).filter((d) => d !== day.value)
                                                                field.onChange(updatedDays)
                                                            }}
                                                            className="border-violet-200 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                                                        />
                                                        <label className="text-sm font-medium text-gray-600">{day.label}</label>
                                                    </div>
                                                </FormControl>
                                            ))}
                                        </div>
                                        <FormMessage className="text-red-500 text-xs mt-2" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {frequencyType === "monthly" && (
                            <FormField
                                control={form.control}
                                name="dates"
                                render={({ field }) => (
                                    <FormItem className="bg-violet-50/50 p-4 rounded-lg border border-violet-100">
                                        <FormLabel className="text-sm font-semibold text-gray-700">Dates of the Month</FormLabel>
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                                            {monthDates.map((date) => (
                                                <FormControl key={date.value}>
                                                    <div className="flex items-center justify-center bg-white p-2 rounded-md shadow-sm">
                                                        <Checkbox
                                                            checked={field.value?.includes(date.value)}
                                                            onCheckedChange={(checked) => {
                                                                const updatedDates = checked
                                                                    ? [...(field.value || []), date.value]
                                                                    : (field.value || []).filter((d) => d !== date.value)
                                                                field.onChange(updatedDates)
                                                            }}
                                                            className="border-violet-200 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                                                        />
                                                        <label className="text-sm font-medium text-gray-600 ml-2">{date.label}</label>
                                                    </div>
                                                </FormControl>
                                            ))}
                                        </div>
                                        <FormMessage className="text-red-500 text-xs mt-2" />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                            <FormField
                                control={form.control}
                                name="goalTarget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Goal Target</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 10"
                                                className="h-11 bg-white border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="goalUnit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Goal Unit</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., minutes, pages"
                                                className="h-11 bg-white border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="bg-white hover:bg-gray-50 border-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    habitId ? "Update Habit" : "Create Habit"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
