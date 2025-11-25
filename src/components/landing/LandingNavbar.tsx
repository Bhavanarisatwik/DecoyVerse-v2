import { Link } from "react-router-dom"
import { Ghost, ChevronDown } from "lucide-react"
import { Button } from "../common/Button"

export function LandingNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
                <div className="flex items-center justify-between rounded-full border border-gray-800 bg-black-900/60 backdrop-blur-xl px-6 py-3">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                            <Ghost className="h-4 w-4 text-black-900" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">DecoyVerse</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50">
                            Overview
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50">
                            Products
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <Link to="#features" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50">
                            Features
                        </Link>
                        <Link to="#pricing" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50">
                            Pricing
                        </Link>
                        <Link to="#" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50">
                            FAQ
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/auth/login">
                            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-gray-400 hover:text-white">
                                Login
                            </Button>
                        </Link>
                        <Link to="/auth/signup">
                            <Button size="sm" className="bg-gold-500 hover:bg-gold-400 text-black-900 font-semibold rounded-full px-5">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
