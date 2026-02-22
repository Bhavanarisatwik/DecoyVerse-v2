import { Activity, Eye, Server, AlertTriangle, Layers, Lock, Cpu, Zap } from "lucide-react"
import { motion } from "framer-motion"

const featureSections = [
    {
        id: "deploy",
        title: "Deploy with Precision",
        description: "Spin up high-interaction decoys across subnets in seconds. Choose from databases, web servers, or custom applications that mirror your real infrastructure perfectly.",
        icon: Server,
        color: "text-accent-400",
        visual: (
            <div className="relative w-full h-full bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl border border-gray-800 p-6 flex flex-col justify-center overflow-hidden lp-feature-card">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--accent-rgb),0.15),transparent_60%)]"></div>

                <div className="relative z-10 grid grid-cols-2 gap-4">
                    {[
                        { name: "Ubuntu_DB_Decoy", ip: "10.0.4.15", type: "PostgreSQL", status: "Active", delay: 0 },
                        { name: "DMZ_Web_Gateway", ip: "192.168.1.100", type: "Apache", status: "Active", delay: 0.2 },
                        { name: "Internal_Wiki", ip: "10.0.2.55", type: "Confluence", status: "Deploying...", delay: 0.4 },
                        { name: "Legacy_SMB", ip: "10.0.5.12", type: "Windows", status: "Active", delay: 0.6 }
                    ].map((node, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: node.delay }}
                            className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 backdrop-blur-sm lp-feature-card-inner"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Server className={`h-5 w-5 ${node.status === 'Active' ? 'text-status-success' : 'text-status-warning'}`} />
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${node.status === 'Active' ? 'bg-status-success/10 text-status-success border border-status-success/20' : 'bg-status-warning/10 text-status-warning border border-status-warning/20 animate-pulse'}`}>
                                    {node.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-white mb-1 truncate lp-feature-text">{node.name}</p>
                            <p className="text-xs text-gray-500 font-mono mb-2 lp-feature-text-muted">{node.ip}</p>
                            <p className="text-xs text-accent-500 font-mono tracking-wider">{node.type}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: "detect",
        title: "Detect the Undetectable",
        description: "Zero false positives. When an alert fires, it's real. Our agents detect lateral movement, credential dumping, and reconnaissance the exact moment an attacker interacts with a decoy.",
        icon: Eye,
        color: "text-status-danger",
        visual: (
            <div className="relative w-full h-full bg-gradient-to-b from-[#050505] to-black rounded-2xl border border-gray-800 p-6 flex items-center justify-center overflow-hidden lp-feature-card">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,50,50,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>

                <div className="w-full max-w-md bg-gray-900/80 border border-status-danger/30 rounded-xl shadow-[0_0_30px_rgba(255,50,50,0.1)] backdrop-blur-md overflow-hidden relative z-10 lp-sim-panel-danger">
                    <div className="h-10 bg-status-danger/20 border-b border-status-danger/30 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-status-danger animate-pulse" />
                            <span className="text-xs font-bold text-status-danger font-mono">SEVERITY: CRITICAL</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">JUST NOW</span>
                    </div>
                    <div className="p-5 font-mono text-sm">
                        <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-gray-400 mb-2">
                            <span className="text-gray-500">Target:</span> 10.0.4.15 (Ubuntu_DB_Decoy)
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="text-gray-400 mb-4">
                            <span className="text-gray-500">Source:</span> 192.168.1.45 <span className="text-status-warning bg-status-warning/10 px-1 rounded text-xs ml-2">Internal_VLAN</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.8 }} className="space-y-1 border-t border-gray-800 pt-3">
                            <div className="text-white flex items-center justify-between">
                                <span>$ ssh root@10.0.4.15</span>
                                <span className="text-status-danger text-xs px-2 py-0.5 bg-status-danger/20 rounded">BLOCKED</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-2 italic">Attacker attempted brute force. Payload captured and isolated.</div>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "analyze",
        title: "Analyze Threat Intelligence",
        description: "Automatically gather IOCs, TTPs, and payload signatures. Feed actionable intelligence directly into your SIEM, SOAR, or firewall to shut down attacks instantly.",
        icon: Activity,
        color: "text-accent",
        visual: (
            <div className="relative w-full h-full bg-gradient-to-b from-[#0a0a0a] to-black rounded-2xl border border-gray-800 p-6 flex flex-col justify-end overflow-hidden text-left lp-feature-card">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full"></div>

                <div className="relative z-10 w-full h-4/5 pt-10">
                    <div className="flex h-full items-end justify-between gap-2 border-b border-gray-800 pb-2">
                        {[30, 45, 25, 60, 85, 40, 95, 55, 75, 100].map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05, type: "spring" }}
                                className="w-full bg-gradient-to-t from-accent/30 via-accent/80 to-accent rounded-t-sm border-t border-accent"
                                style={{
                                    opacity: 0.6 + (height / 200)
                                }}
                            >
                                {height > 80 && (
                                    <div className="w-full h-full flex justify-center -mt-6">
                                        <div className="w-2 h-2 rounded-full border border-black bg-white shadow-[0_0_10px_white] animate-pulse"></div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-gray-500 font-mono">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-accent/80 rounded-sm"></div> IOCs Captured</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-sm"></div> High Confidence</div>
                    </div>
                </div>
            </div>
        )
    }
];

export function Features() {

    return (
        <section id="features" className="py-24 bg-themed-primary relative overflow-hidden transition-colors duration-300">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-accent/5 blur-[200px] pointer-events-none"></div>

            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20 md:mb-32"
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white mb-6 font-heading tracking-tight leading-tight lp-feature-heading">
                        The Anatomy of <br className="hidden md:block" />
                        <span className="text-accent underline decoration-[3px] underline-offset-8">Active Defense</span>
                    </h2>
                    <p className="text-themed-muted max-w-2xl mx-auto text-lg md:text-xl">
                        Abandon reactive security. Step into a unified platform designed to outsmart attackers at every stage of the kill chain.
                    </p>
                </motion.div>

                {/* Storytelling Layout */}
                <div className="relative">
                    {/* Connecting Timeline Line */}
                    <div className="hidden md:block absolute left-[50%] top-[5%] bottom-[5%] w-px bg-gradient-to-b from-transparent via-gray-800 to-transparent -translate-x-1/2 z-0"></div>

                    <div className="space-y-24 md:space-y-40">
                        {featureSections.map((section, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div key={section.id} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 relative z-10 ${isEven ? '' : 'md:flex-row-reverse'}`}>

                                    {/* Text Content */}
                                    <motion.div
                                        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.7, type: "spring", stiffness: 50 }}
                                        className="w-full md:w-1/2 flex flex-col justify-center"
                                    >
                                        <div className={`h-14 w-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-6 shadow-lg lp-feature-icon-box`}>
                                            <section.icon className={`h-7 w-7 ${section.color}`} />
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight lp-feature-text">
                                            {section.title}
                                        </h3>
                                        <p className="text-gray-400 text-lg leading-relaxed lp-feature-text-muted">
                                            {section.description}
                                        </p>
                                    </motion.div>

                                    {/* Visual Representation */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, rotateY: isEven ? -10 : 10 }}
                                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                        className="w-full md:w-1/2 h-[400px] perspective-1000"
                                    >
                                        <div className="w-full h-full shadow-2xl shadow-black/50 rounded-2xl transition-transform duration-500 hover:scale-[1.02]">
                                            {section.visual}
                                        </div>
                                    </motion.div>

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Additional capabilities bento grid below storyline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="mt-40"
                >
                    <div className="text-center mb-16">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-heading lp-feature-text">
                            Comprehensive Security Stack
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { title: "Zero-Trust Architecture", icon: Lock, desc: "Secure by default design." },
                            { title: "ML Intelligence", icon: Cpu, desc: "Automated threat profiling." },
                            { title: "Multi-Cloud Support", icon: Layers, desc: "AWS, GCP, Azure native." },
                            { title: "API First", icon: Zap, desc: "Seamless SIEM integrations." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl hover:bg-gray-800/60 transition-colors group cursor-pointer lp-feature-card-inner"
                            >
                                <item.icon className="h-8 w-8 text-gray-500 group-hover:text-accent transition-colors mb-4" />
                                <h4 className="text-white font-semibold mb-2 lp-feature-text">{item.title}</h4>
                                <p className="text-sm text-gray-500 lp-feature-text-muted">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
