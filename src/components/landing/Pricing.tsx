import { Check, X, Sparkles } from "lucide-react"
import { Button } from "../common/Button"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Link } from "react-router-dom"
import React from "react"

const plans = [
    {
        name: "Starter",
        price: "₹0",
        period: "/month",
        description: "For individual security researchers",
        features: [
            { text: "Up to 5 Nodes", included: true },
            { text: "Basic Decoys (SSH, HTTP)", included: true },
            { text: "7-day Log Retention", included: true },
            { text: "Community Support", included: true },
            { text: "Email Alerts", included: true },
            { text: "API Access", included: false },
            { text: "Custom Decoys", included: false },
        ],
        cta: "Start for Free",
        popular: false,
        variant: "outline" as const
    },
    {
        name: "Pro",
        price: "₹299",
        period: "/month",
        description: "For growing security teams",
        features: [
            { text: "Up to 50 Nodes", included: true },
            { text: "All Decoy Types", included: true },
            { text: "30-day Log Retention", included: true },
            { text: "Priority Email Support", included: true },
            { text: "Slack + Webhook Alerts", included: true },
            { text: "Full API Access", included: true },
            { text: "Threat Intelligence Reports", included: true },
        ],
        cta: "Get Started",
        popular: true,
        variant: "primary" as const
    },
    {
        name: "Enterprise",
        price: "₹999",
        period: "/month",
        description: "For large organizations",
        features: [
            { text: "Unlimited Nodes", included: true },
            { text: "Custom Decoy Development", included: true },
            { text: "1-year Log Retention", included: true },
            { text: "Dedicated Support", included: true },
            { text: "SSO & RBAC", included: true },
            { text: "On-premise Deployment", included: true },
            { text: "SLA Guarantee", included: true },
        ],
        cta: "Contact Sales",
        popular: false,
        variant: "outline" as const
    }
]

// Custom Hook for 3D Tilt Effect
function useTiltEffect() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-themed-primary relative overflow-hidden transition-colors duration-300">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[150px]"></div>
            <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[120px]"></div>

            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-themed-primary mb-4 font-heading">
                        Transparent pricing with features
                    </h2>
                    <p className="text-themed-muted max-w-2xl mx-auto">
                        Choose the plan that works best for your team. All plans include core deception features.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto perspective-1000">
                    {plans.map((plan, index) => {
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTiltEffect();

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                className={`relative rounded-3xl p-[1px] flex flex-col transition-all duration-500 h-full ${plan.popular ? 'z-10 scale-105 shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)]' : ''}`}
                            >
                                {/* Animated Background Border Container for Popular Plan */}
                                {plan.popular ? (
                                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-accent/50 via-accent/20 to-accent-600/50 rounded-3xl animate-[spin_4s_linear_infinite]" style={{ maskImage: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1px" }}></div>
                                ) : (
                                    <div className="absolute inset-0 z-0 bg-gray-800 rounded-3xl"></div>
                                )}

                                {/* Inner Card content */}
                                <div className={`relative z-10 rounded-3xl h-full p-6 flex flex-col group/card ${plan.popular ? 'landing-card lp-feature-card' : 'landing-card lp-feature-card'}`}>
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2" style={{ transform: "translateZ(30px) translateX(-50%)" }}>
                                            <div className="flex items-center gap-1 bg-accent text-on-accent text-xs font-semibold px-3 py-1 rounded-full shadow-[0_0_15px_var(--accent-500)]">
                                                <Sparkles className="h-3 w-3" />
                                                Most Popular
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-6 transform-gpu" style={{ transform: "translateZ(20px)" }}>
                                        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                        <p className="text-gray-400 text-sm">{plan.description}</p>
                                    </div>

                                    <div className="mb-8 transform-gpu" style={{ transform: "translateZ(40px)" }}>
                                        <span className="text-5xl font-extrabold text-themed-primary">{plan.price}</span>
                                        <span className="text-themed-muted font-mono text-sm ml-1">{plan.period}</span>
                                    </div>

                                    <Link className="mb-8 transform-gpu" style={{ transform: "translateZ(25px)" }} to="/auth/signup">
                                        <Button
                                            className={`w-full h-12 rounded-xl transition-all duration-300 font-bold ${plan.popular
                                                ? 'bg-gradient-to-r from-accent-400 to-accent-600 text-white hover:shadow-[0_0_20px_var(--accent-500)] border-none lp-btn-primary'
                                                : 'bg-gray-900 border border-gray-700 text-white hover:border-gray-500 hover:bg-gray-800 lp-pricing-btn-secondary'
                                                }`}
                                            variant={plan.variant}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>

                                    <div className="space-y-4 flex-1 transform-gpu" style={{ transform: "translateZ(15px)" }}>
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                {feature.included ? (
                                                    <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-3.5 w-3.5 text-accent" />
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 lp-pricing-feature-no-bg">
                                                        <X className="h-3.5 w-3.5 text-gray-600 lp-pricing-feature-no-text" />
                                                    </div>
                                                )}
                                                <span className={`text-sm ${feature.included ? 'text-gray-300 lp-pricing-feature-yes' : 'text-gray-600 lp-pricing-feature-no-text'}`}>
                                                    {feature.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-20 text-center relative z-20"
                >
                    <div className="inline-flex flex-col items-center gap-4 rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black p-8 max-w-2xl transition-all duration-300 hover:border-gray-700">
                        <h3 className="text-2xl font-bold text-themed-primary">Need a custom solution?</h3>
                        <p className="text-themed-muted">
                            Get in touch with our team to discuss enterprise features, custom integrations, and volume pricing.
                        </p>
                        <Button variant="outline" className="rounded-full border-gray-700 hover:border-gray-600 hover:text-accent hover:bg-gray-800/50 transition-all duration-300">
                            Talk to Sales
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
