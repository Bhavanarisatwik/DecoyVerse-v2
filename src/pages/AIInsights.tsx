import { useState, useEffect } from "react"
import { Sparkles, Brain, Target, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { aiInsightsApi, type AttackerProfile } from "../api/endpoints/ai-insights"

export default function AIInsights() {
    const [profiles, setProfiles] = useState<AttackerProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoading(true)
                // Fetch threat profiles for known IPs
                const ips = ['192.168.1.45', '172.16.0.5', '10.0.0.12']
                const profileData = await Promise.all(
                    ips.map(ip => aiInsightsApi.getAttackerProfile(ip))
                )
                setProfiles(profileData.map(p => p.data))
            } catch (err) {
                console.error('Error fetching profiles:', err)
                setError('Failed to load AI insights')
            } finally {
                setLoading(false)
            }
        }

        fetchProfiles()
    }, [])

    if (error) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <Card className="bg-status-danger/10 border-status-danger/50">
                    <CardContent className="pt-6">
                        <p className="text-status-danger flex items-center">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {error}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

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

            {loading ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-themed-muted">Loading AI insights...</p>
                    </CardContent>
                </Card>
            ) : (
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
                            {profiles.length === 0 ? (
                                <div className="text-center py-8 text-themed-muted">
                                    No threat profiles detected yet.
                                </div>
                            ) : (
                                profiles.map((profile) => (
                                    <div key={profile.ip} className="p-4 rounded-xl bg-themed-elevated/50 border border-themed">
                                        <h4 className="font-semibold text-themed-primary mb-2">{profile.threat_name}</h4>
                                        <p className="text-sm text-themed-muted mb-3">
                                            {profile.description}
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            <span className={`text-xs px-2 py-1 rounded-lg border ${
                                                profile.confidence > 0.8 ? 'bg-status-danger/10 text-status-danger border-status-danger/20' :
                                                profile.confidence > 0.6 ? 'bg-status-warning/10 text-status-warning border-status-warning/20' :
                                                'bg-status-info/10 text-status-info border-status-info/20'
                                            }`}>
                                                {(profile.confidence * 100).toFixed(0)}% Confidence
                                            </span>
                                            {profile.ttps.slice(0, 2).map(ttp => (
                                                <span key={ttp} className="text-xs bg-themed-elevated text-themed-muted px-2 py-1 rounded-lg">
                                                    {ttp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
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
                                    <h4 className="font-semibold text-themed-primary">Monitor Attacker Activity</h4>
                                    <p className="text-sm text-themed-muted mt-1">
                                        High-confidence threat detected. Deploy additional honeytokens to track lateral movement.
                                    </p>
                                    <Button size="sm" variant="outline" className="mt-3 border-accent/30 text-accent hover:bg-accent/10 rounded-lg">
                                        Deploy Honeytokens <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-themed-elevated/50 border border-themed">
                                <div className="h-6 w-6 rounded-full bg-themed-elevated flex items-center justify-center shrink-0 text-themed-muted font-bold text-xs">2</div>
                                <div>
                                    <h4 className="font-semibold text-themed-primary">Enhance Decoy Coverage</h4>
                                    <p className="text-sm text-themed-muted mt-1">
                                        Identified scanning patterns. Deploying more high-interaction decoys will improve detection.
                                    </p>
                                    <Button size="sm" variant="outline" className="mt-3 border-themed rounded-lg hover:bg-themed-elevated">
                                        Create Decoys
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
