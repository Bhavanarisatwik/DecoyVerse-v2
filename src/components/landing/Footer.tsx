import { Ghost, Github, Twitter, Linkedin } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
    return (
        <footer className="bg-black-900 border-t border-gray-700 py-12">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                                <Ghost className="h-5 w-5 text-gold-500" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">DECOYVERSE</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Next-generation deception platform for proactive cyber defense.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-gold-500">Features</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">Integrations</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">Pricing</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">Changelog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-gold-500">Documentation</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">API Reference</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">Blog</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">Community</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-gold-500">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-gold-500">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © 2024 DecoyVerse Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-white"><Github className="h-5 w-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Linkedin className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
