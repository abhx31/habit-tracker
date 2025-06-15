import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { HabitProvider } from "./context/HabitContext"
import { ThemeProvider } from "./components/themeProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import HabitDetail from "./pages/HabitDetail"
import Profile from "./pages/Profile"
import Analytics from "./pages/Analytics"
import Todos from "./pages/Todos"
import LeaderBoard from "./pages/LeaderBoard"
import { Toaster } from "./components/ui/sonner"
import Landing from "./pages/Landing"
import { ErrorBoundary } from "./components/ErrorBoundary"

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} 
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="habits/:id" element={<HabitDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="todos" element={<Todos />} />
          <Route path="leaderboard" element={<LeaderBoard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="habit-tracker-theme">
      <ErrorBoundary>
        <AuthProvider>
          <HabitProvider>
            <Router>
              <AppRoutes />
              <Toaster />
            </Router>
          </HabitProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
