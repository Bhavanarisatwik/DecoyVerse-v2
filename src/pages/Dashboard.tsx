import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { ShieldAlert, Server, Activity, ArrowDownRight, AlertCircle, X, AlertTriangle } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Breadcrumb } from "../components/common/Breadcrumb"
import { Badge } from "../components/common/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { dashboardApi, type Alert, type DashboardStats, type Attack } from "../api/endpoints/dashboard"
import { ThreatModal } from "../components/common/ThreatModal"

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [attacks, setAttacks] = useState<Attack[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal & Toast State
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
    const [newAlertToast, setNewAlertToast] = useState<Alert | null>(null)
    const lastSeenAlertId = useRef<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [statsResponse, alertsResponse, attacksResponse] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getAlerts(10),
                    dashboardApi.getRecentAttacks(20),
                ])

                setStats(statsResponse.data)

                const fetchedAlerts = alertsResponse.data
                setAlerts(fetchedAlerts)
                setAttacks(attacksResponse.data)

                // Check for new alerts for toast notification
                if (fetchedAlerts.length > 0) {
                    const latestAlert = fetchedAlerts[0]

                    if (lastSeenAlertId.current === null) {
                        // First load, just record the latest ID
                        lastSeenAlertId.current = latestAlert.id
                    } else if (lastSeenAlertId.current !== latestAlert.id) {
                        // We have a newly detected alert!
                        lastSeenAlertId.current = latestAlert.id
                        setNewAlertToast(latestAlert)

                        // Auto-hide toast after 10 seconds
                        setTimeout(() => setNewAlertToast(null), 10000)
                    }
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    // Generate dynamic chart data from attacks
    const chartData = useMemo(() => {
        if (!attacks.length) {
            return [
                { name: 'Mon', attacks: 0, blocked: 0 },
                { name: 'Tue', attacks: 0, blocked: 0 },
                { name: 'Wed', attacks: 0, blocked: 0 },
                { name: 'Thu', attacks: 0, blocked: 0 },
                { name: 'Fri', attacks: 0, blocked: 0 },
                { name: 'Sat', attacks: 0, blocked: 0 },
                { name: 'Sun', attacks: 0, blocked: 0 },
            ]
        }

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayCounts: Record<string, { attacks: number; blocked: number }> = {}

        days.forEach(day => { dayCounts[day] = { attacks: 0, blocked: 0 } })

        attacks.forEach(attack => {
            const date = new Date(attack.timestamp)
            const day = days[date.getDay()]
            dayCounts[day].attacks++
            if (attack.risk_score < 5) dayCounts[day].blocked++
        })

        const today = new Date().getDay()
        const orderedDays = [...days.slice(today + 1), ...days.slice(0, today + 1)]

        return orderedDays.map(day => ({
            name: day,
            attacks: dayCounts[day].attacks,
            blocked: dayCounts[day].blocked,
        }))
    }, [attacks])

    // Generate dynamic activity data by hour
    const activityData = useMemo(() => {
        const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        if (!attacks.length) {
            return hours.map(time => ({ time, value: 0 }))
        }

        const hourCounts: Record<string, number> = {}
        hours.forEach(h => { hourCounts[h] = 0 })

        attacks.forEach(attack => {
            const hour = new Date(attack.timestamp).getHours()
            if (hour < 4) hourCounts['00:00']++
            else if (hour < 8) hourCounts['04:00']++
            else if (hour < 12) hourCounts['08:00']++
            else if (hour < 16) hourCounts['12:00']++
            else if (hour < 20) hourCounts['16:00']++
            else hourCounts['20:00']++
        })

        return hours.map(time => ({ time, value: hourCounts[time] }))
    }, [attacks])

    if (error) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <Card className="bg-status-danger/10 border-status-danger/50">
                    <CardContent className="pt-6">
                        <p className="text-status-danger flex items-center">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {error}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-themed-primary font-heading">Dashboard</h1>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    <span className="text-sm text-accent font-medium">System Operational</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Total Attacks</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-danger/10 flex items-center justify-center">
                            <ShieldAlert className="h-4 w-4 text-status-danger" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">
                            {loading ? '...' : stats?.total_attacks || 0}
                        </div>
                        <p className="text-xs text-themed-muted flex items-center mt-1">
                            Avg Risk: {loading ? '...' : (stats?.avg_risk_score || 0).toFixed(1)}/10
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Active Nodes</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Server className="h-4 w-4 text-accent" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">
                            {loading ? '...' : stats?.active_nodes || 0}
                        </div>
                        <p className="text-xs text-accent flex items-center mt-1">
                            {loading ? '...' : `of ${stats?.total_nodes || 0} nodes`}
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Alerts</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-status-warning" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">
                            {loading ? '...' : stats?.active_alerts || 0}
                        </div>
                        <p className="text-xs text-themed-muted flex items-center mt-1">
                            {loading ? '...' : `${stats?.high_risk_count || 0} critical`}
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Threat Score</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-info/10 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-status-info" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">Low</div>
                        <p className="text-xs text-status-success flex items-center mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            -5% risk level
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                    <CardHeader>
                        <CardTitle className="text-themed-primary">Attack Volume</CardTitle>
                        <CardDescription>Daily attack attempts over the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                                    <XAxis dataKey="name" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FAFAFA' }}
                                        itemStyle={{ color: '#FAFAFA' }}
                                    />
                                    <Area type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAttacks)" />
                                    <Area type="monotone" dataKey="blocked" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                    <CardHeader>
                        <CardTitle className="text-themed-primary">Decoy Activity</CardTitle>
                        <CardDescription>Activity by hour</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                                    <XAxis dataKey="time" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#27272A' }}
                                        contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FAFAFA' }}
                                    />
                                    <Bar dataKey="value" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                <CardHeader>
                    <CardTitle className="text-themed-primary">Recent Alerts</CardTitle>
                    <CardDescription>Latest security events detected across your network</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-themed-muted">Loading alerts...</div>
                    ) : alerts.length === 0 ? (
                        <div className="text-themed-muted text-sm">No alerts yet - system is secure</div>
                    ) : (
                        <div className="overflow-x-auto pb-2">
                            <Table className="min-w-[600px]">
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-themed-muted">Status</TableHead>
                                        <TableHead className="text-themed-muted">Attack Type</TableHead>
                                        <TableHead className="text-themed-muted">Severity</TableHead>
                                        <TableHead className="text-themed-muted text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alerts.map((alert) => (
                                        <TableRow
                                            key={alert.id}
                                            className="cursor-pointer hover:bg-white/5 transition-colors border-white/10"
                                            onClick={() => setSelectedAlert(alert)}
                                        >
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        alert.status === 'resolved' ? 'border-status-success text-status-success' :
                                                            alert.status === 'acknowledged' ? 'border-status-warning text-status-warning' :
                                                                'border-status-danger text-status-danger'
                                                    }
                                                >
                                                    {alert.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-themed-primary capitalize">
                                                {(alert.alert_type ?? 'Unknown').replace('_', ' ')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        alert.severity === 'critical' ? 'bg-status-danger/20 text-status-danger hover:bg-status-danger/30' :
                                                            (alert.severity === 'high' || alert.severity === 'medium') ? 'bg-status-warning/20 text-status-warning hover:bg-status-warning/30' :
                                                                'bg-status-info/20 text-status-info hover:bg-status-info/30'
                                                    }
                                                >
                                                    Severity: {alert.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-themed-muted whitespace-nowrap">
                                                {new Date(alert.created_at).toLocaleTimeString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Custom Floating Toast Warning for New Alerts */}
            <AnimatePresence>
                {newAlertToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-xl border border-status-danger bg-gradient-to-r from-gray-900 to-black p-4 shadow-2xl shadow-status-danger/20 cursor-pointer"
                        onClick={() => {
                            setSelectedAlert(newAlertToast)
                            setNewAlertToast(null)
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-status-danger/20 p-2 text-status-danger flex-shrink-0 animate-pulse">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-white mb-1">Critical Threat Detected</h4>
                                <p className="text-sm text-gray-400 leading-tight">
                                    {newAlertToast.alert_type.replace('_', ' ')} - {newAlertToast.message}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setNewAlertToast(null)
                                }}
                                className="text-gray-500 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detailed Threat Modal */}
            <ThreatModal
                isOpen={!!selectedAlert}
                onClose={() => setSelectedAlert(null)}
                alert={selectedAlert ? {
                    _id: selectedAlert.id,
                    alert_id: selectedAlert.id,
                    timestamp: selectedAlert.created_at,
                    source_ip: "Unknown",
                    service: "Unknown",
                    attack_type: selectedAlert.alert_type,
                    risk_score: selectedAlert.risk_score ?? (selectedAlert.severity === 'critical' ? 9 : selectedAlert.severity === 'high' ? 7 : selectedAlert.severity === 'medium' ? 5 : 2),
                    confidence: 0.9,
                    activity: selectedAlert.message,
                    payload: "",
                    status: selectedAlert.status,
                    node_id: selectedAlert.node_id
                } : null}
            />
        </div>
    )
}
