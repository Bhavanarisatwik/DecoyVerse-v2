import { useState, useEffect } from "react"
import { Server, Activity, Clock, Download, Trash2, Plus, Loader2, CheckCircle2, AlertTriangle, Copy, Check, ShieldOff, ArrowRight } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/common/Table"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { Modal } from "../components/common/Modal"
import { Input } from "../components/common/Input"
import { nodesApi, type Node } from "../api/endpoints/nodes"
import { installApi } from "../api/endpoints/install"

// ─── Manual-uninstall command blocks ────────────────────────────────────────

const WIN_CHECK = `# Check if the agent is running
# Option A — Task Manager: open Task Manager → Details tab → look for pythonw.exe
# Option B — PowerShell:
Get-ScheduledTask -TaskName "DecoyVerseAgent" -ErrorAction SilentlyContinue`

const WIN_REMOVE = `# Run as Administrator in PowerShell

# 1. Stop & remove the scheduled tasks (prevents auto-restart on reboot)
schtasks /Delete /TN DecoyVerseAgent /F 2>$null
schtasks /Delete /TN DecoyVerseFirewall /F 2>$null

# 2. Kill any running agent process
Get-Process -Name "pythonw","python" -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Remove deployed honeytokens (reads the manifest)
$manifest = "$env:USERPROFILE\\AppData\\Local\\.cache\\.honeytoken_manifest.json"
if (Test-Path $manifest) {
    $data = Get-Content $manifest | ConvertFrom-Json
    ($data.decoys + $data.honeytokens) | ForEach-Object {
        if ($_.path -and (Test-Path $_.path)) { Remove-Item -LiteralPath $_.path -Force }
    }
    Remove-Item $manifest -Force
}

# 4. Remove the agent installation folder
$agentDir = "$env:USERPROFILE\\AppData\\Local\\DecoyVerse"
if (Test-Path $agentDir) { Remove-Item $agentDir -Recurse -Force }`

const LIN_CHECK = `# Check if the agent is running
ps aux | grep agent.py`

const LIN_REMOVE = `# Stop and remove the agent

# 1. Kill the agent process
pkill -f agent.py 2>/dev/null

# 2. Remove cron / systemd service if installed
sudo systemctl stop decoyverse-agent 2>/dev/null
sudo systemctl disable decoyverse-agent 2>/dev/null
sudo rm -f /etc/systemd/system/decoyverse-agent.service

# 3. Remove deployed honeytokens (reads the manifest)
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

# 4. Remove the agent installation folder
rm -rf ~/.decoyverse`

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Node['status'] }) {
    if (status === 'online' || status === 'active') {
        return (
            <Badge variant="success" className="gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online
            </Badge>
        )
    }
    if (status === 'uninstall_requested') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uninstalling…
            </span>
        )
    }
    return <Badge variant="secondary">Offline</Badge>
}

// ─── CodeBlock with copy button ──────────────────────────────────────────────

