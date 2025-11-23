import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, CreditCard } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/common/Card"
import { Badge } from "../components/common/Badge"

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: "$0",
        interval: "forever",
        description: "Perfect for testing and small labs.",
        features: ["Up to 5 Nodes", "Basic Decoys", "7-day Log Retention", "Community Support"],
        popular: false
    },
    {
        id: "pro",
        name: "Pro",
        price: "$49",
        interval: "per month",
        description: "For growing teams and startups.",
        features: ["Up to 50 Nodes", "Advanced Decoys (RDP, DB)", "30-day Log Retention", "Email Support", "API Access"],
        popular: true
    },
    {
        id: "business",
        name: "Business",
        price: "$199",
        interval: "per month",
        description: "Scale security across the organization.",
        features: ["Unlimited Nodes", "Custom Decoys", "1-year Log Retention", "Priority Support", "SSO & RBAC"],
        popular: false
    }
]

export default function Subscription() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = () => {
        if (!selectedPlan) return;
        setIsLoading(true);
        // Mock payment processing
        setTimeout(() => {
            setIsLoading(false);
            navigate('/onboarding/agent');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black-900 py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-white font-heading">Choose your plan</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Select the plan that best fits your needs. You can upgrade or downgrade at any time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative cursor-pointer transition-all duration-200 ${selectedPlan === plan.id ? 'ring-2 ring-gold-500 bg-gray-800' : 'bg-gray-800/50 hover:bg-gray-800'}`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                                    <Badge variant="default" className="bg-gold-500 text-black-900 hover:bg-gold-600">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-sm text-slate-400">/{plan.interval}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-sm text-slate-300">
                                            <Check className="h-4 w-4 text-gold-500 mr-3 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <div className={`w-full h-6 flex items-center justify-center rounded-full border ${selectedPlan === plan.id ? 'border-gold-500 bg-gold-500/20' : 'border-gray-700'}`}>
                                    {selectedPlan === plan.id && <div className="h-3 w-3 rounded-full bg-gold-500" />}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end pt-8 border-t border-slate-800">
                    <Button
                        size="lg"
                        disabled={!selectedPlan}
                        onClick={handleSubscribe}
                        isLoading={isLoading}
                        className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold"
                    >
                        {selectedPlan === 'starter' ? 'Continue for Free' : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Proceed to Payment
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
