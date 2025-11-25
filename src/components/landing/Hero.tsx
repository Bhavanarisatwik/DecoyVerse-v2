import { Link } from "react-router-dom"
import { Button } from "../common/Button"
import { motion } from "framer-motion"
import { Shield, Activity, Ghost, Server, TrendingUp, ArrowUpRight } from "lucide-react"

export function Hero() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-black-900 pt-32 pb-20">
            {/* Subtle grid background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-gold-500/10 blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-gold-600/5 blur-[100px]"></div>
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl">
                {/* Top badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 backdrop-blur-sm px-4 py-2 text-sm">
                        <span className="flex h-2 w-2 rounded-full bg-gold-500 animate-pulse"></span>
                        <span className="text-gray-400">Now Live</span>
                        <span className="text-white font-medium">v2.0 Release</span>
                    </div>
                </motion.div>

                {/* Main headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2 font-heading leading-tight">
                        Every threat and decoy you own,
                    </h1>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-heading leading-tight">
                        clearly in <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-yellow-500">one place</span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto max-w-2xl text-center text-lg text-gray-500 mb-10"
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
                        <Button size="lg" className="w-full sm:w-auto bg-gold-500 hover:bg-gold-400 text-black-900 font-semibold rounded-full px-8 shadow-lg shadow-gold-500/20">
                            Get Started
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-full px-8">
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
                    <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-black-900 backdrop-blur-xl p-1 shadow-2xl">
                        <div className="rounded-[22px] bg-black-900 p-6">
                            {/* Dashboard Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                                        <Ghost className="h-5 w-5 text-black-900" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">DecoyVerse</p>
                                        <p className="text-gray-500 text-sm">Threat Dashboard</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-gray-700"></div>
                                    <div className="h-3 w-3 rounded-full bg-gray-700"></div>
                                    <div className="h-3 w-3 rounded-full bg-gold-500"></div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-500 text-sm">Active Decoys</span>
                                        <Ghost className="h-4 w-4 text-gold-500" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">247</p>
                                    <p className="text-xs text-status-success flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" /> +12.5%
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-500 text-sm">Threats Detected</span>
                                        <Shield className="h-4 w-4 text-gold-500" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">1,849</p>
                                    <p className="text-xs text-status-danger flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" /> +23.1%
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-500 text-sm">Active Nodes</span>
                                        <Server className="h-4 w-4 text-gold-500" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">34</p>
                                    <p className="text-xs text-gray-500">Across 3 regions</p>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-500 text-sm">Honeytokens</span>
                                        <Activity className="h-4 w-4 text-gold-500" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">892</p>
                                    <p className="text-xs text-status-success flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" /> +8.2%
                                    </p>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6 h-64 flex items-end justify-between gap-2">
                                {/* Simplified bar chart visualization */}
                                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((height, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div 
                                            className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400 transition-all duration-300 hover:from-gold-500 hover:to-gold-300"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                ))}
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
                        <div className="rounded-2xl border border-gray-800 bg-gray-900/90 backdrop-blur-xl p-4 shadow-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-lg bg-status-danger/20 flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-status-danger" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Threat Blocked</p>
                                    <p className="text-gray-500 text-xs">Just now</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">SSH brute force attempt from 192.168.1.x</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="absolute -right-4 md:-right-8 top-1/4 hidden lg:block"
                    >
                        <div className="rounded-2xl border border-gray-800 bg-gray-900/90 backdrop-blur-xl p-4 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
                                    <span className="text-gold-500 font-bold">99%</span>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Detection Rate</p>
                                    <p className="text-gray-500 text-xs">Last 30 days</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom gradient fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black-900 to-transparent pointer-events-none"></div>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="mt-20 text-center"
                >
                    <p className="text-gray-600 text-sm mb-6">Trusted by 2,000+ security teams worldwide</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50">
                        {['Acme Corp', 'TechFlow', 'SecureNet', 'CloudGuard'].map((company) => (
                            <div key={company} className="text-gray-500 font-semibold text-lg">
                                {company}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
