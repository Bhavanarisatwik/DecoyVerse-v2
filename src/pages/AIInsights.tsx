import { Sparkles, Brain, Target, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Breadcrumb } from "../components/common/Breadcrumb"

export default function AIInsights() {
    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-accent" />
                        AI Insights
                    </h1>
                    <p className="text-themed-muted">Advanced threat analysis powered by machine learning.</p>
                </div>
                <Button className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate New Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-themed-primary">
                            <div className="h-8 w-8 rounded-lg bg-status-danger/10 flex items-center justify-center">
                                <Target className="h-4 w-4 text-status-danger" />
                            </div>
                            Attacker Profile Analysis
                        </CardTitle>
                        <CardDescription>Based on recent interaction patterns</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-themed-elevated/50 border border-themed">
                            <h4 className="font-semibold text-themed-primary mb-2">APT Group Simulation Detected</h4>
                            <p className="text-sm text-themed-muted mb-3">
                                Recent activity on Node-001 matches TTPs associated with Lazarus Group.
                                The attacker is attempting lateral movement using specific SMB exploits.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-status-danger/10 text-status-danger px-2 py-1 rounded-lg border border-status-danger/20">High Confidence</span>
                                <span className="text-xs bg-themed-elevated text-themed-muted px-2 py-1 rounded-lg">T1021.002</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-themed-elevated/50 border border-themed">
                            <h4 className="font-semibold text-themed-primary mb-2">Automated Scanner Bot</h4>
                            <p className="text-sm text-themed-muted mb-3">
                                High volume of requests from 192.168.1.x subnet indicates an automated vulnerability scanner.
                                Pattern matches OpenVAS signatures.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-status-warning/10 text-status-warning px-2 py-1 rounded-lg border border-status-warning/20">Medium Confidence</span>
                                <span className="text-xs bg-themed-elevated text-themed-muted px-2 py-1 rounded-lg">T1595</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-themed-primary">
                            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-accent" />
                            </div>
                            Recommended Actions
                        </CardTitle>
                        <CardDescription>AI-driven security recommendations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
                            <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 text-accent font-bold text-xs">1</div>
                            <div>
                                <h4 className="font-semibold text-themed-primary">Isolate Node-001</h4>
                                <p className="text-sm text-themed-muted mt-1">
                                    Prevent lateral movement by isolating the compromised node from the main VLAN.
                                </p>
                                <Button size="sm" variant="outline" className="mt-3 border-accent/30 text-accent hover:bg-accent/10 rounded-lg">
                                    Execute Action <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-themed-elevated/50 border border-themed">
                            <div className="h-6 w-6 rounded-full bg-themed-elevated flex items-center justify-center shrink-0 text-themed-muted font-bold text-xs">2</div>
                            <div>
                                <h4 className="font-semibold text-themed-primary">Deploy RDP Decoys</h4>
                                <p className="text-sm text-themed-muted mt-1">
                                    Attacker is scanning for RDP services. Deploying 3 high-interaction RDP decoys will slow them down.
                                </p>
                                <Button size="sm" variant="outline" className="mt-3 border-themed rounded-lg hover:bg-themed-elevated">
                                    Deploy Decoys
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
