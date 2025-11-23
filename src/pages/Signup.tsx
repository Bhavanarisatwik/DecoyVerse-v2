import { Link, useNavigate } from "react-router-dom"
import { Ghost, Lock, Mail, User, Building } from "lucide-react"
import { Button } from "../components/common/Button"
import { Input } from "../components/common/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/common/Card"
import { useState } from "react"

export default function Signup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock signup delay -> redirect to subscription
        setTimeout(() => {
            setIsLoading(false);
            navigate('/onboarding/subscription');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black-900 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold-500/10 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-500/10 blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
                            <Ghost className="h-6 w-6 text-gold-500" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">DECOYVERSE</span>
                    </Link>
                </div>

                <Card className="border-gray-700 bg-black-800/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                        <CardDescription className="text-center">
                            Start your journey with DecoyVerse
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignup}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    icon={<User className="h-4 w-4" />}
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                            <Input
                                label="Email"
                                type="email"
                                placeholder="name@example.com"
                                icon={<Mail className="h-4 w-4" />}
                                required
                            />
                            <Input
                                label="Organization"
                                placeholder="Acme Corp"
                                icon={<Building className="h-4 w-4" />}
                            />
                            <Input
                                label="Password"
                                type="password"
                                icon={<Lock className="h-4 w-4" />}
                                required
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full bg-gold-500 hover:bg-gold-600 text-black-900 font-bold" isLoading={isLoading}>
                                Create Account
                            </Button>
                            <div className="text-sm text-center text-gray-400">
                                Already have an account?{" "}
                                <Link to="/auth/login" className="text-gold-500 hover:underline font-medium">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
