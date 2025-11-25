import { Server, MoreVertical, Activity, Clock } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"

const nodes = [
    { id: "NODE-001", name: "Production-DB-01", status: "online", ip: "10.0.0.15", os: "Ubuntu 22.04", version: "v2.1.0", decoys: 5, lastSeen: "Just now" },
    { id: "NODE-002", name: "Web-Server-Main", status: "online", ip: "10.0.0.23", os: "Debian 11", version: "v2.1.0", decoys: 3, lastSeen: "1 min ago" },
    { id: "NODE-003", name: "Dev-Environment", status: "offline", ip: "10.0.0.45", os: "Windows Server 2019", version: "v2.0.5", decoys: 0, lastSeen: "2 hours ago" },
    { id: "NODE-004", name: "Backup-Server", status: "online", ip: "10.0.0.88", os: "CentOS 8", version: "v2.1.0", decoys: 2, lastSeen: "Just now" },
    { id: "NODE-005", name: "Internal-Tooling", status: "online", ip: "10.0.0.92", os: "Ubuntu 20.04", version: "v2.1.0", decoys: 4, lastSeen: "3 mins ago" },
]

export default function Nodes() {
    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Nodes</h1>
                    <p className="text-themed-muted">Manage your deployed agents and devices.</p>
                </div>
                <Button className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
                    <Server className="mr-2 h-4 w-4" />
                    Add New Node
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Total Nodes</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Server className="h-4 w-4 text-accent" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">12</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Online</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-success/10 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-status-success" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">11</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Offline</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-themed-elevated flex items-center justify-center">
                            <Clock className="h-4 w-4 text-themed-muted" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-muted">1</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                <CardHeader>
                    <CardTitle className="text-themed-primary">All Nodes</CardTitle>
                    <CardDescription>List of all devices running the DecoyVerse agent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Node Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>OS</TableHead>
                                <TableHead>Version</TableHead>
                                <TableHead>Decoys</TableHead>
                                <TableHead>Last Seen</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {nodes.map((node) => (
                                <TableRow key={node.id}>
                                    <TableCell className="font-medium text-themed-primary">
                                        <div className="flex items-center gap-2">
                                            <Server className="h-4 w-4 text-themed-muted" />
                                            {node.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={node.status === 'online' ? 'success' : 'secondary'}>
                                            {node.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-themed-secondary">{node.ip}</TableCell>
                                    <TableCell className="text-themed-secondary">{node.os}</TableCell>
                                    <TableCell className="text-themed-secondary">{node.version}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-themed-elevated">
                                            {node.decoys} Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-themed-muted">{node.lastSeen}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-themed-elevated">
                                            <MoreVertical className="h-4 w-4" />
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
