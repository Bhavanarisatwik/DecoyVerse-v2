import { Link, useNavigate } from "react-router-dom"
import { Ghost, Lock, Mail, User, AlertCircle, CheckCircle, Zap, Eye, Database, ChevronRight } from "lucide-react"
import { Button } from "../components/common/Button"
import { Input } from "../components/common/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/common/Card"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"

export default function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError(null);
    };

    const passwordChecks = {
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
    };

    const isPasswordValid = passwordChecks.minLength &&
        passwordChecks.hasUppercase &&
        passwordChecks.hasLowercase &&
        passwordChecks.hasNumber;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isPasswordValid) {
            setError('Please ensure your password meets all requirements');
            return;
        }

        if (!passwordChecks.passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        const result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password
        });

        setIsLoading(false);

        if (result.success) {
            toast.success('Account created — welcome to DecoyVerse!')
            navigate('/onboarding/subscription');
        } else {
            setError(result.message);
        }
    };

    const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
        <div className={`flex items-center gap-2 text-xs ${passed ? 'text-green-400' : 'text-gray-500'}`}>
            <CheckCircle className={`h-3 w-3 ${passed ? 'opacity-100' : 'opacity-30'}`} />
            <span>{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-themed-primary">
            {/* Left Panel — Branding */}
            <div className="auth-panel-left hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
                {/* Background glow */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/8 blur-[100px]" />
                </div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <Ghost className="h-6 w-6 text-accent" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight font-heading">DecoyVerse</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-4xl font-bold text-white font-heading leading-tight mb-4">
                            Start your free<br />
                            <span className="text-accent">security journey.</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Join thousands of security teams using DecoyVerse to outsmart attackers with intelligent deception.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: Zap, label: "Deploy in under 5 minutes", desc: "Get your first decoy running instantly" },
                            { icon: Eye, label: "See every attack attempt", desc: "Full visibility into threat actors' moves" },
                            { icon: Database, label: "No data leaves your network", desc: "On-premise mode available for enterprises" },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                                    <Icon className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{label}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                        <p className="text-gray-300 text-sm italic leading-relaxed">
                            "DecoyVerse caught our first attacker within 48 hours of deployment. The setup was seamless and alerts were instant."
                        </p>
                        <p className="text-gray-400 text-xs mt-2">— Security Lead, SaaS Company</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-gray-600 text-sm">© 2025 DecoyVerse Inc. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 relative">
                {/* Mobile background glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[100px]" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile logo */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                                <Ghost className="h-6 w-6 text-accent" />
                            </div>
                            <span className="text-2xl font-bold text-themed-primary tracking-tight font-heading">DECOYVERSE</span>
                        </Link>
                    </div>

                    <Card className="border border-themed bg-themed-card backdrop-blur-xl shadow-2xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center text-themed-primary">Create an account</CardTitle>
                            <CardDescription className="text-center">
                                Start your journey with DecoyVerse
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSignup}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                                <Input
                                    label="Full Name"
                                    name="name"
                                    placeholder="John Doe"
                                    icon={<User className="h-4 w-4" />}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    icon={<Mail className="h-4 w-4" />}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="space-y-2">
                                    <Input
                                        label="Password"
                                        type="password"
                                        name="password"
                                        icon={<Lock className="h-4 w-4" />}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {formData.password && (
                                        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-themed-elevated border border-themed">
                                            <PasswordCheck passed={passwordChecks.minLength} label="8+ characters" />
                                            <PasswordCheck passed={passwordChecks.hasUppercase} label="Uppercase letter" />
                                            <PasswordCheck passed={passwordChecks.hasLowercase} label="Lowercase letter" />
                                            <PasswordCheck passed={passwordChecks.hasNumber} label="Number" />
                                        </div>
                                    )}
                                </div>
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    name="confirmPassword"
                                    icon={<Lock className="h-4 w-4" />}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                {formData.confirmPassword && !passwordChecks.passwordsMatch && (
                                    <p className="text-xs text-red-400">Passwords do not match</p>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    className="btn-primary w-full"
                                    isLoading={isLoading}
                                    disabled={!isPasswordValid || !passwordChecks.passwordsMatch}
                                >
                                    Create Account
                                </Button>
                                <div className="text-sm text-center text-themed-secondary">
                                    Already have an account?{" "}
                                    <Link to="/auth/login" className="text-accent hover:underline font-medium">
                                        Sign in
                                    </Link>
                                </div>
                                <Link to="/" className="flex items-center justify-center gap-1 text-xs text-themed-dimmed hover:text-themed-muted transition-colors">
                                    <ChevronRight className="h-3 w-3 rotate-180" />
                                    Back to home
                                </Link>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}
