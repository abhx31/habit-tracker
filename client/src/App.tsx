import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
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
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="habit-tracker-theme">
      <AuthProvider>
        <HabitProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </HabitProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
