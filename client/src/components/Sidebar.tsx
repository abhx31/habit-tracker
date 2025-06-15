"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui/button"
import { HabitFormDialog } from "./HabitFormDialog"
import { LayoutDashboard, BarChart3, User, PlusCircle, LogOut, Menu, X, TrendingUp, Sparkles, ListTodo, Trophy } from "lucide-react"

const sidebarVariants = {
  open: {
    width: "280px",
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 40,
    },
  },
  closed: {
    width: "80px",
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 40,
    },
  },
}

const menuItemVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Todos", href: "/dashboard/todos", icon: ListTodo },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [showHabitForm, setShowHabitForm] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <motion.div
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        className="bg-white/80 backdrop-blur-lg border-r border-white/20 shadow-2xl relative z-20"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        HabitFlow
                      </h1>
                      <p className="text-xs text-gray-500">Build better habits</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 w-8 hover:bg-gray-100"
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Add Button */}
          <div className="p-4">
            <Button
              onClick={() => setShowHabitForm(true)}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span variants={menuItemVariants} initial="closed" animate="open" exit="closed">
                    New Habit
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = isActivePath(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                      />
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            variants={menuItemVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="font-medium"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && (
                        <motion.div layoutId="activeIndicator" className="ml-auto">
                          <Sparkles className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div variants={menuItemVariants} initial="closed" animate="open" exit="closed">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span 
                    variants={{
                      open: { 
                        x: 0, 
                        opacity: 1,
                        transition: { 
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }
                      },
                      closed: { 
                        x: -20, 
                        opacity: 0,
                        transition: { 
                          duration: 0.2 
                        }
                      }
                    }}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.div>

      {showHabitForm && <HabitFormDialog open={showHabitForm} onOpenChange={setShowHabitForm} />}
    </>
  )
}
