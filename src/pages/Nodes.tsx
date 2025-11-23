import { Server, MoreVertical, Activity, Clock } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Nodes</h1>
                    <p className="text-gray-400">Manage your deployed agents and devices.</p>
                </div>
                <Button className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">
                    <Server className="mr-2 h-4 w-4" />
                    Add New Node
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Nodes</CardTitle>
                        <Server className="h-4 w-4 text-gold-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Online</CardTitle>
                        <Activity className="h-4 w-4 text-status-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">11</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Offline</CardTitle>
                        <Clock className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-400">1</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle>All Nodes</CardTitle>
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
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <Server className="h-4 w-4 text-gray-500" />
                                            {node.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={node.status === 'online' ? 'success' : 'secondary'}>
                                            {node.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{node.ip}</TableCell>
                                    <TableCell>{node.os}</TableCell>
                                    <TableCell>{node.version}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-black-800">
                                            {node.decoys} Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{node.lastSeen}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
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
