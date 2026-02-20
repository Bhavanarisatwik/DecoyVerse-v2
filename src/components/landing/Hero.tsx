import { Link } from "react-router-dom"
import { Button } from "../common/Button"
import { motion } from "framer-motion"
import { Shield, Activity, Ghost, Server, TrendingUp } from "lucide-react"

export function Hero() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-themed-primary pt-32 pb-20 transition-colors duration-300">
            {/* Subtle grid background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-primary)_1px,transparent_1px)] bg-[size:32px_32px] opacity-12"></div>
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]"></div>
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl">
                {/* Top badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-themed bg-themed-card/50 backdrop-blur-sm px-4 py-2 text-sm">
                        <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                        <span className="text-themed-muted">Now Live</span>
                        <span className="text-themed-primary font-medium">v2.0 Release</span>
                    </div>
                </motion.div>

                {/* Main headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-themed-primary mb-2 font-heading leading-tight">
                        Deception technology,
                    </h1>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-themed-primary font-heading leading-tight">
                        <span className="text-accent">reimagined.</span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto max-w-2xl text-center text-lg text-themed-muted mb-10"
                >
                    The next-gen deception platform to deploy decoys, honeytokens,
                    and gather threat intelligence—all from one powerful dashboard.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
                >
                    <Link to="/auth/signup">
                        <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-accent-400 via-accent to-accent-600 hover:from-accent-400 hover:via-accent-400 hover:to-accent text-on-accent font-semibold rounded-full px-8 shadow-accent-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-accent-glow">
                            Get Started
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto border-accent/30 text-themed-secondary hover:bg-accent/10 hover:text-themed-primary rounded-full px-8 transition-all duration-300 hover:scale-[1.02] hover:border-accent/60 hover:shadow-accent-sm">
                            View Live Demo
                        </Button>
                    </Link>
                </motion.div>

                {/* Dashboard Preview - Bento Grid Style */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative mx-auto max-w-6xl"
                >
                    {/* Main Dashboard Card */}
                    <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/90 via-gray-800/40 to-black backdrop-blur-xl p-1 shadow-2xl">
                        <div className="rounded-[22px] bg-themed-primary p-6">
                            {/* Dashboard Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                                        <Ghost className="h-5 w-5 text-on-accent" />
                                    </div>
                                    <div>
                                        <p className="text-themed-primary font-semibold">DecoyVerse</p>
                                        <p className="text-themed-muted text-sm">Threat Dashboard</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-themed-elevated"></div>
                                    <div className="h-3 w-3 rounded-full bg-themed-elevated"></div>
                                    <div className="h-3 w-3 rounded-full bg-accent"></div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/30 p-4 transition-all duration-300 hover:border-gray-700 backdrop-blur-sm cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-themed-muted text-sm">Active Decoys</span>
                                        <Ghost className="h-4 w-4 text-accent" />
                                    </div>
                                    <p className="text-2xl font-bold text-themed-primary">247</p>
                                    <p className="text-xs text-status-success flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" /> +12.5%
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/30 p-4 transition-all duration-300 hover:border-gray-700 backdrop-blur-sm cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-themed-muted text-sm">Threats Detected</span>
                                        <Shield className="h-4 w-4 text-accent" />
                                    </div>
                                    <p className="text-2xl font-bold text-themed-primary">1,849</p>
                                    <p className="text-xs text-status-danger flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" /> +23.1%
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/30 p-4 transition-all duration-300 hover:border-gray-700 backdrop-blur-sm cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-themed-muted text-sm">Active Nodes</span>
                                        <Server className="h-4 w-4 text-accent" />
                                    </div>
                                    <p className="text-2xl font-bold text-themed-primary">34</p>
                                    <p className="text-xs text-themed-muted">Across 3 regions</p>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/30 p-4 transition-all duration-300 hover:border-gray-700 backdrop-blur-sm cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-themed-muted text-sm">Honeytokens</span>
                                        <Activity className="h-4 w-4 text-accent" />
                                    </div>
                                    <p className="text-2xl font-bold text-themed-primary">892</p>
                                    <p className="text-xs text-status-success flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" /> +8.2%
                                    </p>
                                </div>
                            </div>

                            {/* Chart Area - Split into two charts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Bar Chart */}
                                <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/60 to-black p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-themed-muted text-sm">Threat Activity</span>
                                        <span className="text-xs text-themed-dimmed">Last 7 days</span>
                                    </div>
                                    <div className="h-32 flex items-end justify-between gap-1">
                                        {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div
                                                    className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                                                    style={{
                                                        height: `${height}%`,
                                                        background: `linear-gradient(to top, var(--accent-700), var(--accent-400))`
                                                    }}
                                                ></div>
                                                <span className="text-[10px] text-themed-dimmed">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Area/Line Chart */}
                                <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/60 to-black p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-themed-muted text-sm">Detection Rate</span>
                                        <span className="text-xs text-status-success">+12.5%</span>
                                    </div>
                                    <div className="h-32 relative">
                                        {/* Area fill */}
                                        <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" style={{ stopColor: 'var(--accent-500)', stopOpacity: 0.3 }} />
                                                    <stop offset="100%" style={{ stopColor: 'var(--accent-500)', stopOpacity: 0 }} />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M0,60 Q20,55 40,45 T80,35 T120,25 T160,20 T200,15 L200,80 L0,80 Z"
                                                fill="url(#areaGradient)"
                                            />
                                            <path
                                                d="M0,60 Q20,55 40,45 T80,35 T120,25 T160,20 T200,15"
                                                fill="none"
                                                stroke="var(--accent-500)"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                        {/* Data points */}
                                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-themed-dimmed">
                                            <span>Jan</span>
                                            <span>Feb</span>
                                            <span>Mar</span>
                                            <span>Apr</span>
                                            <span>May</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="absolute -left-4 md:-left-8 top-1/3 hidden lg:block"
                    >
                        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/95 via-gray-800/80 to-gray-900/90 backdrop-blur-xl p-4 shadow-xl transition-all duration-300 hover:border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-status-danger/30 to-status-danger/10 flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-status-danger" />
                                </div>
                                <div>
                                    <p className="text-themed-primary text-sm font-medium">Threat Blocked</p>
                                    <p className="text-themed-muted text-xs">Just now</p>
                                </div>
                            </div>
                            <p className="text-xs text-themed-muted">SSH brute force attempt from 192.168.1.x</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="absolute -right-4 md:-right-8 top-1/4 hidden lg:block"
                    >
                        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/95 via-gray-800/80 to-gray-900/90 backdrop-blur-xl p-4 shadow-xl transition-all duration-300 hover:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                                    <span className="text-accent font-bold">99%</span>
                                </div>
                                <div>
                                    <p className="text-themed-primary text-sm font-medium">Detection Rate</p>
                                    <p className="text-themed-muted text-xs">Last 30 days</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom gradient fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none"></div>
                </motion.div>

                {/* Capabilities */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="mt-20 text-center"
                >
                    <p className="text-themed-dimmed text-sm mb-6">Securing next-generation infrastructure</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50">
                        {['Zero-Day Protection', 'Real-Time Alerts', 'Proactive Defense', 'ML-Powered Intelligence'].map((cap) => (
                            <div key={cap} className="text-themed-muted font-semibold text-lg">
                                {cap}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
