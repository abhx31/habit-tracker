"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useHabits } from "../context/HabitContext"
import type { Habit } from "../types/index"
import { CATEGORY_OPTIONS } from "../types/index"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
    CheckCircle,
    Circle,
    MoreHorizontal,
    Edit,
    Trash2,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog"
import { HabitFormDialog } from "./HabitFormDialog"

interface HabitCardProps {
    habit: Habit
    completed?: boolean
    onToggleComplete?: () => void
    isLoading?: boolean
}

export function HabitCard({
    habit,
    completed = false,
    onToggleComplete = () => { },
    isLoading = false,
}: HabitCardProps) {
    const { deleteHabit } = useHabits()
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Normalize and find category (case-insensitive match)
    const normalizedCategory = habit.category?.toLowerCase?.()
    const category = CATEGORY_OPTIONS.find(
        (c) => c.value.toLowerCase() === normalizedCategory
    )

    if (!category) {
        console.warn("Unknown category value:", habit.category)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteHabit(habit._id)
            toast("Habit deleted", {
                style: { background: "#1e293b", color: "#f1f5f9" },
                description: "Your habit has been deleted successfully.",
            })
        } catch (error) {
            toast("Error", {
                style: { background: "#1e293b", color: "#f1f5f9" },
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred while deleting.",
                className: "text-destructive",
            })
        } finally {
            setIsDeleting(false)
            setShowDeleteAlert(false)
        }
    }

    return (
        <>
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{habit.name}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteAlert(true)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Category Badge */}
                    {category ? (
                        <Badge
                            variant="outline"
                            className="mt-1"
                            style={{ borderColor: category.color, color: category.color }}
                        >
                            {category.label}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="mt-1 text-red-500 border-red-500">
                            Unknown Category
                        </Badge>
                    )}
                </CardHeader>

                <CardContent>
                    {habit.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                            {habit.description}
                        </p>
                    )}
                    <div className="text-sm">
                        <div className="flex items-center gap-1">
                            <span className="font-medium">Frequency:</span>
                            <span className="capitalize">{habit.frequency.type}</span>
                            {habit.frequency.type === "weekly" &&
                                habit.frequency.days && (
                                    <span>
                                        (
                                        {habit.frequency.days
                                            .map((d) => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d])
                                            .join(", ")}
                                        )
                                    </span>
                                )}
                        </div>
                        {habit.goal && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className="font-medium">Goal:</span>
                                <span>
                                    {habit.goal.target} {habit.goal.unit}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to={`/habits/${habit._id}`}>View Details</Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleComplete}
                        disabled={isLoading}
                        className={completed ? "text-green-600 dark:text-green-500" : ""}
                    >
                        {completed ? (
                            <CheckCircle className="mr-1 h-4 w-4" />
                        ) : (
                            <Circle className="mr-1 h-4 w-4" />
                        )}
                        {completed ? "Completed" : "Mark Complete"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the habit "{habit.name}" and all
                            associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Habit Edit Form Dialog */}
            {showEditForm && (
                <HabitFormDialog
                    open={showEditForm}
                    onOpenChange={setShowEditForm}
                    habitId={habit._id}
                />
            )}
        </>
    )
}
