"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { API_URL } from "../config"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Loader2, Plus, CheckCircle2, Circle, Pencil, Trash2, ListTodo } from "lucide-react"

interface Todo {
  _id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
}

export default function Todos() {
  const { token } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTodo, setNewTodo] = useState({ title: "", description: "" })
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch todos")
      }

      const data = await response.json()
      setTodos(data.todos)
    } catch (error) {
      toast.error("Failed to load todos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [token])

  const handleCreateTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error("Title is required")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/todo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTodo),
      })

      if (!response.ok) {
        throw new Error("Failed to create todo")
      }

      const data = await response.json()
      setTodos([...todos, data.todo])
      setNewTodo({ title: "", description: "" })
      toast.success("Todo created successfully!")
    } catch (error) {
      toast.error("Failed to create todo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim()) {
      toast.error("Title is required")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/todo/${editingTodo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update todo")
      }

      const data = await response.json()
      setTodos(todos.map((todo) => (todo._id === editingTodo._id ? data.todo : todo)))
      setEditingTodo(null)
      toast.success("Todo updated successfully!")
    } catch (error) {
      toast.error("Failed to update todo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/todo/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete todo")
      }

      setTodos(todos.filter((todo) => todo._id !== id))
      toast.success("Todo deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete todo")
    }
  }

  const handleMarkDone = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/todo/done/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to mark todo as done")
      }

      setTodos(todos.map((todo) => (todo._id === id ? { ...todo, completed: true } : todo)))
      toast.success("Todo marked as complete!")
    } catch (error) {
      toast.error("Failed to mark todo as done")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <ListTodo className="w-8 h-8 text-violet-500" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Todo List
            </h1>
            <p className="text-gray-600 mt-2">Manage your tasks and stay organized</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-violet-500/5 to-purple-500/5">
            <CardTitle className="text-xl">Add New Todo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Todo title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleCreateTodo}
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Todo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        {todos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No todos yet. Create one to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <motion.div
              key={todo._id}
              variants={itemVariants}
              className="group"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            todo.completed
                              ? "text-green-500 hover:text-green-600"
                              : "text-gray-400 hover:text-violet-500"
                          }`}
                          onClick={() => !todo.completed && handleMarkDone(todo._id)}
                          disabled={todo.completed}
                        >
                          {todo.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </Button>
                        <h3
                          className={`font-semibold ${
                            todo.completed ? "text-gray-500 line-through" : "text-gray-900"
                          }`}
                        >
                          {todo.title}
                        </h3>
                      </div>
                      {todo.description && (
                        <p className={`text-sm ${todo.completed ? "text-gray-400" : "text-gray-600"}`}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-violet-500"
                            onClick={() => setEditingTodo(todo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Todo</DialogTitle>
                            <DialogDescription>Make changes to your todo here.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Input
                                placeholder="Todo title"
                                value={editingTodo?.title}
                                onChange={(e) =>
                                  setEditingTodo(editingTodo ? { ...editingTodo, title: e.target.value } : null)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Description"
                                value={editingTodo?.description}
                                onChange={(e) =>
                                  setEditingTodo(
                                    editingTodo ? { ...editingTodo, description: e.target.value } : null,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleUpdateTodo}
                              disabled={isSubmitting}
                              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                        onClick={() => handleDeleteTodo(todo._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}