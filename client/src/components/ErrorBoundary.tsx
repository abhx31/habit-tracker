"use client"

import React from "react"
import { Button } from "./ui/button"

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-white/10 p-8 backdrop-blur-lg">
                    <h2 className="mb-4 text-2xl font-bold text-red-500">Something went wrong</h2>
                    <p className="mb-6 text-center text-gray-600">
                        {this.state.error?.message || "An unexpected error occurred"}
                    </p>
                    <Button
                        onClick={() => {
                            this.setState({ hasError: false, error: null })
                            window.location.reload()
                        }}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        Try again
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
} 