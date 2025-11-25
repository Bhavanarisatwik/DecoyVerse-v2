import { Ghost, Github, Twitter, Linkedin, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../common/Button"

const faqs = [
    {
        question: "Is DecoyVerse safe to use?",
        answer: "Yes, DecoyVerse uses bank-grade encryption and security practices. All decoys are isolated and monitored."
    },
    {
        question: "What protocols does DecoyVerse support?",
        answer: "We support SSH, HTTP, HTTPS, RDP, SMB, FTP, MySQL, PostgreSQL, and custom protocol emulation."
    },
    {
        question: "Can I deploy on-premise?",
        answer: "Yes, Enterprise plans include on-premise deployment options with full data sovereignty."
    },
    {
        question: "How quickly can I get started?",
        answer: "You can deploy your first decoy within 5 minutes of signing up. Our agent installation is seamless."
    }
]

export function Footer() {
    return (
        <footer className="bg-themed-primary relative overflow-hidden">
            {/* FAQ Section */}
            <section className="py-24 border-t border-themed">
                <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-themed-primary mb-4 font-heading">
                            Frequently asked questions
                        </h2>
                        <p className="text-themed-muted">
                            Everything you need to know about DecoyVerse.
                        </p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/60 via-gray-800/30 to-gray-900/40 p-5 hover:border-gray-700 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-themed-primary font-medium">{faq.question}</h3>
                                    <ChevronRight className="h-5 w-5 text-themed-dimmed group-hover:text-accent transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black p-12 text-center overflow-hidden"
                    >
                        {/* Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-themed-primary mb-4 font-heading">
                                Enterprise-grade security.<br />
                                <span className="text-accent">Effortless simplicity.</span>
                            </h2>
                            <p className="text-themed-muted max-w-xl mx-auto mb-8">
                                Full protection for your network. Deploy decoys in minutes. Get alerted instantly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/auth/signup">
                                    <Button size="lg" className="bg-gradient-to-r from-accent-400 via-accent to-accent-600 hover:from-accent-400 hover:via-accent-400 hover:to-accent text-on-accent font-semibold rounded-full px-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-accent-glow">
                                        Start Free Trial
                                    </Button>
                                </Link>
                                <Link to="/dashboard">
                                    <Button variant="outline" size="lg" className="border-accent/30 text-themed-secondary hover:bg-accent/10 hover:border-accent/60 rounded-full px-8 transition-all duration-300 hover:scale-[1.02]">
                                        View Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer Links */}
            <div className="border-t border-themed py-12">
                <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
                                <Ghost className="h-4 w-4 text-themed-primary" />
                            </div>
                            <span className="text-lg font-bold text-themed-primary tracking-tight">DecoyVerse</span>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-themed-muted">
                            <Link to="#" className="hover:text-themed-primary transition-colors">Company</Link>
                            <Link to="#" className="hover:text-themed-primary transition-colors">Whitepaper</Link>
                            <Link to="#" className="hover:text-themed-primary transition-colors">Features</Link>
                            <Link to="#" className="hover:text-themed-primary transition-colors">Privacy</Link>
                            <Link to="#" className="hover:text-themed-primary transition-colors">FAQ</Link>
                        </div>

                        {/* Social */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="h-10 w-10 rounded-full border border-accent/20 flex items-center justify-center text-themed-muted hover:text-themed-primary hover:border-accent/50 transition-all duration-300 hover:bg-accent/10 hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
                                <Github className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full border border-accent/20 flex items-center justify-center text-themed-muted hover:text-themed-primary hover:border-accent/50 transition-all duration-300 hover:bg-accent/10 hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full border border-accent/20 flex items-center justify-center text-themed-muted hover:text-themed-primary hover:border-accent/50 transition-all duration-300 hover:bg-accent/10 hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-themed text-center">
                        <p className="text-sm text-themed-dimmed">
                            © 2025 DecoyVerse Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
