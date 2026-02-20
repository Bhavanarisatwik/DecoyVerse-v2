import { useState, useEffect } from "react"
import { Server, Activity, Clock, Download, Trash2, Plus, Monitor } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { Modal } from "../components/common/Modal"
import { Input } from "../components/common/Input"
import { Select } from "../components/common/Select"
import { nodesApi, type Node } from "../api/endpoints/nodes"
import { installApi } from "../api/endpoints/install"

export default function Nodes() {
    const [nodes, setNodes] = useState<Node[]>([])
    const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newNodeName, setNewNodeName] = useState("")
    const [creatingNode, setCreatingNode] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ nodeId: string; nodeName: string } | null>(null)
    const [osType, setOsType] = useState<'windows' | 'linux' | 'macos'>('windows')
    const [initialDecoys, setInitialDecoys] = useState(3)
    const [initialHoneytokens, setInitialHoneytokens] = useState(5)

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
                const online = nodesResponse.data.filter(n => n.status === 'online' || n.status === 'active').length
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
            await nodesApi.createNode(newNodeName, {
                os: osType,
                initialDecoys: initialDecoys,
                initialHoneytokens: initialHoneytokens
            })

            // Refresh nodes list
            const nodesResponse = await nodesApi.listNodes()
            setNodes(nodesResponse.data)

            // Update stats
            const online = nodesResponse.data.filter(n => n.status === 'online' || n.status === 'active').length
            const total = nodesResponse.data.length
            setStats({ total, online, offline: total - online })

            setShowCreateModal(false)
            setNewNodeName("")
            setOsType('windows')
            setInitialDecoys(3)
            setInitialHoneytokens(5)
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
            await installApi.downloadInstaller(nodeId, nodeName)
        } catch (err) {
            console.error('Error downloading agent installer:', err)
            setError('Failed to download agent installer')
        }
    }

    const handleDownloadExe = async (node: Node) => {
        try {
            await installApi.downloadWindowsInstaller(
                node.node_id || node.id || '',
                node.name,
                node.node_api_key || '',
                node.deployment_config?.initial_decoys,
                node.deployment_config?.initial_honeytokens
            )
        } catch (err) {
            console.error('Error downloading Windows installer:', err)
            setError('Failed to download Windows installer')
        }
    }

    const handleDeleteNode = (nodeId: string, nodeName: string) => {
        setDeleteConfirm({ nodeId, nodeName })
    }

    const confirmDelete = async () => {
        if (!deleteConfirm) return

        const { nodeId } = deleteConfirm
        setDeleteConfirm(null)

        // Optimistic UI update first to prevent INP violation
        setNodes(prev => prev.filter(n => n.id !== nodeId && n.node_id !== nodeId))
        setStats(s => ({ ...s, total: Math.max(0, s.total - 1) }))
        setNotice('Uninstall requested. The agent will remove itself and the node will disappear once complete.')

        // Defer async work to next task
        setTimeout(async () => {
            try {
                await nodesApi.deleteNode(nodeId)
            } catch (err) {
                console.error('Error deleting node:', err)
                setError('Failed to delete node')
                setNotice(null)
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

            {notice && (
                <Card className="bg-status-info/10 border-status-info/50">
                    <CardContent className="pt-6">
                        <p className="text-status-info">{notice}</p>
                    </CardContent>
                </Card>
            )}

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
                                                    title="Download ZIP installer"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="rounded-lg hover:bg-themed-elevated"
                                                    onClick={() => handleDownloadExe(node)}
                                                    title="Download Windows installer"
                                                >
                                                    <Monitor className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="rounded-lg hover:bg-status-danger/10 hover:text-status-danger"
                                                    onClick={() => handleDeleteNode(node.id || '', node.name)}
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
                    <div>
                        <label className="block text-sm font-medium text-themed-muted mb-2">Node Name</label>
                        <Input
                            placeholder="Production-DB-01, HR-Workstation, etc."
                            value={newNodeName}
                            onChange={(e) => setNewNodeName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-themed-muted mb-2">Operating System</label>
                        <Select
                            value={osType}
                            onChange={(val) => setOsType(val as 'windows' | 'linux' | 'macos')}
                            options={[
                                { value: "windows", label: "Windows" },
                                { value: "linux", label: "Linux" },
                                { value: "macos", label: "macOS" }
                            ]}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-themed-muted mb-2">Decoy Files</label>
                            <Input
                                type="number"
                                min="1"
                                max="20"
                                value={initialDecoys}
                                onChange={(e) => setInitialDecoys(parseInt(e.target.value) || 3)}
                            />
                            <p className="text-xs text-themed-muted mt-1">Fake files to deploy</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-themed-muted mb-2">Honeytokens</label>
                            <Input
                                type="number"
                                min="1"
                                max="50"
                                value={initialHoneytokens}
                                onChange={(e) => setInitialHoneytokens(parseInt(e.target.value) || 5)}
                            />
                            <p className="text-xs text-themed-muted mt-1">Trackable credentials</p>
                        </div>
                    </div>

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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Node"
                description="Are you sure you want to delete this node?"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg">
                        <p className="text-sm text-status-danger font-medium">Node: {deleteConfirm?.nodeName}</p>
                        <p className="text-sm text-gray-400 mt-2">
                            This will request the agent to uninstall itself and remove it from the system.
                            The node will disappear once the agent completes the uninstall process.
                        </p>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                        >
                            Delete Node
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
