import { Link } from "react-router-dom"
import { Button } from "../common/Button"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black-900 pt-16">
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-gold-500 opacity-20 blur-[100px] animate-pulse"></div>
                <div className="absolute right-0 bottom-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-yellow-500 opacity-20 blur-[100px] animate-pulse"></div>
            </div>

            <div className="container relative z-10 px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-sm font-medium text-gold-400 mb-6 shadow-gold-glow">
                        <span className="flex h-2 w-2 rounded-full bg-gold-500 mr-2 animate-pulse"></span>
                        v2.0 Now Available
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 font-heading">
                        Deceive. Detect. <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-400">Defend.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-8">
                        Turn your infrastructure into a minefield for attackers. Deploy realistic decoys,
                        detect breaches instantly, and gather actionable threat intelligence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth/signup">
                            <Button size="lg" className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-black-900 font-bold shadow-gold-glow transition-transform hover:scale-105">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-700 hover:bg-gray-800 hover:border-gold-500 hover:text-gold-500 transition-transform hover:scale-105">
                                View Live Demo
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="mt-16 relative mx-auto max-w-5xl rounded-xl border border-gray-700 bg-black-800/50 shadow-2xl backdrop-blur-sm overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent group-hover:via-gold-400 transition-all duration-500"></div>
                    <img
                        src="https://placehold.co/1200x600/0a0a0a/e5b93b?text=Dashboard+Preview"
                        alt="Dashboard Preview"
                        className="w-full h-auto opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black-900 via-transparent to-transparent"></div>
                </motion.div>
            </div>
        </section>
    )
}
