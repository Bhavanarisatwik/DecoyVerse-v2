import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Copy, CheckCircle2, RefreshCw, ArrowRight, Download } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/common/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/Tabs"
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

    // Navigate to dashboard when onboarding is complete
    useEffect(() => {
        if (completing && user?.isOnboarded === true) {
            navigate('/dashboard');
        }
    }, [completing, user?.isOnboarded, navigate]);

    useEffect(() => {
        // Try to get the first node from the backend or create a new one
        const setupNode = async () => {
            try {
                const response = await nodesApi.listNodes()
                const existingNode = response.data && response.data.length > 0 ? response.data[0] : null
                const existingNodeId = existingNode?.node_id || existingNode?.id
                const existingApiKey = existingNode?.node_api_key || existingNode?.api_key

                if (existingNode && existingApiKey) {
                    setNodeData(existingNode)
                    // Check if already connected
                    if (existingNode.status === 'active' || existingNode.status === 'online') {
                        setAgentConnected(true)
                    }
                    return
                }

                // Create a new node for onboarding when token is missing
                const createResponse = await nodesApi.createNode('Onboarding-Node')
                console.log('Create node response:', createResponse);
                const nodeInfo = createResponse.data || createResponse;
                setNodeData({
                    node_id: nodeInfo.node_id || nodeInfo.id || existingNodeId,
                    node_api_key: nodeInfo.node_api_key || nodeInfo.api_key
                })
            } catch (err) {
                console.error('Error setting up node:', err)
                // Fallback to default
                setNodeData({
                    node_id: 'dcv_node_' + Math.random().toString(36).substr(2, 9),
                    node_api_key: 'dcv_live_' + Math.random().toString(36).substr(2, 20)
                })
            } finally {
                setLoading(false)
            }
        }

        setupNode()
    }, [])

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
        }, 5000); // Poll every 5 seconds

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
            console.log('Current nodeData:', nodeData);
            console.log('Node ID:', nodeData?.node_id);
            console.log('Node API Key:', nodeData?.node_api_key);
            
            if (!nodeData?.node_id) {
                console.error('No node ID available');
                alert('Please create a node first');
                return;
            }
            
            const nodeId = String(nodeData.node_id).trim();
            console.log('Attempting to download agent for node:', nodeId);
            console.log('Request URL will be: /nodes/' + nodeId + '/agent-download');
            
            const blob = await nodesApi.downloadAgent(nodeId)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `agent_config_${nodeData.node_id}.json`
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
                <div className="text-themed-muted">Loading agent configuration...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-themed-primary py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 mb-4">
                        <CheckCircle2 className="h-8 w-8 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading">Setup your first Agent</h1>
                    <p className="text-themed-muted max-w-2xl mx-auto">
                        You're almost there! Install the lightweight agent on your target machine to start deploying decoys.
                    </p>
                </div>

                {nodeData && (
                    <>
                        <Card className="card-gradient border-themed">
                            <CardHeader>
                                <CardTitle className="text-themed-primary">1. Get your API Token</CardTitle>
                                <CardDescription>This token is used to authenticate your agent with the DecoyVerse platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input value={nodeData.node_api_key || ''} readOnly className="font-mono text-themed-secondary bg-themed-elevated rounded-xl" />
                                    <Button variant="outline" onClick={handleCopy} className="shrink-0 rounded-xl border-themed hover:bg-themed-elevated">
                                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Rotate Token" className="rounded-xl">
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="bg-status-warning/10 border border-status-warning/20 rounded-xl p-4 text-sm text-status-warning">
                                    Keep this token secret! It grants access to your DecoyVerse environment.
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-gradient border-themed">
                            <CardHeader>
                                <CardTitle className="text-themed-primary">2. Download Agent</CardTitle>
                                <CardDescription>Download the pre-configured agent for your machine.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    onClick={handleDownloadAgent}
                                    className="w-full bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Agent Config
                                </Button>
                                <p className="text-sm text-themed-muted mt-4">
                                    Node ID: <span className="font-mono text-accent">{nodeData.node_id}</span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="card-gradient border-themed">
                            <CardHeader>
                                <CardTitle className="text-themed-primary">3. Install the Agent</CardTitle>
                                <CardDescription>Choose your operating system and run the installation command.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="linux" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="linux">Linux</TabsTrigger>
                                        <TabsTrigger value="windows">Windows</TabsTrigger>
                                        <TabsTrigger value="macos">macOS</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="linux" className="space-y-4">
                                        <div className="bg-themed-elevated rounded-xl p-4 font-mono text-sm text-themed-secondary border border-themed relative group">
                                            <p>curl -sSL https://ml-modle-v0-1.onrender.com/install/linux | sudo bash -s -- --token={nodeData.node_api_key}</p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                onClick={() => navigator.clipboard.writeText(`curl -sSL https://ml-modle-v0-1.onrender.com/install/linux | sudo bash -s -- --token=${nodeData.node_api_key}`)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-themed-muted">Supported distributions: Ubuntu, Debian, CentOS, RHEL, Fedora.</p>
                                    </TabsContent>

                                    <TabsContent value="windows" className="space-y-4">
                                        <div className="bg-themed-elevated rounded-xl p-4 font-mono text-sm text-themed-secondary border border-themed relative group">
                                            <p>$env:DECOY_TOKEN="{nodeData.node_api_key}"; iwr -useb https://ml-modle-v0-1.onrender.com/install/windows -OutFile install.ps1; .\install.ps1</p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                onClick={() => navigator.clipboard.writeText(`$env:DECOY_TOKEN="${nodeData.node_api_key}"; iwr -useb https://ml-modle-v0-1.onrender.com/install/windows -OutFile install.ps1; .\\install.ps1`)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-themed-muted">Run in PowerShell as Administrator.</p>
                                    </TabsContent>

                                    <TabsContent value="macos" className="space-y-4">
                                        <div className="bg-themed-elevated rounded-xl p-4 font-mono text-sm text-themed-secondary border border-themed relative group">
                                            <p>curl -sSL https://ml-modle-v0-1.onrender.com/install/macos | sudo bash -s -- --token={nodeData.node_api_key}</p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                onClick={() => navigator.clipboard.writeText(`curl -sSL https://ml-modle-v0-1.onrender.com/install/macos | sudo bash -s -- --token=${nodeData.node_api_key}`)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-themed-muted">Supports macOS 10.15+ (Intel & Apple Silicon).</p>
                                    </TabsContent>
                                </Tabs>
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
