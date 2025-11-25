import { Check, X, Sparkles } from "lucide-react"
import { Button } from "../common/Button"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const plans = [
    {
        name: "Starter",
        price: "$0",
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
        price: "$49",
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
        price: "$0",
        period: "/custom",
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

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-black-900 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-gold-500/5 blur-[150px]"></div>
            <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-gold-600/5 blur-[120px]"></div>
            
            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-heading">
                        Transparent pricing with features
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Choose the plan that works best for your team. All plans include core deception features.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative rounded-3xl border p-6 flex flex-col ${
                                plan.popular 
                                    ? 'border-gold-500/50 bg-gradient-to-b from-gold-500/10 to-black-900' 
                                    : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black-900'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-1 bg-gold-500 text-black-900 text-xs font-semibold px-3 py-1 rounded-full">
                                        <Sparkles className="h-3 w-3" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-gray-500">{plan.period}</span>
                            </div>

                            <Link to="/auth/signup" className="mb-6">
                                <Button
                                    className={`w-full rounded-full ${
                                        plan.popular 
                                            ? 'bg-gold-500 hover:bg-gold-400 text-black-900' 
                                            : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                    variant={plan.variant}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>

                            <div className="space-y-3 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {feature.included ? (
                                            <div className="h-5 w-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-3 w-3 text-gold-500" />
                                            </div>
                                        ) : (
                                            <div className="h-5 w-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                <X className="h-3 w-3 text-gray-600" />
                                            </div>
                                        )}
                                        <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-20 text-center"
                >
                    <div className="inline-flex flex-col items-center gap-4 rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/50 to-black-900 p-8 max-w-2xl">
                        <h3 className="text-2xl font-bold text-white">Need a custom solution?</h3>
                        <p className="text-gray-500">
                            Get in touch with our team to discuss enterprise features, custom integrations, and volume pricing.
                        </p>
                        <Button variant="outline" className="rounded-full border-gray-700 hover:border-gold-500 hover:text-gold-500">
                            Talk to Sales
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
