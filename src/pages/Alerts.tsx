import { useState, useEffect } from "react"
import { AlertTriangle, ShieldAlert, CheckCircle2, Filter, Bell, AlertCircle } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { alertsApi, type Alert as AlertType } from "../api/endpoints/alerts"
import { nodesApi, type Node } from "../api/endpoints/nodes"

const getSeverityLabel = (severity: string) => {
    switch (severity) {
        case 'critical': return 'Critical';
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
        default: return 'Unknown';
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'critical': return 'bg-status-danger';
        case 'high': return 'bg-status-warning';
        case 'medium': return 'bg-status-warning';
        case 'low': return 'bg-status-info';
        default: return 'bg-gray-500';
    }
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

export default function Alerts() {
    const [alerts, setAlerts] = useState<AlertType[]>([])
    const [filteredAlerts, setFilteredAlerts] = useState<AlertType[]>([])
    const [nodes, setNodes] = useState<Node[]>([])
    const [selectedNodeId, setSelectedNodeId] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const response = await nodesApi.listNodes()
                setNodes(response.data)
            } catch (err) {
                console.error('Error fetching nodes:', err)
            }
        }

        fetchNodes()
    }, [])

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoading(true)
                const response = await alertsApi.getAlerts(50)
                setAlerts(response.data)
            } catch (err) {
                console.error('Error fetching alerts:', err)
                setError('Failed to load alerts')
            } finally {
                setLoading(false)
            }
        }

        fetchAlerts()
    }, [])

    useEffect(() => {
        if (selectedNodeId === 'all') {
            setFilteredAlerts(alerts)
        } else {
            setFilteredAlerts(alerts.filter(a => a.node_id === selectedNodeId))
        }
    }, [alerts, selectedNodeId])

    const openCount = filteredAlerts.filter(a => a.status === 'open').length
    const investigatingCount = filteredAlerts.filter(a => a.status === 'investigating').length
    const resolvedCount = filteredAlerts.filter(a => a.status === 'resolved').length

    const handleStatusChange = async (alertId: string, newStatus: string) => {
        try {
            await alertsApi.updateAlertStatus(alertId, newStatus)
            setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: newStatus as any } : a))
        } catch (err) {
            console.error('Error updating alert:', err)
        }
    }

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Alerts</h1>
                    <p className="text-themed-muted">Manage and investigate security incidents.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <select
                        className="h-10 flex-1 sm:flex-none rounded-xl border border-white/10 bg-themed-elevated/50 px-3 text-sm text-themed-primary"
                        value={selectedNodeId}
                        onChange={(e) => setSelectedNodeId(e.target.value)}
                    >
                        <option value="all">All Nodes</option>
                        {nodes.map((node) => (
                            <option key={node.id || node.node_id} value={node.id || node.node_id}>
                                {node.name || node.id || node.node_id}
                            </option>
                        ))}
                    </select>
                    <Button variant="outline" className="flex-1 sm:flex-none border-themed rounded-xl hover:bg-themed-elevated">
                        <Filter className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Filter Alerts</span>
                        <span className="sm:hidden">Filter</span>
                    </Button>
                    <Button className="w-full sm:w-auto bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
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
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : openCount}</div>
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
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : investigatingCount}</div>
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
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : resolvedCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardContent className="p-5">
                            <p className="text-themed-muted">Loading alerts...</p>
                        </CardContent>
                    </Card>
                ) : filteredAlerts.length === 0 ? (
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardContent className="p-5">
                            <p className="text-themed-muted">No alerts found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredAlerts.map((alert) => (
                        <Card key={alert.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${getSeverityColor(alert.severity)}`} />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-themed-primary">{alert.alert_type}</h3>
                                                <Badge variant={
                                                    alert.status === 'open' ? 'destructive' :
                                                        alert.status === 'investigating' ? 'warning' : 'success'
                                                } className="text-[10px] px-1.5 py-0 h-5">
                                                    {alert.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-themed-muted mb-2">{alert.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-themed-dimmed">
                                                <span>ID: {alert.id}</span>
                                                <span>•</span>
                                                <span>Severity: {getSeverityLabel(alert.severity)}</span>
                                                <span>•</span>
                                                <span>{formatTime(alert.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {alert.status !== 'resolved' && (
                                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(alert.id, 'investigating')} className="border-themed rounded-lg hover:bg-themed-elevated">
                                                Investigate
                                            </Button>
                                        )}
                                        {alert.status === 'open' && (
                                            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(alert.id, 'resolved')} className="text-themed-muted hover:text-themed-primary rounded-lg">
                                                Resolve
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
