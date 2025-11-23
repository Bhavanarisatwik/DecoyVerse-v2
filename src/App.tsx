import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/onboarding/subscription" element={<Subscription />} />
                <Route path="/onboarding/agent" element={<Onboarding />} />

                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/nodes" element={<Nodes />} />
                    <Route path="/decoys" element={<Decoys />} />
                    <Route path="/honeytokens" element={<Honeytokens />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/grafana" element={<Grafana />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App
