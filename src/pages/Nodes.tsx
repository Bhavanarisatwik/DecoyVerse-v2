import { useState, useEffect } from "react"
import { Server, MoreVertical, Activity, Clock, Download, Trash2, Plus } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { Modal } from "../components/common/Modal"
import { Input } from "../components/common/Input"
import { nodesApi, type Node } from "../api/endpoints/nodes"

export default function Nodes() {
    const [nodes, setNodes] = useState<Node[]>([])
    const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newNodeName, setNewNodeName] = useState("")
    const [creatingNode, setCreatingNode] = useState(false)

    // Fetch nodes data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [nodesResponse] = await Promise.all([
                    nodesApi.listNodes(),
                ])
                
                setNodes(nodesResponse.data)
                
                // Calculate stats
                const online = nodesResponse.data.filter(n => n.status === 'online').length
                const total = nodesResponse.data.length
                setStats({
                    total,
                    online,
                    offline: total - online
                })
            } catch (err) {
                console.error('Error fetching nodes:', err)
                setError('Failed to load nodes')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleCreateNode = async () => {
        if (!newNodeName.trim()) {
            setError('Please enter a node name')
            return
        }

        try {
            setCreatingNode(true)
            const response = await nodesApi.createNode(newNodeName)
            
            // Refresh nodes list
            const nodesResponse = await nodesApi.listNodes()
            setNodes(nodesResponse.data)
            
            // Update stats
            const online = nodesResponse.data.filter(n => n.status === 'online').length
            const total = nodesResponse.data.length
            setStats({ total, online, offline: total - online })
            
            setShowCreateModal(false)
            setNewNodeName("")
            setError(null)
        } catch (err) {
            console.error('Error creating node:', err)
            setError('Failed to create node')
        } finally {
            setCreatingNode(false)
        }
    }

    const handleDownloadAgent = async (nodeId: string, nodeName: string) => {
        try {
            const blob = await nodesApi.downloadAgent(nodeId)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `agent_config_${nodeName}.json`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Error downloading agent:', err)
            setError('Failed to download agent')
        }
    }

    const handleDeleteNode = (nodeId: string) => {
        if (!window.confirm('Are you sure you want to delete this node?')) {
            return
        }

        // Optimistic UI update first to prevent INP violation
        setNodes(prev => prev.filter(n => n.id !== nodeId && n.node_id !== nodeId))
        setStats(s => ({ ...s, total: Math.max(0, s.total - 1) }))

        // Defer async work to next task
        setTimeout(async () => {
            try {
                await nodesApi.deleteNode(nodeId)
            } catch (err) {
                console.error('Error deleting node:', err)
                setError('Failed to delete node')
                // Revert optimistic update on failure
                const nodesResponse = await nodesApi.listNodes()
                setNodes(nodesResponse.data)
            }
        }, 0)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="text-center py-12">
                    <div className="text-themed-muted">Loading nodes...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Nodes</h1>
                    <p className="text-themed-muted">Manage your deployed agents and devices.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Node
                </Button>
            </div>

            {error && (
                <Card className="bg-status-danger/10 border-status-danger/50">
                    <CardContent className="pt-6">
                        <p className="text-status-danger">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black hover:border-white/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-themed-muted">Total Nodes</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Server className="h-4 w-4 text-accent" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-themed-primary">{stats.total}</div>
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
                        <div className="text-2xl font-bold text-themed-primary">{stats.online}</div>
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
                        <div className="text-2xl font-bold text-themed-muted">{stats.offline}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                <CardHeader>
                    <CardTitle className="text-themed-primary">All Nodes</CardTitle>
                    <CardDescription>List of all devices running the DecoyVerse agent.</CardDescription>
                </CardHeader>
                <CardContent>
                    {nodes.length === 0 ? (
                        <div className="text-center py-8 text-themed-muted">
                            No nodes yet. Create one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Node Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>OS</TableHead>
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
                                        <TableCell className="text-themed-secondary">{node.ip || 'N/A'}</TableCell>
                                        <TableCell className="text-themed-secondary">{node.os || 'N/A'}</TableCell>
                                        <TableCell className="text-themed-muted">{node.lastSeen || 'Never'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="rounded-lg hover:bg-themed-elevated"
                                                    onClick={() => handleDownloadAgent(node.id || '', node.name)}
                                                    title="Download agent config"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="rounded-lg hover:bg-status-danger/10 hover:text-status-danger"
                                                    onClick={() => handleDeleteNode(node.id || '')}
                                                    title="Delete node"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            {/* Create Node Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Node"
                description="Add a new node to monitor with DecoyVerse"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Node name (e.g., Production-DB-01)"
                        value={newNodeName}
                        onChange={(e) => setNewNodeName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
                    />
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-accent"
                            onClick={handleCreateNode}
                            disabled={creatingNode}
                        >
                            {creatingNode ? 'Creating...' : 'Create Node'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
