"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "../components/ui/card"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "../components/ui/form"
import { Input } from "../components/ui/input"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger
} from "../components/ui/alert-dialog"
import { format } from "date-fns"
import { API_URL } from "../config"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    age: z
        .string()
        .refine(val => {
            const num = Number(val)
            return !isNaN(num) && num > 0
        }, {
            message: "Age must be a valid number greater than 0",
        }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Profile() {
    const { user, updateUser, logout, token } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            email: "",
            age: "",
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name ?? "",
                email: user.email ?? "",
                age: user.age !== undefined ? String(user.age) : "",
            })
        }
    }, [user, form])

    const onSubmit = async (values: ProfileFormValues) => {
        setIsLoading(true)

        try {
            await updateUser({
                name: values.name,
                age: Number(values.age), // converting string to number
            })

            toast("Profile updated", {
                style: {
                    background: "#1e293b",
                    color: "#f1f5f9",
                },
                description: "Your profile has been updated successfully.",
            })
        } catch (error) {
            toast("Error", {
                style: {
                    background: "#1e293b",
                    color: "#f1f5f9",
                },
                description: error instanceof Error ? error.message : "Failed to update profile",
                className: "text-destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch(`${API_URL}/user/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Add token from context
                },
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to delete account")
            }

            toast("Account deleted", {
                style: {
                    background: "#1e293b",
                    color: "#f1f5f9",
                },
                description: "Your account has been deleted successfully.",
            })

            logout()
        } catch (error) {
            console.log(error)
            toast("Error", {
                style: {
                    background: "#1e293b",
                    color: "#f1f5f9",
                },
                description: error instanceof Error ? error.message : "Failed to delete account",
                className: "text-destructive",
            })
        }
    }


    if (!user) {
        return <div>Loading profile...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
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
                                                <Input {...field} />
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
                                                <Input type="text" {...field} />
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
                                                <Input {...field} disabled />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>View and manage your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium">Name</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {user.name}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium">Email</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {user.email}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Account Created</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {user.createdAt ? format(new Date(user.createdAt), "MMMM d, yyyy") : "Unknown"}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account and remove all your data
                                        from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
