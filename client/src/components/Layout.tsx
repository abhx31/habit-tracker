"use client"

import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { useAuth } from "../context/AuthContext"

const Layout = () => {
    const { user } = useAuth()

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-6xl">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
