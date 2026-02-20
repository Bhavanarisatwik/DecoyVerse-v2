import { useState, useEffect } from "react"
import { FileKey, Download, Plus, MoreVertical, FileText, Key, AlertCircle, MapPin, Zap } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { decoysApi, type Decoy } from "../api/endpoints/decoys"
import { nodesApi, type Node } from "../api/endpoints/nodes"


export default function Honeytokens() {
    const [honeytokens, setHoneytokens] = useState<Decoy[]>([])
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
        const fetchTokens = async () => {
            try {
                setLoading(true)
                const response = selectedNodeId === 'all'
                    ? await decoysApi.getDecoys()
                    : await decoysApi.getNodeDecoys(selectedNodeId)
                // Filter only honeytokens
                const tokens = response.data.filter(d => d.type === 'honeytoken')
                setHoneytokens(tokens)
            } catch (err) {
                console.error('Error fetching honeytokens:', err)
                setError('Failed to load honeytokens')
            } finally {
                setLoading(false)
            }
        }

        fetchTokens()
    }, [selectedNodeId])

    const activeCount = honeytokens.filter(t => t.status === 'active').length
    const triggeredCount = honeytokens.reduce((sum, t) => sum + t.triggers, 0)

    // Create a map of node_id to node name
    const nodeNameMap = nodes.reduce((map, node) => {
        map[node.id || node.node_id || ''] = node.name
        if (node.node_id) map[node.node_id] = node.name
        return map
    }, {} as Record<string, string>)

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
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Honeytokens</h1>
                    <p className="text-themed-muted">Create and manage trackable assets to detect data theft.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="h-10 rounded-xl border border-white/10 bg-themed-elevated/50 px-3 text-sm text-themed-primary"
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
                    <Button className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Honeytoken
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Total Tokens</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <FileKey className="h-4 w-4 text-accent" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : honeytokens.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Triggered</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-danger/10 flex items-center justify-center">
                            <Download className="h-4 w-4 text-status-danger" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : triggeredCount}</div>
                        <p className="text-xs text-status-danger mt-1">Alerts generated</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Active</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-status-success/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-status-success" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : activeCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                <CardHeader>
                    <CardTitle className="text-themed-primary">Generated Honeytokens</CardTitle>
                    <CardDescription>Download and plant these files in your network.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-themed-muted">Loading honeytokens...</div>
                    ) : honeytokens.length === 0 ? (
                        <div className="text-center py-8 text-themed-muted">No honeytokens created yet.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Token Name</TableHead>
                                    <TableHead>Deployed On</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Triggers</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {honeytokens.map((token) => (
                                    <TableRow key={token.id}>
                                        <TableCell className="font-medium text-themed-primary">
                                            <div className="flex items-center gap-2">
                                                <Key className="h-4 w-4 text-status-warning" />
                                                <div>
                                                    <span>{token.name}</span>
                                                    {token.auto_deployed && (
                                                        <div className="flex items-center gap-1 text-xs text-accent mt-0.5">
                                                            <Zap className="h-3 w-3" />
                                                            <span>Auto-deployed</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-themed-secondary">
                                            {nodeNameMap[token.node_id] || token.node_name || token.node_id}
                                        </TableCell>
                                        <TableCell>
                                            {token.file_path || token.deploy_location ? (
                                                <div className="flex items-center gap-1 text-xs text-themed-muted font-mono max-w-[200px]">
                                                    <MapPin className="h-3 w-3 shrink-0 text-status-info" />
                                                    <span className="truncate" title={token.file_path || token.deploy_location}>
                                                        {token.file_path || token.deploy_location}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-themed-dimmed">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={token.status === 'active' ? 'success' : 'secondary'}>
                                                {token.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-themed-secondary">{token.triggers}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" title="Download" className="rounded-lg hover:bg-accent/10">
                                                    <Download className="h-4 w-4 text-accent" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-themed-elevated">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
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
