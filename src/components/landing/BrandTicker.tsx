import { Shield, Hexagon, Triangle, Circle, Square, Cloud, Cpu, Command, Anchor, Target } from "lucide-react"

const BRANDS = [
    { name: "Apex Security", icon: Shield },
    { name: "HexaGuard", icon: Hexagon },
    { name: "Trident Cyber", icon: Triangle },
    { name: "SphereNet", icon: Circle },
    { name: "BlockSec", icon: Square },
    { name: "CloudArmor", icon: Cloud },
    { name: "NeuroCore", icon: Cpu },
    { name: "Nexus", icon: Command },
    { name: "DeepAnchor", icon: Anchor },
    { name: "ZeroDay", icon: Target },
]

export function BrandTicker() {
    return (
        <section className="py-12 relative overflow-hidden border-b border-white/5">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
                <p className="text-xs font-mono tracking-widest text-themed-muted uppercase">
                    Trusted by elite security operations teams worldwide
                </p>
            </div>

            {/* Gradient Masks for fading edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-themed-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-themed-primary to-transparent z-10 pointer-events-none" />

            <div className="flex w-[200%] animate-marquee">
                {/* 
                  We duplicate the brand array twice so it seamlessly loops.
                  Since width is 200%, translating it by -50% shifts it exactly one full array length.
                */}
                {[...BRANDS, ...BRANDS].map((brand, i) => {
                    const Icon = brand.icon
                    return (
                        <div 
                            key={i} 
                            className="flex-1 flex items-center justify-center gap-3 text-themed-muted hover:text-themed-secondary transition-colors duration-300 opacity-60 hover:opacity-100 cursor-default"
                        >
                            <Icon size={24} strokeWidth={1.5} />
                            <span className="font-semibold text-lg tracking-tight font-sans">
                                {brand.name}
                            </span>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
