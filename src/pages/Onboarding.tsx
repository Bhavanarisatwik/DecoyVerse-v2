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

                <Card className="card-gradient border-themed">
                    <CardHeader>
                        <CardTitle className="text-themed-primary">1. Get your API Token</CardTitle>
                        <CardDescription>This token is used to authenticate your agent with the DecoyVerse platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input value={token} readOnly className="font-mono text-themed-secondary bg-themed-elevated rounded-xl" />
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
                        <CardTitle className="text-themed-primary">2. Install the Agent</CardTitle>
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
                                    <p>curl -sSL https://install.decoyverse.com/linux | sudo bash -s -- --token={token}</p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                        onClick={() => navigator.clipboard.writeText(`curl -sSL https://install.decoyverse.com/linux | sudo bash -s -- --token=${token}`)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-themed-muted">Supported distributions: Ubuntu, Debian, CentOS, RHEL, Fedora.</p>
                            </TabsContent>

                            <TabsContent value="windows" className="space-y-4">
                                <div className="bg-themed-elevated rounded-xl p-4 font-mono text-sm text-themed-secondary border border-themed relative group">
                                    <p>iwr -useb https://install.decoyverse.com/windows | iex -ArgumentList "--token={token}"</p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                        onClick={() => navigator.clipboard.writeText(`iwr -useb https://install.decoyverse.com/windows | iex -ArgumentList "--token=${token}"`)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-themed-muted">Run in PowerShell as Administrator.</p>
                            </TabsContent>

                            <TabsContent value="macos" className="space-y-4">
                                <div className="bg-themed-elevated rounded-xl p-4 font-mono text-sm text-themed-secondary border border-themed relative group">
                                    <p>curl -sSL https://install.decoyverse.com/macos | sudo bash -s -- --token={token}</p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                        onClick={() => navigator.clipboard.writeText(`curl -sSL https://install.decoyverse.com/macos | sudo bash -s -- --token=${token}`)}
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
                        <CardTitle className="text-themed-primary">3. Verify Connection</CardTitle>
                        <CardDescription>Once installed, the agent will automatically connect to the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-themed-elevated/50 rounded-xl border border-themed border-dashed">
                            <div className="h-3 w-3 rounded-full bg-themed-muted animate-pulse"></div>
                            <span className="text-themed-muted">Waiting for agent heartbeat...</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        size="lg"
                        className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
