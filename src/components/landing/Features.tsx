import { Shield, Ghost, Activity, Lock, Zap, Eye, Server, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

const problemCards = [
    {
        title: "Fragmented visibility",
        description: "Your security tools are scattered across multiple platforms with no unified view of your attack surface.",
        visual: (
            <div className="grid grid-cols-3 gap-2 p-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-gray-800 border border-gray-700 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
        )
    },
    {
        title: "Hidden Threats",
        description: "Attackers move laterally undetected. Traditional security misses insider threats and advanced persistent attacks.",
        visual: (
            <div className="p-4 flex items-center justify-center">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-status-danger animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-status-danger animate-ping"></div>
                </div>
            </div>
        )
    },
    {
        title: "No real control",
        description: "Reactive security leaves you always one step behind. You need proactive threat hunting capabilities.",
        visual: (
            <div className="p-4">
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <div className="text-2xl font-bold text-white mb-1">$4.88M</div>
                    <div className="text-xs text-gray-500">Avg. data breach cost in 2024</div>
                </div>
            </div>
        )
    }
]

const solutionFeatures = [
    {
        icon: Ghost,
        title: "Unified Dashboard",
        description: "See all decoys, honeytokens, and threats in one powerful interface."
    },
    {
        icon: Zap,
        title: "Instant Detection",
        description: "Get alerted the moment an attacker interacts with any decoy asset."
    },
    {
        icon: Shield,
        title: "Bank-Grade Security",
        description: "Enterprise-level encryption and security for all your deception infrastructure."
    }
]

const capabilities = [
    {
        icon: Shield,
        title: "Advance Security",
        description: "Multi-layer deception with realistic high-interaction decoys that fool even sophisticated attackers.",
        size: "large"
    },
    {
        icon: Server,
        title: "DecoyVerse Agent",
        description: "Deploy lightweight agents across your infrastructure for seamless decoy management and monitoring.",
        size: "large",
        visual: (
            <div className="mt-4 rounded-xl border border-gray-700 bg-gray-900/50 p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <div className="h-2 w-2 rounded-full bg-status-success"></div>
                    Agent Status: Active
                </div>
                <div className="h-1 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-gold-600 to-gold-400"></div>
                </div>
            </div>
        )
    },
    {
        icon: Activity,
        title: "Multi-protocol Decoys",
        description: "SSH, HTTP, RDP, SMB, and more—realistic services that capture attacker behavior.",
        size: "small"
    },
    {
        icon: Zap,
        title: "Instant Alerts",
        description: "Real-time notifications via Slack, email, or webhooks when threats are detected.",
        size: "small"
    },
    {
        icon: Eye,
        title: "Threat Intelligence",
        description: "Gather detailed TTPs, IOCs, and attacker behavior analytics automatically.",
        size: "small"
    }
]

export function Features() {
    return (
        <section id="features" className="py-24 bg-black-900 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gold-500/5 blur-[150px]"></div>
            
            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
                {/* Problem Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-heading">
                        Juggling security tools?
                    </h2>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">
                        Chaos isn't <span className="text-gray-500">management.</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Most organizations use fragmented security tools that leave gaps attackers exploit. 
                        It's time for a unified deception platform.
                    </p>
                </motion.div>

                {/* Problem Cards - Bento Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-32">
                    {problemCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/50 to-black-900 p-6 hover:border-gray-700 transition-colors"
                        >
                            <div className="h-40 rounded-2xl bg-black-900 border border-gray-800 mb-4 overflow-hidden">
                                {card.visual}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
                            <p className="text-gray-500 text-sm">{card.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Solution Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-heading">
                        One Platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">Total Control.</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        DecoyVerse consolidates all your deception capabilities into one powerful, 
                        easy-to-use platform with proactive threat detection.
                    </p>
                </motion.div>

                {/* Solution Features Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-32">
                    {solutionFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-4">
                                <feature.icon className="h-6 w-6 text-gold-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-500 text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Capabilities Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-heading">
                        Amplified with modern capabilities
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Every feature you need to turn your network into an attacker's nightmare.
                    </p>
                </motion.div>

                {/* Capabilities Bento Grid */}
                <div className="grid md:grid-cols-4 gap-4">
                    {capabilities.map((cap, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/50 to-black-900 p-6 hover:border-gold-500/30 transition-all ${
                                cap.size === 'large' ? 'md:col-span-2' : ''
                            }`}
                        >
                            <div className="h-12 w-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                                <cap.icon className="h-6 w-6 text-gold-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{cap.title}</h3>
                            <p className="text-gray-500 text-sm">{cap.description}</p>
                            {cap.visual}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
