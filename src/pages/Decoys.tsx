import { Ghost, Plus, Play, Square, Settings2, Trash2 } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Decoys</h1>
                    <p className="text-gray-400">Deploy and manage deception assets across your network.</p>
                </div>
                <Button className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Decoy
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Decoys</CardTitle>
                        <Ghost className="h-4 w-4 text-gold-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">45</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
                        <Play className="h-4 w-4 text-status-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">38</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Inactive</CardTitle>
                        <Square className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-400">7</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle>Deployed Decoys</CardTitle>
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
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <Ghost className="h-4 w-4 text-gray-500" />
                                            {decoy.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-black-800/50">
                                            {decoy.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{decoy.node}</TableCell>
                                    <TableCell>
                                        <Badge variant={decoy.status === 'active' ? 'success' : 'secondary'}>
                                            {decoy.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{decoy.triggers}</TableCell>
                                    <TableCell>{decoy.lastTrigger}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="Configure">
                                                <Settings2 className="h-4 w-4 text-gray-400" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Delete">
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
