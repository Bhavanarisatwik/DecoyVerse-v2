import { Check } from "lucide-react"
import { Button } from "../common/Button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../common/Card"

const plans = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for testing and small labs.",
        features: ["Up to 5 Nodes", "Basic Decoys", "7-day Log Retention", "Community Support"],
        cta: "Start Free",
        popular: false
    },
    {
        name: "Pro",
        price: "$49",
        description: "For growing teams and startups.",
        features: ["Up to 50 Nodes", "Advanced Decoys (RDP, DB)", "30-day Log Retention", "Email Support", "API Access"],
        cta: "Get Started",
        popular: true
    },
    {
        name: "Business",
        price: "$199",
        description: "Scale security across the organization.",
        features: ["Unlimited Nodes", "Custom Decoys", "1-year Log Retention", "Priority Support", "SSO & RBAC", "Dedicated Account Manager"],
        cta: "Contact Sales",
        popular: false
    }
]

export function Pricing() {
    return (
        <section className="py-24 bg-black-900">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Choose the plan that fits your security needs. No hidden fees.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card key={index} className={`relative flex flex-col ${plan.popular ? 'border-gold-500 shadow-lg shadow-gold-500/10 scale-105 z-10 bg-gray-800' : 'border-gray-700 bg-black-800'}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <span className="bg-gold-500 text-black-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-sm text-gray-300">
                                            <Check className="h-4 w-4 text-gold-500 mr-3 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? 'primary' : 'outline'}
                                >
                                    {plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
