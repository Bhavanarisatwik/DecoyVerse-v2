import { Shield, Ghost, Activity, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../common/Card"

const features = [
    {
        icon: Ghost,
        title: "Realistic Decoys",
        description: "Deploy high-interaction decoys that mimic real services (SSH, HTTP, RDP) to confuse attackers."
    },
    {
        icon: Shield,
        title: "Instant Detection",
        description: "Detect lateral movement the moment an attacker touches a decoy asset. Zero false positives."
    },
    {
        icon: Activity,
        title: "Threat Intelligence",
        description: "Gather detailed logs, TTPs, and attacker behavior analytics to strengthen your defenses."
    },
    {
        icon: Lock,
        title: "Honeytokens",
        description: "Plant fake credentials and files. Get alerted immediately when they are used or opened."
    }
]

export function Features() {
    return (
        <section className="py-24 bg-black-900 relative">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
                        Advanced Deception Technology
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Stay one step ahead of cyber threats with our comprehensive suite of deception tools.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="bg-gray-800 border-gray-700 hover:border-gold-500/50 transition-all hover:-translate-y-1 duration-300 shadow-lg hover:shadow-gold-500/10">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-gold-500/10 flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6 text-gold-500" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-400">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
