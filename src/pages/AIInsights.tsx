import { Sparkles, Brain, Target, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"

export default function AIInsights() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-gold-500" />
                        AI Insights
                    </h1>
                    <p className="text-gray-400">Advanced threat analysis powered by machine learning.</p>
                </div>
                <Button className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate New Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-status-danger" />
                            Attacker Profile Analysis
                        </CardTitle>
                        <CardDescription>Based on recent interaction patterns</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-black-800 border border-gray-700">
                            <h4 className="font-semibold text-white mb-2">APT Group Simulation Detected</h4>
                            <p className="text-sm text-gray-400 mb-3">
                                Recent activity on Node-001 matches TTPs associated with Lazarus Group.
                                The attacker is attempting lateral movement using specific SMB exploits.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-status-danger/10 text-status-danger px-2 py-1 rounded border border-status-danger/20">High Confidence</span>
                                <span className="text-xs bg-black-800 text-gray-400 px-2 py-1 rounded">T1021.002</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-black-800 border border-gray-700">
                            <h4 className="font-semibold text-white mb-2">Automated Scanner Bot</h4>
                            <p className="text-sm text-gray-400 mb-3">
                                High volume of requests from 192.168.1.x subnet indicates an automated vulnerability scanner.
                                Pattern matches OpenVAS signatures.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-status-warning/10 text-status-warning px-2 py-1 rounded border border-status-warning/20">Medium Confidence</span>
                                <span className="text-xs bg-black-800 text-gray-400 px-2 py-1 rounded">T1595</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-gold-500" />
                            Recommended Actions
                        </CardTitle>
                        <CardDescription>AI-driven security recommendations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gold-500/5 border border-gold-500/20">
                            <div className="h-6 w-6 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0 text-gold-500 font-bold text-xs">1</div>
                            <div>
                                <h4 className="font-semibold text-white">Isolate Node-001</h4>
                                <p className="text-sm text-gray-400 mt-1">
                                    Prevent lateral movement by isolating the compromised node from the main VLAN.
                                </p>
                                <Button size="sm" variant="outline" className="mt-3 border-gold-500/30 text-gold-500 hover:bg-gold-500/10">
                                    Execute Action <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-black-800 border border-gray-700">
                            <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0 text-gray-400 font-bold text-xs">2</div>
                            <div>
                                <h4 className="font-semibold text-white">Deploy RDP Decoys</h4>
                                <p className="text-sm text-gray-400 mt-1">
                                    Attacker is scanning for RDP services. Deploying 3 high-interaction RDP decoys will slow them down.
                                </p>
                                <Button size="sm" variant="outline" className="mt-3 border-gray-700">
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
