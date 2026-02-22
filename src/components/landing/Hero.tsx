import { Link } from "react-router-dom"
import { Button } from "../common/Button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Shield, Activity, Ghost, Server, Cpu, Network, Lock, Zap } from "lucide-react"
import { useRef, useEffect, useState } from "react"

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scaleText = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

    // Interactive Mouse Tracking for Floating Nodes
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left - rect.width / 2,
                    y: e.clientY - rect.top - rect.height / 2
                });
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const floatingNodes = [
        { icon: Server, xOffset: -550, yOffset: -350, delay: 0.2, color: "text-accent" },
        { icon: Shield, xOffset: 550, yOffset: -250, delay: 0.4, color: "text-status-success" },
        { icon: Activity, xOffset: 600, yOffset: 150, delay: 0.6, color: "text-status-warning" },
        { icon: Cpu, xOffset: -550, yOffset: 250, delay: 0.8, color: "text-accent-400" },
        { icon: Network, xOffset: -650, yOffset: -50, delay: 1.0, color: "text-themed-primary" },
        { icon: Lock, xOffset: 550, yOffset: 250, delay: 1.2, color: "text-themed-muted" },
    ];

    return (
        <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-themed-primary pt-32 pb-20 transition-colors duration-300 perspective-1000 flex items-center justify-center">
            {/* Immersive Parallax Background */}
            <motion.div style={{ y: yBackground }} className="absolute inset-0 z-0 pointer-events-none">
                {/* Dynamic Cyber Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-primary)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20"
                    style={{
                        transform: `perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)`,
                        transformOrigin: 'top center',
                        maskImage: 'linear-gradient(to bottom, black 20%, transparent 80%)'
                    }}>
                </div>
                {/* Central Glowing Nexus */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-accent/15 blur-[150px]"
                />
                <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-600/10 blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-status-danger/5 blur-[100px] mix-blend-screen"></div>
            </motion.div>

            {/* Interactive Floating Nodes */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {floatingNodes.map((node, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 flex items-center justify-center h-16 w-16 rounded-2xl border border-gray-700/80 bg-gray-900/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] lp-hero-node"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: node.xOffset + (mousePosition.x * 0.05 * (i % 2 === 0 ? 1 : -1)),
                            y: node.yOffset + (mousePosition.y * 0.05 * (i % 2 === 0 ? 1 : -1)),
                        }}
                        transition={{
                            opacity: { duration: 1, delay: node.delay },
                            scale: { duration: 1, delay: node.delay, type: "spring" },
                            x: { type: "spring", stiffness: 50, damping: 20 },
                            y: { type: "spring", stiffness: 50, damping: 20 }
                        }}
                    >
                        <node.icon className={`h-6 w-6 ${node.color} opacity-80`} />
                        {/* Connecting line to center simulation (visual only) */}
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-accent/20 animate-pulse"></div>
                    </motion.div>
                ))}
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl flex flex-col items-center justify-center h-full">
                {/* Advanced Top badge */}
                <motion.div
                    style={{ opacity: opacityText, scale: scaleText }}
                    initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex justify-center mb-10"
                >
                    <div className="group relative inline-flex items-center gap-3 rounded-full border border-accent/30 bg-gray-900/80 backdrop-blur-md px-5 py-2 text-sm shadow-[0_0_30px_-5px_var(--accent-500)] overflow-hidden cursor-pointer lp-hero-badge">
                        {/* Sweeping gradient background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full ease-in-out"></div>

                        <div className="relative flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                            </span>
                            <span className="text-themed-muted font-mono tracking-wider text-xs">DecoyVerse OS v2.0 Live</span>
                            <Zap className="h-3.5 w-3.5 text-accent ml-1" />
                        </div>
                    </div>
                </motion.div>

                {/* Highly Animated Main headline */}
                <motion.div
                    style={{ opacity: opacityText, scale: scaleText }}
                    className="text-center mb-8 relative max-w-5xl mx-auto"
                >
                    <motion.h1
                        initial={{ opacity: 0, y: 40, rotateX: -20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 0.9, delay: 0.1, type: "spring", stiffness: 100 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-themed-primary mb-2 font-heading leading-[1.1]"
                    >
                        Active Defense,
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 40, rotateX: -20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 0.9, delay: 0.2, type: "spring", stiffness: 100 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-heading leading-[1.1]"
                    >
                        <span className="text-[#E85A24] drop-shadow-md">
                            Weaponized.
                        </span>
                    </motion.h1>
                </motion.div>

                {/* Refined Subtitle */}
                <motion.p
                    style={{ opacity: opacityText }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mx-auto max-w-3xl text-center text-lg md:text-xl text-themed-muted mb-12 leading-relaxed"
                >
                    Turn your network into a minefield. Deploy high-interaction decoys, bait attackers with honeytokens,
                    and gather unparalleled threat intelligence in real-time.
                </motion.p>

                {/* Premium CTA Buttons */}
                <motion.div
                    style={{ opacity: opacityText }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center mb-16 relative z-20 w-full sm:w-auto"
                >
                    <Link to="/auth/signup" className="w-full sm:w-auto group">
                        <Button size="lg" className="relative w-full overflow-hidden bg-gray-900 border border-accent/50 text-white font-semibold rounded-2xl px-10 h-14 shadow-[0_0_40px_-10px_var(--accent-500)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-10px_var(--accent-500)] group-hover:border-accent lp-btn-primary">
                            {/* Inner sweeping glare */}
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]"></span>
                            <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                                Deploy Now <Ghost className="h-5 w-5" />
                            </span>
                            {/* Animated glowing border base */}
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        </Button>
                    </Link>
                    <Link to="/dashboard" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="w-full h-14 border border-gray-700 bg-gray-900/50 backdrop-blur-md text-gray-300 hover:bg-gray-800 hover:text-white rounded-2xl px-10 transition-all duration-300 hover:scale-105 hover:border-gray-500 text-lg lp-btn-secondary">
                            <span className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-accent-400" />
                                Live Demo
                            </span>
                        </Button>
                    </Link>
                </motion.div>

                {/* Central Application "Console" Preview - Floating above the grid */}
                <motion.div
                    initial={{ opacity: 0, y: 100, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1.2, delay: 0.7, type: "spring", bounce: 0.4 }}
                    className="relative w-full max-w-5xl mx-auto perspective-1000 mt-8"
                >
                    <div className="absolute -inset-1 bg-gradient-to-br from-accent-500/30 via-transparent to-accent-600/30 rounded-[2rem] blur-xl opacity-50 animate-pulse"></div>

                    <div className="relative rounded-3xl border border-gray-700/60 bg-gradient-to-b from-gray-900 via-[#111] to-black p-2 shadow-2xl backdrop-blur-xl">
                        {/* Window Controls */}
                        <div className="absolute top-4 left-4 flex gap-2 z-20">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>

                        <div className="rounded-[20px] bg-[#0a0a0a] border border-gray-800/80 overflow-hidden relative">
                            {/* Simulated Terminal / Command Center Header */}
                            <div className="h-10 border-b border-gray-800/80 bg-gradient-to-r from-gray-900 to-black flex items-center justify-center relative">
                                <span className="text-xs font-mono text-gray-500">root@decoyverse:~ # Threat Monitoring Active</span>
                                <div className="absolute right-4 text-xs font-mono text-accent animate-pulse">
                                    [SYSTEM_ONLINE]
                                </div>
                            </div>

                            {/* Abstracted UI View */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative min-h-[300px]">
                                {/* Background glow in app preview */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-accent/10 rounded-full blur-[80px]"></div>

                                {/* Left Col - Logs */}
                                <div className="col-span-1 border border-gray-800/50 rounded-xl bg-gray-900/40 p-4 font-mono text-xs overflow-hidden relative">
                                    <div className="text-gray-500 mb-4 border-b border-gray-800 pb-2">LIVE_FEED</div>
                                    <div className="space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1 + (i * 0.2), duration: 0.5 }}
                                                className="flex gap-2 text-gray-400 opacity-60"
                                            >
                                                <span className={`${i === 1 ? 'text-accent' : 'text-gray-600'}`}>[{['10:42', '10:43', '10:43', '10:44', '10:45'][i]}]</span>
                                                <span className={`${i === 1 ? 'text-white font-bold' : ''}`}>
                                                    {['Auth success (Node_Alpha)', 'SSH BRUTE FORCE (Decoy_7)', 'Connection dropped', 'Port scan detected (DMZ)', 'Agent sync OK'][i]}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Col - Stats & Topology */}
                                <div className="col-span-2 grid grid-rows-2 gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-gray-800/50 rounded-xl bg-gradient-to-br from-gray-900/60 to-black p-4 flex flex-col justify-center">
                                            <span className="text-gray-500 text-xs font-medium mb-1 flex items-center gap-2">
                                                <Ghost className="w-3 h-3 text-accent" /> DECOYS DEPLOYED
                                            </span>
                                            <span className="text-3xl font-bold text-white lp-sim-text-white">1,048</span>
                                        </div>
                                        <div className="border border-gray-800/50 rounded-xl bg-gradient-to-br from-gray-900/60 to-black p-4 flex flex-col justify-center relative overflow-hidden">
                                            <div className="absolute right-0 top-0 w-16 h-16 bg-status-danger/10 blur-xl"></div>
                                            <span className="text-gray-500 text-xs font-medium mb-1 flex items-center gap-2">
                                                <Shield className="w-3 h-3 text-status-danger" /> BLOCKED THREATS
                                            </span>
                                            <span className="text-3xl font-bold text-white relative z-10 lp-sim-text-white">42,891</span>
                                        </div>
                                    </div>
                                    <div className="border border-gray-800/50 rounded-xl bg-gray-900/20 p-4 relative overflow-hidden flex items-center justify-center">
                                        {/* Abstract Topology Map */}
                                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"></div>
                                        <div className="flex items-center gap-8 z-10">
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center"><Server className="w-4 h-4 text-gray-400" /></motion.div>
                                            <div className="w-16 h-[1px] bg-gradient-to-r from-gray-700 to-accent relative">
                                                <motion.div animate={{ x: [0, 64] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent-500)]"></motion.div>
                                            </div>
                                            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }} className="w-12 h-12 rounded-xl bg-gray-900 border border-accent flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"><Ghost className="w-6 h-6 text-accent" /></motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
