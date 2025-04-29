"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui/button"
import { LayoutDashboard, BarChart, Settings, PlusCircle, LogOut } from "lucide-react"
// import { ModeToggle } from "./mode-toggle"
// import { useHabits } from "../context/HabitContext"
import { useState } from "react"
import { HabitFormDialog } from "./HabitFormDialog"

const Sidebar = () => {
    const { user, logout } = useAuth()
    // const { habits } = useHabits()
    const location = useLocation()
    const navigate = useNavigate()
    const [showHabitForm, setShowHabitForm] = useState(false)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    // console.log(user); // Here I can see user Object
    // console.log("user.name:", user?.name)


    return (
        <>
            <div className="flex h-full w-64 flex-col border-r bg-card">
                <div className="flex h-16 items-center border-b px-4">
                    <h1 className="text-xl font-bold">Habit Tracker</h1>
                </div>

                <div className="flex-1 overflow-auto py-4">
                    <div className="px-4 mb-4">
                        <Button variant="default" className="w-full justify-start gap-2" onClick={() => setShowHabitForm(true)}>
                            <PlusCircle className="h-4 w-4" />
                            New Habit
                        </Button>
                    </div>

                    <nav className="space-y-1 px-2">
                        <Link to="/">
                            <Button
                                variant={location.pathname === "/" ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>

                        <Link to="/analytics">
                            <Button
                                variant={location.pathname === "/analytics" ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <BarChart className="h-4 w-4" />
                                Analytics
                            </Button>
                        </Link>

                        <Link to="/profile">
                            <Button
                                variant={location.pathname === "/profile" ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                Profile
                            </Button>
                        </Link>
                    </nav>
                </div>

                <div className="border-t p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                {user?.name?.[0]}
                            </div>
                            <div className="text-sm font-medium ">{user?.name}</div>
                        </div>
                        {/* <ModeToggle /> */}
                    </div>

                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {showHabitForm && <HabitFormDialog open={showHabitForm} onOpenChange={setShowHabitForm} />}
        </>
    )
}

export default Sidebar
