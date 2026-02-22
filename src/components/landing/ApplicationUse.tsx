import { motion, AnimatePresence } from "framer-motion"
import { Shield, Server, Eye, Activity, Terminal } from "lucide-react"
import { useState } from "react"

const useCases = [
    {
        id: "ransomware",
        title: "Ransomware Defense",
        icon: Shield,
        description: "Deploy SMB and database decoys that detect lateral movement and file encryption attempts before real assets are compromised.",
        metrics: { time: "Instant", accuracy: "99.9%" },
        visual: (
            <div className="relative h-full w-full rounded-2xl bg-[#0a0a0a] border border-gray-800 p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-status-danger/10 blur-[50px] rounded-full"></div>
                <div className="font-mono text-xs text-status-danger mb-4 flex items-center gap-2">
                    <span className="animate-pulse h-2 w-2 rounded-full bg-status-danger"></span>
                    CRITICAL: SMB ENCRYPTION ATTEMPT DETECTED
                </div>
                <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-status-danger/30 bg-status-danger/10">
                        <div className="flex items-center gap-3">
                            <Server className="h-5 w-5 text-status-danger" />
                            <div>
                                <div className="text-sm font-medium text-white">FILE_SERVER_DECOY_01</div>
                                <div className="text-xs text-gray-500">10.0.4.52</div>
                            </div>
                        </div>
                        <div className="text-xs text-status-danger font-mono">BLOCKED</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <Server className="h-5 w-5 text-gray-400" />
                            <div>
                                <div className="text-sm font-medium text-white">PRODUCTION_DB_MAIN</div>
                                <div className="text-xs text-gray-500">10.0.2.10</div>
                            </div>
                        </div>
                        <div className="text-xs text-status-success font-mono">SAFE</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "insider",
        title: "Insider Threat Detection",
        icon: Eye,
        description: "Scatter honeytokens (fake AWS keys, database credentials) across internal wikis and codebases to catch malicious insiders.",
        metrics: { time: "< 1s", accuracy: "100%" },
        visual: (
            <div className="relative h-full w-full rounded-2xl bg-[#0a0a0a] border border-gray-800 p-6 flex flex-col">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 blur-[60px] rounded-full"></div>
                <div className="font-mono text-xs text-accent mb-4 flex items-center gap-2 border-b border-gray-800 pb-3">
                    <Terminal className="h-4 w-4" /> alerts.log
                </div>
                <div className="space-y-4">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-gray-400 font-mono bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <span className="text-blue-400">INFO</span> Decoy AWS Key generated: AKIAIOSFODNN7EXAMPLE
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="text-xs text-gray-400 font-mono bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <span className="text-blue-400">INFO</span> Planted in internal Confluence
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }} className="text-xs text-white font-mono bg-accent/20 border border-accent/50 p-3 rounded-lg relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
                        <span className="text-accent font-bold">ALERT</span> Decoy Key Used!
                        <br />
                        <span className="text-gray-400 mt-1 block">IP: 192.168.1.105 (Engineering Subnet)</span>
                    </motion.div>
                </div>
            </div>
        )
    },
    {
        id: "recon",
        title: "Network Reconnaissance",
        icon: Activity,
        description: "Identify automated scanners and APTs mapping your network by deploying hundreds of lightweight ghost nodes.",
        metrics: { time: "Real-time", scale: "10k+ IPs" },
        visual: (
            <div className="relative h-full w-full rounded-2xl bg-[#0a0a0a] border border-gray-800 p-6 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent"></div>

                {/* Radar sweep animation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[120%] h-[120%] rounded-full border border-gray-800/30"></div>
                    <div className="absolute w-[80%] h-[80%] rounded-full border border-gray-800/50"></div>
                    <div className="absolute w-[40%] h-[40%] rounded-full border border-gray-800/70"></div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute w-1/2 h-1/2 origin-bottom-right bottom-1/2 right-1/2 bg-gradient-to-t from-transparent via-accent/20 to-accent/40"
                        style={{ borderRight: '2px solid rgba(var(--accent-rgb), 0.8)' }}
                    ></motion.div>
                </div>

                {/* Threat blips */}
                <motion.div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-status-danger shadow-[0_0_10px_var(--status-danger)] animate-ping"></motion.div>
                <motion.div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-status-warning shadow-[0_0_10px_var(--status-warning)] animate-ping" style={{ animationDelay: '1s' }}></motion.div>
                <motion.div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-status-danger shadow-[0_0_10px_var(--status-danger)] animate-ping" style={{ animationDelay: '2.5s' }}></motion.div>
            </div>
        )
    }
];

