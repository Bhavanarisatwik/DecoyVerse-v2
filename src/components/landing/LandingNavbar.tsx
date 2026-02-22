import { Link } from "react-router-dom"
import { Ghost, ChevronDown } from "lucide-react"
import { Button } from "../common/Button"
import { ThemeSwitcher } from "../common/ThemeSwitcher"

export function LandingNavbar() {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
                <div className="flex items-center justify-between rounded-full border border-themed bg-themed-primary/60 backdrop-blur-xl px-6 py-3">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                            <Ghost className="h-4 w-4 text-themed-primary" />
                        </div>
                        <span className="text-lg font-bold text-themed-primary tracking-tight">DecoyVerse</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <a href="#hero" onClick={(e) => handleScroll(e, 'hero')} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-themed-muted hover:text-themed-primary transition-colors rounded-full hover:bg-themed-elevated/50">
                            Overview
                            <ChevronDown className="h-3 w-3" />
                        </a>
                        <a href="#use-cases" onClick={(e) => handleScroll(e, 'use-cases')} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-themed-muted hover:text-themed-primary transition-colors rounded-full hover:bg-themed-elevated/50">
                            Products
                            <ChevronDown className="h-3 w-3" />
                        </a>
                        <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="px-4 py-2 text-sm font-medium text-themed-muted hover:text-themed-primary transition-colors rounded-full hover:bg-themed-elevated/50">
                            Features
                        </a>
                        <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="px-4 py-2 text-sm font-medium text-themed-muted hover:text-themed-primary transition-colors rounded-full hover:bg-themed-elevated/50">
                            Pricing
                        </a>
                        <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="px-4 py-2 text-sm font-medium text-themed-muted hover:text-themed-primary transition-colors rounded-full hover:bg-themed-elevated/50">
                            FAQ
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <Link to="/auth/login">
                            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-themed-muted hover:text-themed-primary">
                                Login
                            </Button>
                        </Link>
                        <Link to="/auth/signup">
                            <Button size="sm" className="bg-gradient-to-r from-accent-400 via-accent to-accent-600 hover:from-accent-400 hover:via-accent-400 hover:to-accent text-on-accent font-semibold rounded-full px-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-accent-sm">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
