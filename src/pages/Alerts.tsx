import { AlertTriangle, ShieldAlert, CheckCircle2, Filter, Bell } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"

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
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Alerts</h1>
                    <p className="text-themed-muted">Manage and investigate security incidents.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-themed rounded-xl hover:bg-themed-elevated">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter Alerts
                    </Button>
                    <Button className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
                        <Bell className="mr-2 h-4 w-4" />
                        Configure Rules
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Open Incidents</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-danger/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-status-danger" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">3</div>
                        <p className="text-xs text-status-danger mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Investigating</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
                            <ShieldAlert className="h-4 w-4 text-status-warning" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">1</div>
                        <p className="text-xs text-status-warning mt-1">In progress</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Resolved Today</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-success/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-status-success" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">12</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <Card key={alert.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-status-danger' :
                                        alert.severity === 'high' ? 'bg-status-warning' :
                                            alert.severity === 'medium' ? 'bg-status-warning' : 'bg-status-info'
                                        }`} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-themed-primary">{alert.title}</h3>
                                            <Badge variant={
                                                alert.status === 'open' ? 'destructive' :
                                                    alert.status === 'investigating' ? 'warning' : 'success'
                                            } className="text-[10px] px-1.5 py-0 h-5">
                                                {alert.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-themed-muted mb-2">{alert.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-themed-dimmed">
                                            <span>ID: {alert.id}</span>
                                            <span>•</span>
                                            <span>{alert.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {alert.status !== 'resolved' && (
                                        <Button size="sm" variant="outline" className="border-themed rounded-lg hover:bg-themed-elevated">
                                            Investigate
                                        </Button>
                                    )}
                                    {alert.status === 'open' && (
                                        <Button size="sm" variant="ghost" className="text-themed-muted hover:text-themed-primary rounded-lg">
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
