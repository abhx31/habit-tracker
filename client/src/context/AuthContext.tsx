"use client"

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react"
import type { User } from "../types"
import { API_URL, AUTH_URL } from "../config"
import { toast } from "sonner"

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, age: number, email: string, password: string) => Promise<void>
    logout: () => void
    updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user")
        return storedUser ? JSON.parse(storedUser) : null
    })

    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }

        setIsLoading(false)

        // Optional: validate token if you want freshness check
        const validateToken = async () => {
            try {
                const response = await fetch(`${API_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                })

                if (!response.ok) throw new Error()

                const userData = await response.json()
                setUser(userData.user)
                localStorage.setItem("user", JSON.stringify(userData.user))
            } catch (err) {
                logout() // or setToken(null) etc
                toast("Session expired", { description: "Please log in again." })
            }
        }

        if (storedToken) {
            validateToken()
        }
    }, [])


    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${AUTH_URL}/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to login")
            }

            if (!data.token || !data.user) {
                throw new Error("Token or user missing in response")
            }

            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))
            setToken(data.token)
            setUser(data.user)
        } catch (error) {
            throw error
        }
    }

    const register = async (name: string, age: number, email: string, password: string) => {
        try {
            const response = await fetch(`${AUTH_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, age, email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Registration failed")
            }

            if (!data.token || !data.user) {
                throw new Error("Token or user missing in response")
            }

            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))
            setToken(data.token)
            setUser(data.user)
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
    }

    const updateUser = async (userData: Partial<User>) => {
        if (!token) return

        const response = await fetch(`${API_URL}/user`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to update user")
        }

        const updatedUser = await response.json()
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}
