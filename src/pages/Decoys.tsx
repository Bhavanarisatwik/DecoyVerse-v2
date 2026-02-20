import { useState, useEffect } from "react"
import { Ghost, Plus, Play, Square, Trash2, AlertCircle, MapPin, Zap, Copy, Check } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { Select } from "../components/common/Select"
import { Modal } from "../components/common/Modal"
import { Input } from "../components/common/Input"
import { decoysApi, type Decoy } from "../api/endpoints/decoys"
import { nodesApi, type Node } from "../api/endpoints/nodes"


export default function Decoys() {
    const [decoys, setDecoys] = useState<Decoy[]>([])
    const [nodes, setNodes] = useState<Node[]>([])
    const [selectedNodeId, setSelectedNodeId] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createCount, setCreateCount] = useState(1)
    const [createNodeId, setCreateNodeId] = useState<string>('')
    const [creating, setCreating] = useState(false)
    const [copiedPath, setCopiedPath] = useState<string | null>(null)

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
                // Filter out honeytokens - show only file/service/port decoys
                const fileDecoys = response.data.filter(d => d.type !== 'honeytoken')
                setDecoys(fileDecoys)
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
            await decoysApi.deleteDecoy?.(decoyId) || Promise.resolve(); // Assuming this or similar endpoint later
            setDecoys(decoys.filter(d => d.id !== decoyId))
        } catch (err) {
            console.error('Error deleting decoy:', err)
            setError('Failed to delete decoy')
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedPath(text);
            setTimeout(() => setCopiedPath(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const activeCount = decoys.filter(d => d.status === 'active').length
    const inactiveCount = decoys.filter(d => d.status === 'inactive').length

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
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Decoys</h1>
                    <p className="text-themed-muted">Deploy and manage deception assets across your network.</p>
                </div>
                <div className="flex items-center gap-3 w-64">
                    <Select
                        value={selectedNodeId}
                        onChange={(val) => setSelectedNodeId(val)}
                        options={[
                            { value: 'all', label: 'All Nodes' },
                            ...nodes.map(n => ({ value: n.id || n.node_id || '', label: n.name || n.id || n.node_id || '' }))
                        ]}
                    />
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl whitespace-nowrap"
                    >
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
                                    <TableHead>Deployed On</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Triggers</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {decoys.map((decoy) => (
                                    <TableRow key={decoy.id}>
                                        <TableCell className="font-medium text-themed-primary">
                                            <div className="flex items-center gap-2">
                                                <Ghost className="h-4 w-4 text-themed-muted" />
                                                <div>
                                                    <span>{decoy.name}</span>
                                                    {decoy.auto_deployed && (
                                                        <div className="flex items-center gap-1 text-xs text-accent mt-0.5">
                                                            <Zap className="h-3 w-3" />
                                                            <span>Auto-deployed</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-themed-elevated/50">
                                                {decoy.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-themed-secondary">
                                            {nodeNameMap[decoy.node_id] || decoy.node_name || decoy.node_id}
                                        </TableCell>
                                        <TableCell>
                                            {decoy.file_path || decoy.deploy_location ? (
                                                <div className="flex items-center gap-2 group">
                                                    <div className="flex items-center gap-1 text-xs text-themed-muted font-mono max-w-[200px]">
                                                        <MapPin className="h-3 w-3 shrink-0 text-status-info" />
                                                        <span className="truncate" title={decoy.file_path || decoy.deploy_location}>
                                                            {decoy.file_path || decoy.deploy_location}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(decoy.file_path || decoy.deploy_location || '')}
                                                        className="text-themed-muted hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Copy path"
                                                    >
                                                        {copiedPath === (decoy.file_path || decoy.deploy_location) ? (
                                                            <Check className="h-3 w-3 text-status-success" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-themed-dimmed">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={decoy.status === 'active' ? 'success' : 'secondary'}>
                                                {decoy.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-themed-secondary">{decoy.triggers}</TableCell>
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

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Deploy New Decoys"
                description="Select a node and specify how many decoys to create."
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-themed-muted mb-2">Target Node</label>
                        <Select
                            value={createNodeId}
                            onChange={(val) => setCreateNodeId(val)}
                            options={nodes.map(n => ({ value: n.id || n.node_id || '', label: n.name || n.id || n.node_id || '' }))}
                            placeholder="Select a node..."
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-themed-muted mb-2">Number of Decoys to Deploy</label>
                        <Input
                            type="number"
                            min="1"
                            max="50"
                            value={createCount}
                            onChange={(e) => setCreateCount(parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-themed-muted mt-1">Create between 1 and 50 decoys</p>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-accent"
                            disabled={!createNodeId || creating}
                            onClick={async () => {
                                setCreating(true)
                                try {
                                    // Call backend to deploy decoys on selected node
                                    await decoysApi.deployHoneytokens(createNodeId, createCount)
                                    // Refresh decoys list
                                    const response = selectedNodeId === 'all'
                                        ? await decoysApi.getDecoys()
                                        : await decoysApi.getNodeDecoys(selectedNodeId)
                                    const fileDecoys = response.data.filter(d => d.type !== 'honeytoken')
                                    setDecoys(fileDecoys)
                                    setShowCreateModal(false)
                                    setCreateCount(1)
                                } catch (err) {
                                    console.error('Error deploying decoys:', err)
                                    setError('Failed to deploy decoys - endpoint may not be implemented')
                                } finally {
                                    setCreating(false)
                                }
                            }}
                        >
                            {creating ? 'Deploying...' : 'Deploy'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    )
}
