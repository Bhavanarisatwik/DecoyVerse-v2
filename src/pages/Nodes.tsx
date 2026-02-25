import { useState, useEffect } from "react"
import { Server, Activity, Clock, Download, Trash2, Plus } from "lucide-react"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Nodes</h1>
                    <p className="text-themed-muted">Manage your deployed agents and devices.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
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
                        <div className="overflow-x-auto pb-2">
                            <Table className="min-w-[800px]">
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
                        </div>
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
                            This will signal the agent to uninstall itself and delete all deployed
                            decoys and honeytokens from the machine. The node record is removed once
                            the agent confirms completion.
                        </p>
                    </div>

                    {/* Manual uninstall accordion — for offline/crashed agents */}
                    <details className="group rounded-lg border border-gray-700 bg-gray-900/60 overflow-hidden">
                        <summary className="flex items-center gap-2 cursor-pointer select-none px-4 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors list-none">
                            <span className="text-gray-600 group-open:rotate-90 transition-transform duration-200 inline-block">▶</span>
                            Agent offline or unreachable? Show manual uninstall commands
                        </summary>
                        <div className="px-4 pb-4 space-y-4 border-t border-gray-700 pt-3">
                            <p className="text-xs text-gray-500">
                                Run these commands on the target machine, then click "Delete Node" to remove the record from the dashboard.
                            </p>

                            {/* Windows */}
                            <div>
                                <p className="text-xs font-medium text-gray-400 mb-2">Windows — PowerShell (Run as Administrator)</p>
                                <div className="relative group/code">
                                    <pre className="bg-black/70 border border-gray-800 rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre leading-5 font-mono">
{`# 1. Stop and remove the scheduled task
schtasks /Delete /TN DecoyVerseAgent /F
schtasks /Delete /TN DecoyVerseFirewall /F

# 2. Remove all deployed honeytokens (reads the manifest)
$manifest = "$env:USERPROFILE\\AppData\\Local\\.cache\\.honeytoken_manifest.json"
if (Test-Path $manifest) {
    $data = Get-Content $manifest | ConvertFrom-Json
    ($data.decoys + $data.honeytokens) | ForEach-Object {
        if (Test-Path $_.path) { Remove-Item -LiteralPath $_.path -Force }
    }
    Remove-Item $manifest -Force
}

# 3. Remove the agent installation folder
$agentDir = "$env:USERPROFILE\\AppData\\Local\\DecoyVerse"
if (Test-Path $agentDir) { Remove-Item $agentDir -Recurse -Force }`}
                                    </pre>
                                </div>
                            </div>

                            {/* Linux / macOS */}
                            <div>
                                <p className="text-xs font-medium text-gray-400 mb-2">Linux / macOS — Terminal</p>
                                <pre className="bg-black/70 border border-gray-800 rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre leading-5 font-mono">
{`# 1. Stop the agent service (if installed as systemd)
sudo systemctl stop decoyverse-agent 2>/dev/null
sudo systemctl disable decoyverse-agent 2>/dev/null

# 2. Remove deployed honeytokens (reads the manifest)
MANIFEST="$HOME/.cache/.honeytoken_manifest.json"
if [ -f "$MANIFEST" ]; then
  python3 -c "
import json, os
with open('$MANIFEST') as f: m = json.load(f)
for item in m.get('decoys', []) + m.get('honeytokens', []):
    p = item.get('path','')
    if p and os.path.exists(p): os.remove(p)
"
  rm -f "$MANIFEST"
fi

# 3. Remove the agent installation folder
rm -rf ~/.decoyverse`}
                                </pre>
                            </div>
                        </div>
                    </details>

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
