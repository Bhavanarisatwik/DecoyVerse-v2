import { AlertTriangle, ShieldAlert, CheckCircle2, Filter, Bell } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card"
import { Badge } from "../components/common/Badge"

const alerts = [
    { id: "ALT-001", title: "SSH Brute Force Detected", description: "Multiple failed login attempts from IP 192.168.1.45 on node Production-DB-01.", severity: "critical", time: "2 mins ago", status: "open" },
    { id: "ALT-002", title: "Honeytoken Accessed", description: "File 'AWS_Root_Keys.csv' was opened by user 'admin' on workstation WORKSTATION-05.", severity: "high", time: "1 hour ago", status: "investigating" },
    { id: "ALT-003", title: "Port Scan Activity", description: "Port scan detected targeting range 10.0.0.0/24. Source IP: 10.0.0.12.", severity: "medium", time: "3 hours ago", status: "resolved" },
    { id: "ALT-004", title: "Unexpected Service Stop", description: "Decoy service 'Fake-SSH-Service' stopped unexpectedly on node Dev-Environment.", severity: "low", time: "5 hours ago", status: "resolved" },
    { id: "ALT-005", title: "New Device Detected", description: "Unrecognized device connected to the network segment 192.168.1.0/24.", severity: "medium", time: "1 day ago", status: "open" },
]

export default function Alerts() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Alerts</h1>
                    <p className="text-gray-400">Manage and investigate security incidents.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-700">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter Alerts
                    </Button>
                    <Button className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">
                        <Bell className="mr-2 h-4 w-4" />
                        Configure Rules
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Open Incidents</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-status-danger" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">3</div>
                        <p className="text-xs text-status-danger mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Investigating</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-status-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">1</div>
                        <p className="text-xs text-status-warning mt-1">In progress</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Resolved Today</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-status-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <Card key={alert.id} className="bg-gray-800 border-gray-700 hover:border-gold-500/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-status-danger' :
                                        alert.severity === 'high' ? 'bg-status-warning' :
                                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-status-info'
                                        }`} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white">{alert.title}</h3>
                                            <Badge variant={
                                                alert.status === 'open' ? 'destructive' :
                                                    alert.status === 'investigating' ? 'warning' : 'success'
                                            } className="text-[10px] px-1.5 py-0 h-5">
                                                {alert.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{alert.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>ID: {alert.id}</span>
                                            <span>•</span>
                                            <span>{alert.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {alert.status !== 'resolved' && (
                                        <Button size="sm" variant="outline" className="border-gray-700">
                                            Investigate
                                        </Button>
                                    )}
                                    {alert.status === 'open' && (
                                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                            Dismiss
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
