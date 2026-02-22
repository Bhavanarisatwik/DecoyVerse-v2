import { LandingNavbar } from "../components/landing/LandingNavbar"
import { Hero } from "../components/landing/Hero"
import { ApplicationUse } from "../components/landing/ApplicationUse"
import { Features } from "../components/landing/Features"
import { Pricing } from "../components/landing/Pricing"
import { Footer } from "../components/landing/Footer"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-themed-primary text-themed-secondary font-sans selection:bg-accent/30 antialiased transition-colors duration-300">
            <LandingNavbar />
            <main>
                <Hero />
                <ApplicationUse />
                <Features />
                <Pricing />
            </main>
            <Footer />
        </div>
    )
}
