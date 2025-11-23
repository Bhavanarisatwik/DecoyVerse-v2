import { Link } from "react-router-dom"
import { Ghost } from "lucide-react"
import { Button } from "../common/Button"

export function LandingNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-700 bg-black-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                        <Ghost className="h-5 w-5 text-gold-500" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">DECOYVERSE</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link to="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>
                    <Link to="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</Link>
                    <Link to="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Docs</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/auth/login">
                        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                            Log in
                        </Button>
                    </Link>
                    <Link to="/auth/signup">
                        <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">
                            Start Free Trial
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
