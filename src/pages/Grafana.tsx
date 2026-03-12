import { useState, useEffect, useMemo } from "react"
import { BarChart3, RefreshCw, ShieldCheck, Server, AlertCircle, Swords } from "lucide-react"
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { Badge } from "../components/common/Badge"
import { Button } from "../components/common/Button"
import { cn } from "../utils/cn"
import { useTheme } from "../context/ThemeContext"
import { analyticsApi, buildChartData, type AnalyticsData } from "../api/endpoints/analytics"

const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#8b5cf6']

const EmptyState = () => (
    <div className="flex items-center justify-center h-full text-themed-muted text-sm opacity-40">
        No data yet
    </div>
)

// ─── Health Score Ring (mirrored from AIInsights.tsx) ─────────────────────────

function HealthScoreRing({ score }: { score: number | null }) {
    const r = 52
    const size = 136
    const cx = size / 2
    const cy = size / 2
    const circumference = 2 * Math.PI * r
    const safeScore = score ?? 0
    const offset = score === null ? circumference : circumference * (1 - safeScore / 10)
    const color = safeScore >= 7 ? '#22c55e' : safeScore >= 4 ? '#f59e0b' : '#ef4444'
    const label = safeScore >= 7 ? 'Healthy' : safeScore >= 4 ? 'Moderate' : score === null ? '—' : 'Critical'

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth="10" />
                    <circle
                        cx={cx} cy={cy} r={r} fill="none"
                        stroke={score === null ? '#374151' : color}
                        strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-heading leading-none" style={{ color: score === null ? '#52525B' : color }}>
                        {score === null ? '—' : safeScore.toFixed(1)}
                    </span>
                    {score !== null && <span className="text-xs text-themed-muted mt-0.5">/ 10</span>}
                </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: score === null ? '#52525B' : color }}>{label}</span>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Grafana() {
    const { theme } = useTheme()
    const isLight = theme === 'light'

    const CC = isLight
        ? "rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300"
        : "rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300"

    const TT = {
        contentStyle: {
            backgroundColor: isLight ? '#FFFFFF' : '#18181B',
            borderColor: isLight ? '#E4E4E7' : '#27272A',
            borderRadius: '12px',
            color: isLight ? '#09090B' : '#FAFAFA',
        },
        itemStyle: { color: isLight ? '#09090B' : '#FAFAFA' },
    }

    const gridStroke = isLight ? '#E4E4E7' : '#27272A'
    const axisStroke = '#71717A'
    const cursorFill = isLight ? '#F4F4F5' : '#27272A'

    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchData = async () => {
        try {
            setData(await analyticsApi.fetchAll())
            setLastUpdated(new Date())
        } catch (e) {
            console.error('Analytics fetch failed', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const t = setInterval(fetchData, 30_000)
        return () => clearInterval(t)
    }, [])

    const charts = useMemo(() => data ? buildChartData(data) : null, [data])
    const { stats, report, nodes = [] } = data ?? {}

    if (loading) return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-center h-64 text-themed-muted text-sm animate-pulse">
                Loading analytics…
            </div>
        </div>
    )

    const criticalCount = report?.critical_alerts ?? stats?.high_risk_count ?? 0
    const recsCount = report?.recommendations?.length ?? 0

    return (
        <div className="space-y-6">
            <Breadcrumb />

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-status-warning" />
                        Grafana Metrics
                    </h1>
                    <p className="text-themed-muted text-sm mt-1">
                        Your security at a glance — updated every 30 seconds.
                        {lastUpdated && (
                            <span className="ml-2 opacity-50">Last refresh: {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </p>
                </div>
                <Button variant="outline" className="border-themed rounded-xl hover:bg-themed-elevated" onClick={fetchData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* ── Row 1: Security Snapshot ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                {/* Health Score Ring */}
                <Card className={CC}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4" /> Security Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pt-2 pb-4">
                        <HealthScoreRing score={report?.health_score ?? null} />
                        <p className="text-xs text-themed-muted mt-3 text-center">
                            {report
                                ? recsCount > 0
                                    ? `${recsCount} improvement${recsCount !== 1 ? 's' : ''} recommended`
                                    : 'All systems looking good'
                                : 'Generate a report in AI Insights'}
                        </p>
                    </CardContent>
                </Card>

                {/* 3 stat tiles */}
                {/* Threats Detected */}
                <Card className={CC}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Threats Detected</CardTitle>
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef444420' }}>
                            <Swords className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading text-red-500">{stats?.total_attacks ?? '—'}</div>
                        <p className="text-xs text-themed-muted mt-1">total detections across all nodes</p>
                        {stats && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-themed-muted mb-1">
                                    <span>Avg Risk</span>
                                    <span>{(stats.avg_risk_score ?? 0).toFixed(1)} / 10</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#ef444420' }}>
                                    <div
                                        className="h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${((stats.avg_risk_score ?? 0) / 10) * 100}%`,
                                            backgroundColor: '#ef4444',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Machines Online */}
                <Card className={CC}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Machines Online</CardTitle>
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e20' }}>
                            <Server className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading text-green-500">
                            {stats ? `${stats.active_nodes} / ${stats.total_nodes}` : '—'}
                        </div>
                        <p className="text-xs text-themed-muted mt-1">monitored endpoints active</p>
                        {stats && (
                            <div className="mt-3">
                                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#22c55e20' }}>
                                    <div
                                        className="h-1.5 rounded-full bg-green-500 transition-all"
                                        style={{
                                            width: `${stats.total_nodes ? (stats.active_nodes / stats.total_nodes) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-themed-muted mt-1">
                                    {stats.total_nodes ? Math.round((stats.active_nodes / stats.total_nodes) * 100) : 0}% coverage
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Open Incidents */}
                {(() => {
                    const incColor = criticalCount > 0 ? '#ef4444' : '#f59e0b'
                    return (
                        <Card className={CC}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-themed-muted">Open Incidents</CardTitle>
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: incColor + '20' }}>
                                    <AlertCircle className="h-4 w-4" style={{ color: incColor }} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-heading" style={{ color: incColor }}>{stats?.active_alerts ?? '—'}</div>
                                <p className="text-xs text-themed-muted mt-1">
                                    {criticalCount > 0 ? 'unresolved security incidents' : 'no critical alerts right now'}
                                </p>
                                {stats && (
                                    <div className="mt-3 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="h-2 w-2 rounded-full bg-red-500 inline-block flex-shrink-0" />
                                            <span className="text-themed-muted">{criticalCount} critical</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block flex-shrink-0" />
                                            <span className="text-themed-muted">{Math.max(0, (stats.active_alerts ?? 0) - criticalCount)} other</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })()}
            </div>

            {/* ── Row 2: Attack Activity (full width, 2-series area chart) ── */}
            <Card className={CC}>
                <CardHeader>
                    <CardTitle className="text-themed-primary">Attack Activity — Last 14 Days</CardTitle>
                    <CardDescription>
                        Red shows all detected threats. Amber shows high-risk events that triggered alerts (score ≥ 7).
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        {charts?.attackActivityChart.some(d => d.total > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.attackActivityChart}>
                                    <defs>
                                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                    <XAxis dataKey="date" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                    <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip {...TT} />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                    <Area type="monotone" dataKey="total" name="All Detections" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#gradTotal)" />
                                    <Area type="monotone" dataKey="highRisk" name="High-Risk Events" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#gradHigh)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <ShieldCheck className="h-12 w-12 text-status-success mx-auto mb-3 opacity-50" />
                                    <p className="text-themed-muted text-sm">No threats detected in the last 14 days</p>
                                    <p className="text-themed-muted text-xs mt-1 opacity-60">Your system is clean</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── Row 3: Attack Types + Alert Status ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* What's Attacking You — donut pie */}
                <Card className={CC}>
                    <CardHeader>
                        <CardTitle className="text-themed-primary">What's Attacking You?</CardTitle>
                        <CardDescription>Breakdown of detected attack techniques across all nodes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            {charts?.attackTypeChart.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.attackTypeChart}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%" cy="50%"
                                            outerRadius={100}
                                            innerRadius={50}
                                            paddingAngle={3}
                                            label={({ name, percent }) =>
                                                `${name.length > 14 ? name.slice(0, 14) + '…' : name} ${(percent * 100).toFixed(0)}%`
                                            }
                                            labelLine={false}
                                            fontSize={11}
                                        >
                                            {charts.attackTypeChart.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip {...TT} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </div>
                    </CardContent>
                </Card>

                {/* Incident Response Status — vertical bar */}
                <Card className={CC}>
                    <CardHeader>
                        <CardTitle className="text-themed-primary">Incident Response Status</CardTitle>
                        <CardDescription>Are security incidents being handled? Green bars mean resolved.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts?.alertResolutionChart ?? []} barSize={52}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                    <XAxis dataKey="name" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        {...TT}
                                        cursor={{ fill: cursorFill }}
                                        formatter={(value) => [`${value} alert${Number(value) !== 1 ? 's' : ''}`, 'Count']}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {(charts?.alertResolutionChart ?? []).map((e, i) => (
                                            <Cell key={i} fill={e.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Row 4: Protected Machines + Most Triggered Bait Files ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Protected Machines — node health cards */}
                <Card className={CC}>
                    <CardHeader>
                        <CardTitle className="text-themed-primary">Protected Machines</CardTitle>
                        <CardDescription>Online status of all monitored endpoints with deployed bait files</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nodes.length ? (
                            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                                {nodes.map(n => {
                                    const online = ['online', 'active'].includes(n.status)
                                    const statusLabel = online ? 'Secure' : 'Needs Attention'
                                    const decoyCount = n.decoys ?? 0
                                    return (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                                                online
                                                    ? "bg-green-500/5 border-green-500/20"
                                                    : "bg-red-500/5 border-red-500/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className={cn(
                                                    "h-3 w-3 flex-shrink-0 rounded-full",
                                                    online ? "bg-green-500 shadow-[0_0_6px_#22c55e]" : "bg-red-500 shadow-[0_0_6px_#ef4444]"
                                                )} />
                                                <div className="min-w-0">
                                                    <p className="text-sm text-themed-primary font-medium truncate">{n.name}</p>
                                                    <p className="text-xs text-themed-muted opacity-70">
                                                        {(n.os ?? 'Unknown OS').toUpperCase()} · {decoyCount} bait file{decoyCount !== 1 ? 's' : ''} deployed
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "text-xs flex-shrink-0 ml-2",
                                                online ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                            )}>
                                                {statusLabel}
                                            </Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[280px] text-themed-muted text-sm opacity-50">
                                <Server className="h-10 w-10 mb-2" />
                                <p>No machines registered yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Most Triggered Bait Files — horizontal bar */}
                <Card className={CC}>
                    <CardHeader>
                        <CardTitle className="text-themed-primary">Most Triggered Bait Files</CardTitle>
                        <CardDescription>Honeytokens that attracted the most attacker activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            {charts?.honeytokenLeaderboard.some(h => h.triggers > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.honeytokenLeaderboard} layout="vertical" barSize={18}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                                        <XAxis type="number" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke={axisStroke}
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            width={130}
                                        />
                                        <Tooltip
                                            {...TT}
                                            cursor={{ fill: cursorFill }}
                                            formatter={(value) => [`${value} trigger${Number(value) !== 1 ? 's' : ''}`, 'Accessed']}
                                        />
                                        <Bar dataKey="triggers" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-themed-muted text-sm opacity-50">
                                    <ShieldCheck className="h-10 w-10 mb-2" />
                                    <p>No bait files triggered yet</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
