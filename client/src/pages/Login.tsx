"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { ThemeProvider } from "../components/themeProvider"
// import { ModeToggle } from "../components/mode-toggle"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
    const { login } = useAuth()
    // console.log("Submitting login with values:", login)
    // const { toast } = useToast()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: LoginFormValues) => {
        // console.log("Submitting login with values:", values)
        setIsLoading(true)

        try {
            await login(values.email, values.password)
            navigate("/")
        } catch (error) {
            toast("Error", {
                style: {
                    background: "#1e293b",
                    color: "#f1f5f9",
                },
                description: error instanceof Error ? error.message : "Failed to login",
                className: "text-destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ThemeProvider defaultTheme="light" storageKey="habit-tracker-theme">
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                {/* <div className="absolute right-4 top-4">
                    <ModeToggle />
                </div> */}

                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>Enter your email and password to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="your.email@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                                Register
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </ThemeProvider>
    )
}
