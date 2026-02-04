import { useState, useEffect } from "react"
import { Search, Filter, Download, Shield, FileKey, AlertCircle } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Input } from "../components/common/Input"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { logsApi, type Event } from "../api/endpoints/logs"

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'critical': return 'destructive';
        case 'high': return 'warning';
        case 'medium': return 'default';
        case 'low': return 'secondary';
        default: return 'secondary';
    }
};

const safeLower = (value: unknown) =>
    typeof value === 'string' ? value.toLowerCase() : '';

const safeString = (value: unknown, fallback = 'Unknown') =>
    typeof value === 'string' && value.trim() ? value : fallback;

const formatTimestamp = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleString();
    } catch {
        return dateString;
    }
};

export default function Logs() {
    const [events, setEvents] = useState<Event[]>([])
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true)
                const response = await logsApi.getRecentEvents(100)
                setEvents(response.data)
                setFilteredEvents(response.data)
            } catch (err) {
                console.error('Error fetching events:', err)
                setError('Failed to load events')
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])

    // Handle search filtering
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredEvents(events)
        } else {
            const term = searchTerm.toLowerCase()
            const filtered = events.filter(e =>
                safeLower(e.event_type).includes(term) ||
                safeLower(e.source_ip).includes(term) ||
                safeLower(e.decoy_name).includes(term) ||
                safeLower(e.node_id).includes(term)
            )
            setFilteredEvents(filtered)
        }
    }, [searchTerm, events])

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
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Security Logs</h1>
                    <p className="text-themed-muted">Real-time monitoring of all decoy interactions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-themed rounded-xl hover:bg-themed-elevated">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-themed-primary">Event Log</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themed-muted" />
                                <Input 
                                    placeholder="Search logs..." 
                                    className="pl-9 bg-themed-elevated/50 border-themed rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="border-themed rounded-xl hover:bg-themed-elevated">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-themed-muted">Loading events...</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-8 text-themed-muted">
                            {searchTerm ? 'No events match your search.' : 'No events found.'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Event Type</TableHead>
                                    <TableHead>Node</TableHead>
                                    <TableHead>Decoy</TableHead>
                                    <TableHead>Source IP</TableHead>
                                    <TableHead>Risk Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs text-themed-muted">{formatTimestamp(log.timestamp)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getSeverityColor(safeLower(log.severity)) as any}>
                                                {safeString(log.severity, 'UNKNOWN').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-themed-primary">{safeString(log.event_type)}</TableCell>
                                        <TableCell className="text-themed-secondary">{safeString(log.node_id, 'N/A')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs text-themed-secondary">
                                                {safeString(log.decoy_name, '').includes('SSH') && <Shield className="h-3 w-3 text-accent" />}
                                                {(safeString(log.decoy_name, '').includes('File') || safeString(log.decoy_name, '').includes('txt') || safeString(log.decoy_name, '').includes('csv') || safeString(log.decoy_name, '').includes('key')) ? <FileKey className="h-3 w-3 text-status-warning" /> : null}
                                                {safeString(log.decoy_name)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-themed-muted">{safeString(log.source_ip, 'N/A')}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                (log.risk_score ?? 0) >= 80 ? 'bg-status-danger/20 text-status-danger' :
                                                (log.risk_score ?? 0) >= 60 ? 'bg-status-warning/20 text-status-warning' :
                                                'bg-status-info/20 text-status-info'
                                            }`}>
                                                {log.risk_score ?? 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-accent hover:text-accent-400 rounded-lg">
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
