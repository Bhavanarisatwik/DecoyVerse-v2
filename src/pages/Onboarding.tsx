import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Copy, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/common/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/Tabs"
import { Input } from "../components/common/Input"

export default function Onboarding() {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [token] = useState("dcv_live_8f92k3920dk20dk29d02kd92kd92");

    const handleCopy = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black-900 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gold-500/10 mb-4">
                        <CheckCircle2 className="h-8 w-8 text-gold-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-heading">Setup your first Agent</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        You're almost there! Install the lightweight agent on your target machine to start deploying decoys.
                    </p>
                </div>

                <Card className="border-gray-700 bg-gray-800">
                    <CardHeader>
                        <CardTitle>1. Get your API Token</CardTitle>
                        <CardDescription>This token is used to authenticate your agent with the DecoyVerse platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input value={token} readOnly className="font-mono text-gray-300 bg-black-900" />
                            <Button variant="outline" onClick={handleCopy} className="shrink-0">
                                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" title="Rotate Token">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg p-4 text-sm text-status-warning">
                            Keep this token secret! It grants access to your DecoyVerse environment.
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gray-800">
                    <CardHeader>
                        <CardTitle>2. Install the Agent</CardTitle>
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
                                <div className="bg-black-900 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-700 relative group">
                                    <p>curl -sSL https://install.decoyverse.com/linux | sudo bash -s -- --token={token}</p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => navigator.clipboard.writeText(`curl -sSL https://install.decoyverse.com/linux | sudo bash -s -- --token=${token}`)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-400">Supported distributions: Ubuntu, Debian, CentOS, RHEL, Fedora.</p>
                            </TabsContent>

                            <TabsContent value="windows" className="space-y-4">
                                <div className="bg-black-900 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-700 relative group">
                                    <p>iwr -useb https://install.decoyverse.com/windows | iex -ArgumentList "--token={token}"</p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => navigator.clipboard.writeText(`iwr -useb https://install.decoyverse.com/windows | iex -ArgumentList "--token=${token}"`)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-400">Run in PowerShell as Administrator.</p>
                            </TabsContent>

                            <TabsContent value="macos" className="space-y-4">
                                <div className="bg-black-900 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-700 relative group">
                                    <p>curl -sSL https://install.decoyverse.com/macos | sudo bash -s -- --token={token}</p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => navigator.clipboard.writeText(`curl -sSL https://install.decoyverse.com/macos | sudo bash -s -- --token=${token}`)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-400">Supports macOS 10.15+ (Intel & Apple Silicon).</p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gray-800">
                    <CardHeader>
                        <CardTitle>3. Verify Connection</CardTitle>
                        <CardDescription>Once installed, the agent will automatically connect to the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-black-800 rounded-lg border border-gray-700 border-dashed">
                            <div className="h-3 w-3 rounded-full bg-gray-600 animate-pulse"></div>
                            <span className="text-gray-400">Waiting for agent heartbeat...</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        size="lg"
                        className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