function CodeBlock({ code, id, copiedId, onCopy }: { code: string; id: string; copiedId: string | null; onCopy: (id: string, code: string) => void }) {
    const copied = copiedId === id
    return (
        <div className="relative group/cb">
            <pre className="bg-black/70 border border-gray-800 rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre leading-5 font-mono pr-10">
                {code}
            </pre>
            <button
                onClick={() => onCopy(id, code)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800/80 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-all opacity-0 group-hover/cb:opacity-100"
                title="Copy to clipboard"
            >
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            </button>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Nodes() {
    const [nodes, setNodes] = useState<Node[]>([])
    const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Create wizard
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newNodeName, setNewNodeName] = useState("")
    const [osType, setOsType] = useState<'windows' | 'linux' | 'macos'>('windows')
    const [initialDecoys, setInitialDecoys] = useState(3)
    const [initialHoneytokens, setInitialHoneytokens] = useState(5)
    const [creatingNode, setCreatingNode] = useState(false)
    const [createdNode, setCreatedNode] = useState<{ id: string; name: string } | null>(null)
    const [downloadingAgent, setDownloadingAgent] = useState(false)

    // Delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState<{ nodeId: string; nodeName: string } | null>(null)
    const [manualGuideTab, setManualGuideTab] = useState<'windows' | 'linux'>('windows')
    const [copiedBlock, setCopiedBlock] = useState<string | null>(null)

    // ── Fetch / poll ──────────────────────────────────────────────────────────

    const fetchData = async () => {
        try {
            const res = await nodesApi.listNodes()
            setNodes(res.data)
            const online = res.data.filter(n => n.status === 'online' || n.status === 'active').length
            const total = res.data.length
            setStats({ total, online, offline: total - online })
        } catch {
            setError('Failed to load nodes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    // ── Create wizard ─────────────────────────────────────────────────────────

    const handleCreateNode = async () => {
        if (!newNodeName.trim()) { setError('Please enter a node name'); return }
        try {
            setCreatingNode(true)
            setError(null)
            const res = await nodesApi.createNode(newNodeName, {
                os: osType,
                initialDecoys,
                initialHoneytokens,
            })
            setCreatedNode({ id: res.data.node_id, name: newNodeName })
            await fetchData()
        } catch {
            setError('Failed to create node')
        } finally {
            setCreatingNode(false)
        }
    }

    const handleWizardDownload = async () => {
        if (!createdNode) return
        try {
            setDownloadingAgent(true)
            await installApi.downloadInstaller(createdNode.id, createdNode.name)
        } catch {
            setError('Failed to download agent ZIP')
        } finally {
            setDownloadingAgent(false)
        }
    }

    const handleWizardDone = () => {
        setShowCreateModal(false)
        setCreatedNode(null)
        setNewNodeName("")
        setOsType('windows')
        setInitialDecoys(3)
        setInitialHoneytokens(5)
    }

    // ── Download from table row ───────────────────────────────────────────────

    const handleDownloadAgent = async (nodeId: string, nodeName: string) => {
        try {
            await installApi.downloadInstaller(nodeId, nodeName)
        } catch {
            setError('Failed to download agent installer')
        }
    }

    // ── Delete / uninstall ────────────────────────────────────────────────────

    const handleDeleteNode = (nodeId: string, nodeName: string) => {
        setDeleteConfirm({ nodeId, nodeName })
        setManualGuideTab('windows')
    }

    /** Normal delete — signal agent to uninstall; update status locally, disappears on next poll */
    const confirmDelete = async () => {
        if (!deleteConfirm) return
        const { nodeId } = deleteConfirm
        setDeleteConfirm(null)
        // Update local status to uninstall_requested; don't remove from list yet
        setNodes(prev => prev.map(n =>
            (n.id === nodeId || n.node_id === nodeId) ? { ...n, status: 'uninstall_requested' } : n
        ))
        try {
            await nodesApi.deleteNode(nodeId)
        } catch {
            setError('Failed to send uninstall signal')
            await fetchData() // revert
        }
    }

    /** Force delete — cascade removes everything from DB immediately */
    const handleForceDelete = async (nodeId: string) => {
        try {
            await nodesApi.deleteNode(nodeId, true)
            setNodes(prev => prev.filter(n => n.id !== nodeId && n.node_id !== nodeId))
            setStats(s => ({ ...s, total: Math.max(0, s.total - 1) }))
        } catch {
            setError('Force delete failed')
        }
    }

    // ── Copy helper ───────────────────────────────────────────────────────────

    const copyCode = (id: string, code: string) => {
        navigator.clipboard.writeText(code).catch(() => {})
        setCopiedBlock(id)
        setTimeout(() => setCopiedBlock(null), 2000)
    }

    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-themed-muted" />
                    <p className="text-themed-muted mt-2">Loading nodes…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Nodes</h1>
                    <p className="text-themed-muted">Manage your deployed agents and devices.</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Node
                </Button>
            </div>

            {/* Error banner */}
            {error && (
                <Card className="bg-status-danger/10 border-status-danger/50">
                    <CardContent className="pt-6 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-status-danger shrink-0" />
                        <p className="text-status-danger text-sm">{error}</p>
                        <button className="ml-auto text-xs text-status-danger/70 hover:text-status-danger" onClick={() => setError(null)}>Dismiss</button>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
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

            {/* Nodes table */}
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
                                        <TableRow key={node.id} className={node.status === 'uninstall_requested' ? 'opacity-60' : ''}>
                                            <TableCell className="font-medium text-themed-primary">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-4 w-4 text-themed-muted" />
                                                    {node.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={node.status} />
                                            </TableCell>
                                            <TableCell className="text-themed-secondary">{node.ip || 'N/A'}</TableCell>
                                            <TableCell className="text-themed-secondary">{node.os || 'N/A'}</TableCell>
                                            <TableCell className="text-themed-muted">{node.lastSeen || 'Never'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {node.status === 'uninstall_requested' ? (
                                                        /* Force delete button — only shown for stuck uninstall */
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-xs text-status-danger/80 hover:text-status-danger hover:bg-status-danger/10 gap-1.5"
                                                            onClick={() => handleForceDelete(node.id || '')}
                                                            title="Agent unreachable? Force-delete all data immediately."
                                                        >
                                                            <ShieldOff className="h-3.5 w-3.5" />
                                                            Force Delete
                                                        </Button>
                                                    ) : (
                                                        <>
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
                                                                title="Uninstall node"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
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

            {/* ── Create Node Wizard Modal ──────────────────────────────────── */}
            <Modal
                isOpen={showCreateModal}
                onClose={createdNode ? handleWizardDone : () => setShowCreateModal(false)}
                title={createdNode ? "Node Created!" : "Create New Node"}
                description={createdNode ? "Download the agent to get started." : "Configure your new monitoring node."}
            >
                {createdNode ? (
                    /* Step 2 — Download */
                    <div className="space-y-5">
                        <div className="flex flex-col items-center gap-2 py-3">
                            <CheckCircle2 className="h-12 w-12 text-status-success" />
                            <p className="text-themed-primary font-semibold text-lg">{createdNode.name}</p>
                            <p className="text-xs text-themed-muted font-mono">{createdNode.id}</p>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-sm text-themed-secondary space-y-1">
                            <p className="font-medium text-themed-primary">Next steps:</p>
                            <ol className="list-decimal list-inside space-y-1 text-themed-muted">
                                <li>Download the agent ZIP below</li>
                                <li>Extract it on the target machine</li>
                                <li>Run <span className="font-mono text-xs bg-black/40 px-1 rounded">RUN_ME.cmd</span> as Administrator (Windows) or <span className="font-mono text-xs bg-black/40 px-1 rounded">install.sh</span> (Linux)</li>
                                <li>The node will appear Online within 60 seconds</li>
                            </ol>
                        </div>

                        <Button
                            className="w-full bg-accent hover:bg-accent-600 text-on-accent font-bold py-3 rounded-xl gap-2"
                            onClick={handleWizardDownload}
                            disabled={downloadingAgent}
                        >
                            {downloadingAgent
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating ZIP…</>
                                : <><Download className="h-4 w-4" /> Download Agent ZIP</>}
                        </Button>

                        <Button variant="ghost" className="w-full" onClick={handleWizardDone}>
                            Done — I'll download it later
                        </Button>
                    </div>
                ) : (
                    /* Step 1 — Configure */
                    <div className="space-y-5">

                        {/* Node name */}
                        <div>
                            <label className="block text-sm font-medium text-themed-muted mb-2">Node Name</label>
                            <Input
                                placeholder="Production-DB-01, HR-Workstation, etc."
                                value={newNodeName}
                                onChange={(e) => setNewNodeName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !creatingNode && handleCreateNode()}
                            />
                        </div>

                        {/* OS selector */}
                        <div>
                            <label className="block text-sm font-medium text-themed-muted mb-2">Operating System</label>
                            <div className="grid grid-cols-3 gap-2">
                                {([
                                    { value: 'windows', label: 'Windows', icon: '🪟' },
                                    { value: 'linux',   label: 'Linux',   icon: '🐧' },
                                    { value: 'macos',   label: 'macOS',   icon: '🍎' },
                                ] as const).map(os => (
                                    <button
                                        key={os.value}
                                        type="button"
                                        onClick={() => setOsType(os.value)}
                                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-medium transition-all
                                            ${osType === os.value
                                                ? 'border-accent bg-accent/10 text-themed-primary'
                                                : 'border-gray-700 bg-gray-900/60 text-themed-muted hover:border-gray-500'
                                            }`}
                                    >
                                        <span className="text-xl">{os.icon}</span>
                                        {os.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Decoys + Honeytokens */}
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

                        {error && <p className="text-xs text-status-danger">{error}</p>}

                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-accent gap-2"
                                onClick={handleCreateNode}
                                disabled={creatingNode}
                            >
                                {creatingNode
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                                    : <>Create Node <ArrowRight className="h-4 w-4" /></>}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Uninstall Node"
                description="The agent will be signalled to remove itself."
            >
                <div className="space-y-5">
                    {/* Node info */}
                    <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl">
                        <p className="text-sm text-status-danger font-semibold">
                            <Server className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                            {deleteConfirm?.nodeName}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            This signals the agent to self-uninstall and removes all deployed honeytokens and decoy files.
                            The node record is deleted from the dashboard once the agent confirms.
                        </p>
                    </div>

                    {/* Manual uninstall guide */}
                    <details className="group rounded-xl border border-gray-700 bg-gray-900/60 overflow-hidden">
                        <summary className="flex items-center gap-2 cursor-pointer select-none px-4 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors list-none">
                            <span className="text-gray-600 group-open:rotate-90 transition-transform duration-200 inline-block">▶</span>
                            Agent offline or unreachable? Manual uninstall guide
                        </summary>

                        <div className="border-t border-gray-700 px-4 pt-4 pb-5 space-y-5">

                            {/* Auto-restart warning */}
                            <div className="flex gap-2.5 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-300 leading-relaxed">
                                    <span className="font-semibold">Auto-restart is enabled.</span> The agent is configured with ONLOGON + ONSTART Task Scheduler triggers and RestartCount 999 on Windows — it will come back after every reboot. <span className="font-semibold">You must complete Step 2 before rebooting</span> to prevent it from restarting.
                                </p>
                            </div>

                            {/* OS tab switcher */}
                            <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setManualGuideTab('windows')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${manualGuideTab === 'windows' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    🪟 Windows
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setManualGuideTab('linux')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${manualGuideTab === 'linux' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    🐧 Linux / macOS
                                </button>
                            </div>

                            {/* Step 1 — Check if running */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-[10px]">1</span>
                                    Check if the agent is running
                                </p>
                                {manualGuideTab === 'windows' && (
                                    <p className="text-xs text-gray-500 pl-7">Open Task Manager → Details tab → look for <span className="font-mono bg-black/30 px-1 rounded">pythonw.exe</span>, or run:</p>
                                )}
                                <div className="pl-7">
                                    <CodeBlock
                                        code={manualGuideTab === 'windows' ? WIN_CHECK : LIN_CHECK}
                                        id={`check-${manualGuideTab}`}
                                        copiedId={copiedBlock}
                                        onCopy={copyCode}
                                    />
                                </div>
                            </div>

                            {/* Step 2 — Remove */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-[10px]">2</span>
                                    Stop and remove the agent
                                    {manualGuideTab === 'windows' && <span className="text-gray-500 font-normal">(Run as Administrator)</span>}
                                </p>
                                <div className="pl-7">
                                    <CodeBlock
                                        code={manualGuideTab === 'windows' ? WIN_REMOVE : LIN_REMOVE}
                                        id={`remove-${manualGuideTab}`}
                                        copiedId={copiedBlock}
                                        onCopy={copyCode}
                                    />
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start gap-2.5 pl-0">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-[10px] shrink-0">3</span>
                                <p className="text-xs text-gray-400">
                                    Click <span className="font-semibold text-gray-200">Delete Node</span> below to remove the record from the dashboard.
                                </p>
                            </div>
                        </div>
                    </details>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Delete Node
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
