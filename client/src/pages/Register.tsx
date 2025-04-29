"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { ThemeProvider } from "../components/themeProvider"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.string().refine(val => /^\d+$/.test(val), { message: "Age must be a valid number" }),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
    const { register } = useAuth()
    // const { toast } = useToast()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            age: "",
            email: "",
            password: "",
        },
    })

    const onSubmit = async (rawValues: RegisterFormValues) => {
        // Parse and transform the values according to your schema
        setIsLoading(true);
        const result = registerSchema.safeParse(rawValues);

        if (result.success) {
            const values: RegisterFormValues = result.data;
            // Now values.age is properly typed as a number
            await register(values.name, Number(values.age), values.email, values.password);
            navigate('/login')
        } else {
            // Handle validation errors
            console.error(result.error);
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
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription>Enter your information to create an account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Enter Your Age" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    {isLoading ? "Creating account..." : "Register"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </ThemeProvider >
    )
}
