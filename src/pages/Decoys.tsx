import { useState, useEffect } from "react"
import { Ghost, Plus, Play, Square, Settings2, Trash2, AlertCircle } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { decoysApi, type Decoy } from "../api/endpoints/decoys"
import { nodesApi, type Node } from "../api/endpoints/nodes"

const formatTime = (dateString?: string) => {
    if (!dateString) return 'Never';
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

export default function Decoys() {
    const [decoys, setDecoys] = useState<Decoy[]>([])
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
        const fetchDecoys = async () => {
            try {
                setLoading(true)
                const response = selectedNodeId === 'all'
                    ? await decoysApi.getDecoys()
                    : await decoysApi.getNodeDecoys(selectedNodeId)
                setDecoys(response.data)
            } catch (err) {
                console.error('Error fetching decoys:', err)
                setError('Failed to load decoys')
            } finally {
                setLoading(false)
            }
        }

        fetchDecoys()
    }, [selectedNodeId])

    const handleToggleStatus = async (decoyId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await decoysApi.updateDecoyStatus(decoyId, newStatus)
            setDecoys(decoys.map(d => d.id === decoyId ? { ...d, status: newStatus as any } : d))
        } catch (err) {
            console.error('Error updating decoy:', err)
            setError('Failed to update decoy')
        }
    }

    const handleDeleteDecoy = async (decoyId: string) => {
        if (!window.confirm('Are you sure you want to delete this decoy?')) {
            return
        }
        try {
            setDecoys(decoys.filter(d => d.id !== decoyId))
        } catch (err) {
            console.error('Error deleting decoy:', err)
            setError('Failed to delete decoy')
        }
    }

    const activeCount = decoys.filter(d => d.status === 'active').length
    const inactiveCount = decoys.filter(d => d.status === 'inactive').length

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
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Decoys</h1>
                    <p className="text-themed-muted">Deploy and manage deception assets across your network.</p>
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
                        Create New Decoy
                    </Button>
                </div>
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
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : decoys.length}</div>
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
                        <div className="text-2xl font-bold text-themed-primary">{loading ? '...' : activeCount}</div>
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
                        <div className="text-2xl font-bold text-themed-muted">{loading ? '...' : inactiveCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                <CardHeader>
                    <CardTitle className="text-themed-primary">Deployed Decoys</CardTitle>
                    <CardDescription>List of all active and inactive decoys.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-themed-muted">Loading decoys...</div>
                    ) : decoys.length === 0 ? (
                        <div className="text-center py-8 text-themed-muted">No decoys deployed yet.</div>
                    ) : (
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
                                        <TableCell className="text-themed-secondary">{decoy.node_id}</TableCell>
                                        <TableCell>
                                            <Badge variant={decoy.status === 'active' ? 'success' : 'secondary'}>
                                                {decoy.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-themed-secondary">{decoy.triggers}</TableCell>
                                        <TableCell className="text-themed-muted">{formatTime(decoy.last_triggered)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    title="Toggle status"
                                                    onClick={() => handleToggleStatus(decoy.id, decoy.status)}
                                                    className="rounded-lg hover:bg-themed-elevated"
                                                >
                                                    {decoy.status === 'active' ? <Play className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    title="Delete"
                                                    onClick={() => handleDeleteDecoy(decoy.id)}
                                                    className="rounded-lg hover:bg-status-danger/10"
                                                >
                                                    <Trash2 className="h-4 w-4 text-status-danger" />
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
