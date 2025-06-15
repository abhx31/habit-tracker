"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog"
import { format } from "date-fns"
import { API_URL } from "../config"
import { User, Mail, Calendar, Shield, Loader2, BadgeCheck } from "lucide-react"

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

export default function Profile() {
  const { user, logout, token } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    if (!token) {
      toast.error("Authentication token not found")
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`${API_URL}/user/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete account")
      }

      toast.success("Account deleted successfully")
      logout()
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-violet-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <BadgeCheck className="w-8 h-8 text-violet-500" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Account Information
            </h1>
            <p className="text-gray-600 mt-2">View your account details and settings</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-violet-500/5 to-purple-500/5 pb-6">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="w-6 h-6 text-violet-500" />
              Profile Details
            </CardTitle>
            <CardDescription>Your personal account information</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100/50">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <User className="w-6 h-6 text-violet-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100/50">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Mail className="w-6 h-6 text-violet-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100/50">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Calendar className="w-6 h-6 text-violet-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {user.createdAt ? format(new Date(user.createdAt), "MMMM d, yyyy") : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-gradient-to-r from-violet-500/5 to-purple-500/5 p-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full h-12 bg-red-500/90 hover:bg-red-600 text-white font-medium rounded-xl"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
