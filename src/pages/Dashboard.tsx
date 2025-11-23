import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { ShieldAlert, Server, Ghost, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
    { name: 'Mon', attacks: 40, blocked: 24 },
    { name: 'Tue', attacks: 30, blocked: 13 },
    { name: 'Wed', attacks: 20, blocked: 98 },
    { name: 'Thu', attacks: 27, blocked: 39 },
    { name: 'Fri', attacks: 18, blocked: 48 },
    { name: 'Sat', attacks: 23, blocked: 38 },
    { name: 'Sun', attacks: 34, blocked: 43 },
];

const activityData = [
    { time: '00:00', value: 12 },
    { time: '04:00', value: 18 },
    { time: '08:00', value: 45 },
    { time: '12:00', value: 32 },
    { time: '16:00', value: 56 },
    { time: '20:00', value: 28 },
    { time: '23:59', value: 15 },
];

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white font-heading">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
                    </span>
                    <span className="text-sm text-gold-500 font-medium">System Operational</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Attacks</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">2,543</div>
                        <p className="text-xs text-status-danger flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +20.1% from last week
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Nodes</CardTitle>
                        <Server className="h-4 w-4 text-gold-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12</div>
                        <p className="text-xs text-gold-400 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +2 new nodes
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Decoys</CardTitle>
                        <Ghost className="h-4 w-4 text-status-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">45</div>
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Threat Score</CardTitle>
                        <Activity className="h-4 w-4 text-status-info" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">Low</div>
                        <p className="text-xs text-status-success flex items-center mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            -5% risk level
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle>Attack Volume</CardTitle>
                        <CardDescription>Daily attack attempts over the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E5B93B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#E5B93B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f1724', borderColor: '#1e293b', color: '#f8fafc' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                    />
                                    <Area type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAttacks)" />
                                    <Area type="monotone" dataKey="blocked" stroke="#E5B93B" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle>Decoy Activity</CardTitle>
                        <CardDescription>Activity by hour</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#1e293b' }}
                                        contentStyle={{ backgroundColor: '#0f1724', borderColor: '#1e293b', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="value" fill="#E5B93B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>Latest security events detected across your network</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { title: "SSH Brute Force Attempt", source: "192.168.1.45", target: "Decoy-Linux-01", time: "2 mins ago", severity: "high" },
                            { title: "Port Scan Detected", source: "10.0.0.12", target: "Decoy-Win-02", time: "15 mins ago", severity: "medium" },
                            { title: "Honeytoken Access", source: "Unknown", target: "aws_keys.txt", time: "1 hour ago", severity: "critical" },
                            { title: "RDP Connection Attempt", source: "172.16.0.5", target: "Decoy-Win-01", time: "2 hours ago", severity: "low" },
                        ].map((alert, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-black-800 border border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className={`h-2 w-2 rounded-full ${alert.severity === 'critical' ? 'bg-status-danger' :
                                        alert.severity === 'high' ? 'bg-status-warning' :
                                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-status-info'
                                        }`} />
                                    <div>
                                        <p className="font-medium text-white">{alert.title}</p>
                                        <p className="text-xs text-gray-400">Source: {alert.source} • Target: {alert.target}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">{alert.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
