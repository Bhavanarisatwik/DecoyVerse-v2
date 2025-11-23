import { LandingNavbar } from "../components/landing/LandingNavbar"
import { Hero } from "../components/landing/Hero"
import { Features } from "../components/landing/Features"
import { Pricing } from "../components/landing/Pricing"
import { Footer } from "../components/landing/Footer"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black-900 text-gray-200 font-sans selection:bg-gold-500/30">
            <LandingNavbar />
            <main>
                <Hero />
                <Features />
                <Pricing />
            </main>
            <Footer />
        </div>
    )
}
