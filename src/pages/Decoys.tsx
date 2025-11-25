import { Ghost, Plus, Play, Square, Settings2, Trash2 } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"

const decoys = [
    { id: "DCY-001", name: "Fake-SSH-Service", type: "Service", node: "Production-DB-01", status: "active", triggers: 24, lastTrigger: "2 mins ago" },
    { id: "DCY-002", name: "Admin-Credentials.txt", type: "File", node: "Dev-Environment", status: "active", triggers: 5, lastTrigger: "1 day ago" },
    { id: "DCY-003", name: "Backup-Port-8080", type: "Port", node: "Web-Server-Main", status: "inactive", triggers: 0, lastTrigger: "Never" },
    { id: "DCY-004", name: "RDP-Honeypot", type: "Service", node: "Backup-Server", status: "active", triggers: 12, lastTrigger: "3 hours ago" },
    { id: "DCY-005", name: "AWS-Keys.csv", type: "File", node: "Internal-Tooling", status: "active", triggers: 8, lastTrigger: "5 hours ago" },
]

export default function Decoys() {
    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Decoys</h1>
                    <p className="text-themed-muted">Deploy and manage deception assets across your network.</p>
                </div>
                <Button className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Decoy
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Total Decoys</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Ghost className="h-4 w-4 text-accent" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">45</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Active</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-success/10 flex items-center justify-center">
                            <Play className="h-4 w-4 text-status-success" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">38</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Inactive</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-themed-elevated flex items-center justify-center">
                            <Square className="h-4 w-4 text-themed-muted" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-muted">7</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                <CardHeader>
                    <CardTitle className="text-themed-primary">Deployed Decoys</CardTitle>
                    <CardDescription>List of all active and inactive decoys.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Decoy Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Target Node</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Triggers</TableHead>
                                <TableHead>Last Trigger</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {decoys.map((decoy) => (
                                <TableRow key={decoy.id}>
                                    <TableCell className="font-medium text-themed-primary">
                                        <div className="flex items-center gap-2">
                                            <Ghost className="h-4 w-4 text-themed-muted" />
                                            {decoy.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-themed-elevated/50">
                                            {decoy.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-themed-secondary">{decoy.node}</TableCell>
                                    <TableCell>
                                        <Badge variant={decoy.status === 'active' ? 'success' : 'secondary'}>
                                            {decoy.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-themed-secondary">{decoy.triggers}</TableCell>
                                    <TableCell className="text-themed-muted">{decoy.lastTrigger}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" title="Configure" className="rounded-lg hover:bg-themed-elevated">
                                                <Settings2 className="h-4 w-4 text-themed-muted" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Delete" className="rounded-lg hover:bg-status-danger/10">
                                                <Trash2 className="h-4 w-4 text-status-danger" />
                                            </Button>
                                        </div>
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
