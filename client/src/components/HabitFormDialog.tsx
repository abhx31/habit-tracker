"use client"

import { useState } from "react"
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
    const { createHabit, updateHabit, getHabit } = useHabits()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const habit = habitId ? getHabit(habitId) : undefined

    const form = useForm<HabitFormValues>({
        resolver: zodResolver(habitSchema),
        defaultValues: {
            name: habit?.name || "",
            description: habit?.description || "",
            category: habit?.category || "",
            frequencyType: habit?.frequency.type || "daily",
            days: habit?.frequency.days || [],
            dates: habit?.frequency.dates || [],
            goalTarget: habit?.goal?.target.toString() || "",
            goalUnit: habit?.goal?.unit || "",
        },
    })

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
                toast("Habit updated", {
                    style: {
                        background: "#1e293b", // dark slate
                        color: "#f1f5f9",       // light text
                    },
                    description: "Your habit has been updated successfully.",
                })
            } else {
                await createHabit(habitData)
                toast("Habit created", {
                    style: {
                        background: "#1e293b", // dark slate
                        color: "#f1f5f9",       // light text
                    },
                    description: "Your new habit has been created successfully.",
                })
            }

            onOpenChange(false)
        } catch (error) {
            toast("Error", {
                style: {
                    background: "#1e293b", // dark slate
                    color: "#f1f5f9",       // light text
                },
                description: error instanceof Error ? error.message : "An error occurred",
                className: "text-destructive",
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{habitId ? "Edit Habit" : "Create New Habit"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Habit name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe your habit" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CATEGORY_OPTIONS.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                                                        {category.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="frequencyType"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Frequency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {frequencyType === "weekly" && (
                            <FormField
                                control={form.control}
                                name="days"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Days of the Week</FormLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {weekdays.map((day) => (
                                                <FormControl key={day.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            checked={field.value?.includes(day.value)}
                                                            onCheckedChange={(checked) => {
                                                                const updatedDays = checked
                                                                    ? [...(field.value || []), day.value]
                                                                    : (field.value || []).filter((d: any) => d !== day.value)
                                                                field.onChange(updatedDays)
                                                            }}
                                                        />
                                                        <label className="text-sm">{day.label}</label>
                                                    </div>
                                                </FormControl>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {frequencyType === "monthly" && (
                            <FormField
                                control={form.control}
                                name="dates"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Dates of the Month</FormLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {monthDates.map((date) => (
                                                <FormControl key={date.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            checked={field.value?.includes(date.value)}
                                                            onCheckedChange={(checked) => {
                                                                const updatedDates = checked
                                                                    ? [...(field.value || []), date.value]
                                                                    : (field.value || []).filter((d: any) => d !== date.value)
                                                                field.onChange(updatedDates)
                                                            }}
                                                        />
                                                        <label className="text-sm">{date.label}</label>
                                                    </div>
                                                </FormControl>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="goalTarget"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Goal Target (optional)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="goalUnit"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Goal Unit (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., minutes, pages" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : habitId ? "Update Habit" : "Create Habit"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
