import { FileKey, Download, Plus, MoreVertical, FileText, Database, Key } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"

const honeytokens = [
    { id: "HT-001", name: "Q3_Financial_Report.pdf", type: "File", format: "PDF", status: "active", downloads: 0, created: "2 days ago" },
    { id: "HT-002", name: "AWS_Root_Keys.csv", type: "Credentials", format: "CSV", status: "active", downloads: 3, created: "1 week ago" },
    { id: "HT-003", name: "Production_DB_Config.xml", type: "Configuration", format: "XML", status: "active", downloads: 1, created: "3 days ago" },
    { id: "HT-004", name: "Employee_Salaries_2024.xlsx", type: "File", format: "XLSX", status: "inactive", downloads: 0, created: "1 month ago" },
    { id: "HT-005", name: "VPN_Access_Codes.txt", type: "Credentials", format: "TXT", status: "active", downloads: 12, created: "5 hours ago" },
]

export default function Honeytokens() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Honeytokens</h1>
                    <p className="text-gray-400">Create and manage trackable assets to detect data theft.</p>
                </div>
                <Button className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Honeytoken
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Tokens</CardTitle>
                        <FileKey className="h-4 w-4 text-gold-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">24</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Triggered</CardTitle>
                        <Download className="h-4 w-4 text-status-danger" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">5</div>
                        <p className="text-xs text-status-danger mt-1">Alerts generated</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
                        <FileText className="h-4 w-4 text-status-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">18</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle>Generated Honeytokens</CardTitle>
                    <CardDescription>Download and plant these files in your network.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Token Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Format</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Downloads/Triggers</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {honeytokens.map((token) => (
                                <TableRow key={token.id}>
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            {token.type === 'File' && <FileText className="h-4 w-4 text-gray-500" />}
                                            {token.type === 'Credentials' && <Key className="h-4 w-4 text-status-warning" />}
                                            {token.type === 'Configuration' && <Database className="h-4 w-4 text-status-info" />}
                                            {token.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{token.type}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-black-800/50 font-mono text-xs">
                                            {token.format}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={token.status === 'active' ? 'success' : 'secondary'}>
                                            {token.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{token.downloads}</TableCell>
                                    <TableCell>{token.created}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="Download">
                                                <Download className="h-4 w-4 text-gold-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
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
