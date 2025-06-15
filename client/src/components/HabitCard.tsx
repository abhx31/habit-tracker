"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useHabits } from "../context/HabitContext"
import type { Habit } from "../types/index"
import { CATEGORY_OPTIONS } from "../types/index"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { CheckCircle, Circle, MoreHorizontal, Edit, Trash2, Eye, Target, Calendar, Loader2, Medal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
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

const getBadgeImage = (badge: string) => {
  const badgeMap: { [key: string]: string } = {
    "Bronze": "/src/assets/badges/bronze.png",
    "Silver": "/src/assets/badges/silver.png",
    "Gold": "/src/assets/badges/gold.png",
    "Diamond": "/src/assets/badges/diamond.png",
    "Ace": "/src/assets/badges/ace.png",
    "Overachiever": "/src/assets/badges/over-achiever.png"
  }
  return badgeMap[badge] || ""
}

export function HabitCard({
  habit,
  completed = false,
  onToggleComplete = () => {},
  isLoading = false,
}: HabitCardProps) {
  const { deleteHabit } = useHabits()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Safely handle category lookup
  const normalizedCategory = habit.category?.toLowerCase?.() ?? ""
  const category = CATEGORY_OPTIONS.find((c) => c.value.toLowerCase() === normalizedCategory)

  const handleDelete = async () => {
    if (!habit._id) {
      toast.error("Invalid habit ID")
      return
    }

    setIsDeleting(true)
    try {
      await deleteHabit(habit._id)
      toast.success("Habit deleted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete habit")
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  if (!habit) {
    return null
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{habit.name}</CardTitle>
                {category && (
                  <Badge
                    variant="outline"
                    className="border-0 text-white font-medium px-3 py-1"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}80, ${category.color})`,
                    }}
                  >
                    {category.label}
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <DropdownMenuItem onClick={() => setShowEditForm(true)} className="hover:bg-gray-50">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteAlert(true)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {habit.description && <p className="text-sm text-gray-600 leading-relaxed">{habit.description}</p>}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-violet-500" />
                <span className="font-medium text-gray-700">Frequency:</span>
                <span className="capitalize text-gray-600">{habit.frequency?.type ?? "Not set"}</span>
              </div>

              {habit.goal && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-violet-500" />
                  <span className="font-medium text-gray-700">Goal:</span>
                  <span className="text-gray-600">
                    {habit.goal.target} {habit.goal.unit}
                  </span>
                </div>
              )}

              {habit.badge && (
                <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-100">
                  <Medal className="h-4 w-4 text-violet-500" />
                  <span className="font-medium text-gray-700">Current Badge:</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={getBadgeImage(habit.badge)}
                      alt={habit.badge}
                      className="w-6 h-6"
                      title={`${habit.badge} Badge`}
                    />
                    <span className="text-gray-600">{habit.badge}</span>
                  </div>
                </div>
              )}
            </div>

          </CardContent>

          <CardFooter className="flex justify-between pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            >
              <Link to={`/dashboard/habits/${habit._id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleComplete}
              disabled={isLoading}
              className={`transition-all duration-200 ${
                completed
                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                  : "text-gray-600 hover:text-violet-600 hover:bg-violet-50"
              }`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="mr-2"
                >
                  <Loader2 className="h-4 w-4" />
                </motion.div>
              ) : completed ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <Circle className="mr-2 h-4 w-4" />
              )}
              {completed ? "Completed" : "Mark Complete"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit "{habit.name}" and all associated data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Habit Edit Form Dialog */}
      {showEditForm && <HabitFormDialog open={showEditForm} onOpenChange={setShowEditForm} habitId={habit._id} />}
    </>
  )
}
