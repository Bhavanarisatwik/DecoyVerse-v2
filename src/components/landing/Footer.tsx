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
        <footer className="bg-black-900 relative overflow-hidden">
            {/* FAQ Section */}
            <section className="py-24 border-t border-gray-800">
                <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
                            Frequently asked questions
                        </h2>
                        <p className="text-gray-500">
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
                                className="rounded-2xl border border-gray-800 bg-gray-900/30 p-5 hover:border-gray-700 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-medium">{faq.question}</h3>
                                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-gold-500 transition-colors" />
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
                        className="relative rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-black-900 p-12 text-center overflow-hidden"
                    >
                        {/* Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-gold-500/10 blur-[100px]"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
                                Enterprise-grade security.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">Effortless simplicity.</span>
                            </h2>
                            <p className="text-gray-500 max-w-xl mx-auto mb-8">
                                Full protection for your network. Deploy decoys in minutes. Get alerted instantly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/auth/signup">
                                    <Button size="lg" className="bg-gold-500 hover:bg-gold-400 text-black-900 font-semibold rounded-full px-8">
                                        Start Free Trial
                                    </Button>
                                </Link>
                                <Link to="/dashboard">
                                    <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-full px-8">
                                        View Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer Links */}
            <div className="border-t border-gray-800 py-12">
                <div className="container px-4 md:px-6 mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                                <Ghost className="h-4 w-4 text-black-900" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">DecoyVerse</span>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                            <Link to="#" className="hover:text-white transition-colors">Company</Link>
                            <Link to="#" className="hover:text-white transition-colors">Whitepaper</Link>
                            <Link to="#" className="hover:text-white transition-colors">Features</Link>
                            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
                            <Link to="#" className="hover:text-white transition-colors">FAQ</Link>
                        </div>

                        {/* Social */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="h-10 w-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-700 transition-colors">
                                <Github className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-700 transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-700 transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                        <p className="text-sm text-gray-600">
                            © 2025 DecoyVerse Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
