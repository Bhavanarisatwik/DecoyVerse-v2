import { Search, Filter, Download, Shield, FileKey } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Input } from "../components/common/Input"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"

const logs = [
    { id: "LOG-9382", timestamp: "2024-11-23 14:32:11", node: "Production-DB-01", event: "SSH Login Attempt", source: "192.168.1.45", severity: "high", decoy: "Fake-SSH-Service" },
    { id: "LOG-9381", timestamp: "2024-11-23 14:30:05", node: "Dev-Environment", event: "File Access", source: "10.0.0.12", severity: "medium", decoy: "Admin-Credentials.txt" },
    { id: "LOG-9380", timestamp: "2024-11-23 14:15:22", node: "Web-Server-Main", event: "Port Scan", source: "172.16.0.5", severity: "low", decoy: "Backup-Port-8080" },
    { id: "LOG-9379", timestamp: "2024-11-23 13:55:48", node: "Internal-Tooling", event: "Honeytoken Trigger", source: "Unknown", severity: "critical", decoy: "AWS-Keys.csv" },
    { id: "LOG-9378", timestamp: "2024-11-23 13:42:10", node: "Backup-Server", event: "RDP Connection", source: "192.168.1.100", severity: "medium", decoy: "RDP-Honeypot" },
    { id: "LOG-9377", timestamp: "2024-11-23 13:30:00", node: "Production-DB-01", event: "SSH Login Attempt", source: "192.168.1.45", severity: "high", decoy: "Fake-SSH-Service" },
]

export default function Logs() {
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
                                <Input placeholder="Search logs..." className="pl-9 bg-themed-elevated/50 border-themed rounded-xl" />
                            </div>
                            <Button variant="outline" className="border-themed rounded-xl hover:bg-themed-elevated">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Node</TableHead>
                                <TableHead>Decoy</TableHead>
                                <TableHead>Source IP</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs text-themed-muted">{log.timestamp}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            log.severity === 'critical' ? 'destructive' :
                                                log.severity === 'high' ? 'warning' :
                                                    log.severity === 'medium' ? 'default' : 'secondary'
                                        }>
                                            {log.severity.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-themed-primary">{log.event}</TableCell>
                                    <TableCell className="text-themed-secondary">{log.node}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs text-themed-secondary">
                                            {log.decoy.includes('SSH') && <Shield className="h-3 w-3 text-accent" />}
                                            {log.decoy.includes('File') || log.decoy.includes('txt') || log.decoy.includes('csv') ? <FileKey className="h-3 w-3 text-status-warning" /> : null}
                                            {log.decoy}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-themed-muted">{log.source}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="text-accent hover:text-accent-400 rounded-lg">
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
