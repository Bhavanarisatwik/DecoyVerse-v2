import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute, PublicRoute } from "./components/auth/ProtectedRoute"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Subscription from "./pages/Subscription"
import Onboarding from "./pages/Onboarding"
import Nodes from "./pages/Nodes"
import Decoys from "./pages/Decoys"
import Honeytokens from "./pages/Honeytokens"
import Logs from "./pages/Logs"
import Alerts from "./pages/Alerts"
import AIInsights from "./pages/AIInsights"
import Grafana from "./pages/Grafana"
import Settings from "./pages/Settings"
import Configuration from "./pages/Configuration"
import Vault from "./pages/Vault"

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes - Redirect to dashboard if logged in */}
            <Route path="/auth/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/auth/signup" element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            } />

            {/* Onboarding Routes - Protected */}
            <Route path="/onboarding" element={
                <ProtectedRoute>
                    <Onboarding />
                </ProtectedRoute>
            } />
            <Route path="/onboarding/subscription" element={
                <ProtectedRoute>
                    <Subscription />
                </ProtectedRoute>
            } />
            <Route path="/onboarding/agent" element={
                <ProtectedRoute>
                    <Onboarding />
                </ProtectedRoute>
            } />

            {/* Dashboard Routes - Protected */}
            <Route element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/nodes" element={<Nodes />} />
                <Route path="/decoys" element={<Decoys />} />
                <Route path="/honeytokens" element={<Honeytokens />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/grafana" element={<Grafana />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/configuration" element={<Configuration />} />
                <Route path="/vault" element={<Vault />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <AppRoutes />
                    <Toaster position="top-right" theme="dark" richColors closeButton duration={4000} />
                </AuthProvider>
            </Router>
        </ThemeProvider>
    )
}

export default App
