import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Copy, CheckCircle2, ArrowRight, Download, Server } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/common/Card"
import { Input } from "../components/common/Input"
import { nodesApi } from "../api/endpoints/nodes"
import { authApi } from "../api/endpoints/auth"
import { useAuth } from "../context/AuthContext"

export default function Onboarding() {
    const navigate = useNavigate();
    const { updateUser, user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [nodeData, setNodeData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [agentConnected, setAgentConnected] = useState(false)
    const [completing, setCompleting] = useState(false)
    
    // Node setup form
    const [nodeName, setNodeName] = useState('')
    const [nodeOs, setNodeOs] = useState('windows')
    const [nodeCreated, setNodeCreated] = useState(false)
    const [creatingNode, setCreatingNode] = useState(false)
    
    // Initial deployment config
    const [initialDecoys, setInitialDecoys] = useState(3)
    const [initialHoneytokens, setInitialHoneytokens] = useState(2)

    // Navigate to dashboard when onboarding is complete
    useEffect(() => {
        if (completing && user?.isOnboarded === true) {
            navigate('/dashboard');
        }
    }, [completing, user?.isOnboarded, navigate]);

    useEffect(() => {
        // Check for existing nodes
        const checkExistingNodes = async () => {
            try {
                const response = await nodesApi.listNodes()
                const existingNode = response.data && response.data.length > 0 ? response.data[0] : null

                if (existingNode && existingNode.node_api_key) {
                    setNodeData(existingNode)
                    setNodeCreated(true)
                    setNodeName(existingNode.name || '')
                    if (existingNode.status === 'active' || existingNode.status === 'online') {
                        setAgentConnected(true)
                    }
                }
            } catch (err) {
                console.error('Error checking existing nodes:', err)
            } finally {
                setLoading(false)
            }
        }

        checkExistingNodes()
    }, [])

    // Create a new node with the given name and initial deployment config
    const handleCreateNode = async () => {
        if (!nodeName.trim()) {
            return
        }
        
        try {
            setCreatingNode(true)
            const createResponse = await nodesApi.createNode(nodeName.trim(), {
                os: nodeOs,
                initialDecoys,
                initialHoneytokens
            })
            const nodeInfo = createResponse.data as any
            setNodeData({
                node_id: nodeInfo.node_id || nodeInfo.id,
                node_api_key: nodeInfo.node_api_key || nodeInfo.api_key,
                name: nodeName.trim(),
                os: nodeOs,
                initialDecoys,
                initialHoneytokens
            })
            setNodeCreated(true)
        } catch (err) {
            console.error('Error creating node:', err)
        } finally {
            setCreatingNode(false)
        }
    }

    // Poll for agent connection status
    useEffect(() => {
        if (!nodeData?.node_id || agentConnected) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await nodesApi.listNodes();
                const node = response.data?.find((n: any) => 
                    n.node_id === nodeData.node_id || n.id === nodeData.node_id
                );
                if (node && (node.status === 'active' || node.status === 'online')) {
                    setAgentConnected(true);
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error('Error polling node status:', err);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [nodeData?.node_id, agentConnected]);

    const handleCopy = () => {
        if (nodeData?.node_api_key) {
            navigator.clipboard.writeText(nodeData.node_api_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadAgent = async () => {
        try {
            if (!nodeData?.node_id) {
                console.error('No node ID available');
                return;
            }
            
            const nodeId = String(nodeData.node_id).trim();
            const blob = await nodesApi.downloadAgent(nodeId)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            // Download as PowerShell installer
            const safeName = nodeName.replace(/[^a-zA-Z0-9]/g, '_') || nodeData.node_id
            a.download = `DecoyVerse-Setup-${safeName}.ps1`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Error downloading agent:', err)
            if (err instanceof Error) {
                alert('Failed to download agent: ' + err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-themed-primary py-12 px-4 flex items-center justify-center">
                <div className="text-themed-muted">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-themed-primary py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 mb-4">
                        <Server className="h-8 w-8 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Setup your first Node</h1>
                    <p className="text-themed-muted max-w-2xl mx-auto">
                        Create a node to represent your target machine, then install the agent to start deploying decoys.
                    </p>
                </div>

                {/* Step 1: Create Node */}
                <Card className="card-gradient border-themed">
                    <CardHeader>
                        <CardTitle className="text-themed-primary">1. Create your Node</CardTitle>
                        <CardDescription>Give your node a descriptive name and choose the target OS.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!nodeCreated ? (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Enter node name (e.g., Production-DB-01)" 
                                        value={nodeName}
                                        onChange={(e) => setNodeName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
                                        className="font-medium text-themed-secondary bg-themed-elevated rounded-xl" 
                                    />
                                    <select
                                        className="h-10 rounded-xl border border-white/10 bg-themed-elevated/50 px-3 text-sm text-themed-primary"
                                        value={nodeOs}
                                        onChange={(e) => setNodeOs(e.target.value)}
                                        aria-label="Select node OS"
                                    >
                                        <option value="windows">Windows</option>
                                        <option value="linux">Linux</option>
                                        <option value="macos">macOS</option>
                                    </select>
                                </div>
                                
                                <div className="p-4 bg-themed-elevated/50 rounded-xl border border-themed space-y-3">
                                    <p className="text-sm font-medium text-themed-primary">Initial Deployment Configuration</p>
                                    <p className="text-xs text-themed-muted">Choose how many decoys and honeytokens to deploy automatically when the agent starts.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-themed-muted mb-1 block">Decoys to Deploy</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={initialDecoys}
                                                    onChange={(e) => setInitialDecoys(Number(e.target.value))}
                                                    className="flex-1 h-2 bg-themed-elevated rounded-lg appearance-none cursor-pointer accent-accent"
                                                />
                                                <span className="w-8 text-center text-sm font-bold text-accent">{initialDecoys}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-themed-muted mb-1 block">Honeytokens to Deploy</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={initialHoneytokens}
                                                    onChange={(e) => setInitialHoneytokens(Number(e.target.value))}
                                                    className="flex-1 h-2 bg-themed-elevated rounded-lg appearance-none cursor-pointer accent-accent"
                                                />
                                                <span className="w-8 text-center text-sm font-bold text-accent">{initialHoneytokens}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button 
                                    onClick={handleCreateNode}
                                    disabled={!nodeName.trim() || creatingNode}
                                    className="w-full bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                                >
                                    {creatingNode ? 'Creating...' : 'Create Node'}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-status-success/10 border border-status-success/20 rounded-xl">
                                <CheckCircle2 className="h-5 w-5 text-status-success" />
                                <div className="flex-1">
                                    <p className="font-medium text-themed-primary">Node Created: {nodeData?.name || nodeName}</p>
                                    <p className="text-sm text-themed-muted">Node ID: <span className="font-mono text-accent">{nodeData?.node_id}</span></p>
                                    <p className="text-xs text-themed-dimmed">OS: {nodeOs} | Initial: {initialDecoys} decoys, {initialHoneytokens} honeytokens</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {nodeCreated && nodeData && (
                    <>
                        <Card className="card-gradient border-themed">
                            <CardHeader>
                                <CardTitle className="text-themed-primary">2. Get your API Token</CardTitle>
                                <CardDescription>This token authenticates your agent with DecoyVerse.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input value={nodeData.node_api_key || ''} readOnly className="font-mono text-themed-secondary bg-themed-elevated rounded-xl" />
                                    <Button variant="outline" onClick={handleCopy} className="shrink-0 rounded-xl border-themed hover:bg-themed-elevated">
                                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <div className="bg-status-warning/10 border border-status-warning/20 rounded-xl p-4 text-sm text-status-warning">
                                    Keep this token secret! It grants access to your DecoyVerse environment.
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-gradient border-themed">
                            <CardHeader>
                                <CardTitle className="text-themed-primary">3. Download & Run Installer</CardTitle>
                                <CardDescription>Download the PowerShell installer and run it as Administrator on your target machine.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button 
                                    onClick={handleDownloadAgent}
                                    className="w-full bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Agent Installer (.ps1)
                                </Button>
                                <div className="text-sm text-themed-muted space-y-2">
                                    <p>Selected OS: <span className="text-accent font-medium">{nodeOs}</span></p>
                                    <div className="p-3 bg-themed-elevated/50 rounded-lg border border-themed text-xs">
                                        <p className="font-medium text-themed-secondary mb-1">How to run:</p>
                                        <p>1. Right-click the downloaded .ps1 file</p>
                                        <p>2. Select "Run with PowerShell"</p>
                                        <p>3. Click "Yes" if prompted for Admin access</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-gradient border-themed">
                            <CardHeader>
                                <CardTitle className="text-themed-primary">4. Verify Connection</CardTitle>
                                <CardDescription>Once installed, the agent will automatically connect to the dashboard.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 p-4 bg-themed-elevated/50 rounded-xl border border-themed border-dashed">
                                    <div className={`h-3 w-3 rounded-full ${agentConnected ? 'bg-status-success' : 'bg-themed-muted animate-pulse'}`}></div>
                                    <span className="text-themed-muted">{agentConnected ? 'Agent connected!' : 'Waiting for agent heartbeat...'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                <div className="flex justify-end">
                    <Button
                        size="lg"
                        className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                        onClick={() => {
                            // Set loading state immediately to avoid INP violation
                            setCompleting(true);
                            
                            // Defer async work to next task
                            setTimeout(async () => {
                                try {
                                    const response = await authApi.completeOnboarding();
                                    if (response.success && response.data?.user) {
                                        updateUser(response.data.user);
                                        // The useEffect will handle navigation once user.isOnboarded is true
                                    }
                                } catch (error) {
                                    console.error('Failed to complete onboarding:', error);
                                    setCompleting(false);
                                }
                            }, 0);
                        }}
                        disabled={completing}
                    >
                        {completing ? 'Finishing Setup...' : 'Go to Dashboard'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