export function ApplicationUse() {
    const [activeTab, setActiveTab] = useState(useCases[0].id);

    return (
        <section id="use-cases" className="py-24 bg-themed-primary relative overflow-hidden transition-colors duration-300">
            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 md:mb-24"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-themed-primary mb-4 font-heading text-center md:text-left">
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">real threats.</span>
                    </h2>
                    <p className="text-themed-muted max-w-2xl text-center md:text-left text-lg">
                        See how DecoyVerse shifts the balance of power back to defenders across various attack vectors.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* Left side: Interactive Tabs */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                        {useCases.map((useCase) => (
                            <motion.button
                                key={useCase.id}
                                onClick={() => setActiveTab(useCase.id)}
                                className={`w-full text-left p-4 rounded-3xl border border-transparent transition-all duration-300 group relative z-20 pointer-events-auto ${activeTab === useCase.id ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border-accent/50 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)] lp-tab-active' : 'hover:bg-gray-900/30 border-gray-800/50 lp-tab-inactive'
                                    }`}
                                whileHover={{ scale: activeTab === useCase.id ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {activeTab === useCase.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 bg-accent/5"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <div className="relative z-10 flex items-start gap-4">
                                    <div className={`mt-1 p-3 rounded-2xl ${activeTab === useCase.id ? 'bg-accent/20 text-accent' : 'bg-gray-800 text-gray-400 group-hover:text-gray-300 lp-feature-card-inner'}`}>
                                        <useCase.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold mb-2 ${activeTab === useCase.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200 lp-feature-text-muted'}`}>
                                            {useCase.title}
                                        </h3>
                                        <AnimatePresence>
                                            {activeTab === useCase.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <p className="text-themed-muted text-sm leading-relaxed mb-4">
                                                        {useCase.description}
                                                    </p>
                                                    <div className="flex gap-4">
                                                        {Object.entries(useCase.metrics).map(([key, value], i) => (
                                                            <div key={i} className="flex flex-col">
                                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{key}</span>
                                                                <span className="text-accent font-semibold text-sm">{value as string}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Right side: Dynamic Visuals */}
                    <div className="md:col-span-7 h-[500px] md:h-[600px] rounded-[2rem] border border-gray-800/60 bg-gradient-to-b from-gray-900/40 to-black p-2 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none"></div>

                        <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-b from-[#050505] to-black border border-gray-800/80 overflow-hidden relative shadow-2xl lp-feature-card">
                            {/* Window UI */}
                            <div className="h-10 border-b border-gray-800/80 bg-[#111] theme-light:bg-white/50 flex items-center px-4 lp-sim-header">
                                <span className="flex gap-1.5 flex-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span>
                                </span>
                                <div className="text-xs text-gray-500 font-mono tracking-wider flex-1 text-center">
                                    SIMULATION_VIEW
                                </div>
                                <div className="flex-1"></div>
                            </div>

                            <div className="p-4 h-[calc(100%-2.5rem)] relative">
                                <AnimatePresence mode="wait">
                                    {useCases.map((useCase) => (
                                        activeTab === useCase.id && (
                                            <motion.div
                                                key={useCase.id}
                                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                                className="absolute inset-4"
                                            >
                                                {useCase.visual}
                                            </motion.div>
                                        )
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
