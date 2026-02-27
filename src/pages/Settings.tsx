import { useState } from "react"
import { Palette, Check, Bell, Send, CheckCircle2, Loader2, XCircle, Brain, Eye, EyeOff } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/common/Card"
import { Input } from "../components/common/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/Tabs"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { useTheme, ThemeMode } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { authApi } from "../api"
import { cn } from "../utils/cn"

const themes: { id: ThemeMode; name: string; colors: string[]; description: string }[] = [
    { id: 'gold', name: 'Cyan', colors: ['#06B6D4', '#0891B2', '#0E7490'], description: 'Modern cyan accent' },
    { id: 'orange', name: 'Orange', colors: ['#F97316', '#EA580C', '#C2410C'], description: 'Warm orange accent' },
    { id: 'light', name: 'Light', colors: ['#FAFAFA', '#E5E5E5', '#3B82F6'], description: 'Light mode' },
]

const LLM_PROVIDERS = [
    { value: 'openai',     label: 'OpenAI',         placeholder: 'gpt-4o, gpt-4-turbo, gpt-3.5-turbo' },
    { value: 'openrouter', label: 'OpenRouter',      placeholder: 'openai/gpt-4o, anthropic/claude-3-5-sonnet' },
    { value: 'gemini',     label: 'Google Gemini',   placeholder: 'gemini-1.5-pro, gemini-1.5-flash' },
] as const

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { user, updateUser } = useAuth();

    // Profile state
    const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '')
    const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '')
    const [email, setEmail] = useState(user?.email || '')
    const [saving, setSaving] = useState(false)

    // Notification state
    const [slackWebhook, setSlackWebhook] = useState(user?.notifications?.slackWebhook || '')
    const [emailAlertTo, setEmailAlertTo] = useState(user?.notifications?.emailAlertTo || '')
    const [whatsappNumber, setWhatsappNumber] = useState(user?.notifications?.whatsappNumber || '')

    // Test alert email state
    const [testEmailState, setTestEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [testEmailMsg, setTestEmailMsg] = useState('')

    // AI Settings state
    const [aiProvider, setAiProvider] = useState(user?.aiSettings?.provider || '')
    const [aiModel, setAiModel] = useState(user?.aiSettings?.model || '')
    const [aiApiKey, setAiApiKey] = useState(user?.aiSettings?.apiKey || '')
    const [showApiKey, setShowApiKey] = useState(false)
    const [savingAI, setSavingAI] = useState(false)

    const handleTestAlertEmail = async () => {
        setTestEmailState('sending')
        setTestEmailMsg('')
        try {
            const res = await authApi.sendTestAlertEmail()
            if (res.success) {
                setTestEmailState('sent')
                setTestEmailMsg(res.message || 'Test alert sent! Check your inbox.')
            } else {
                setTestEmailState('error')
                setTestEmailMsg(res.message || 'Failed to send test alert.')
            }
        } catch (err: any) {
            setTestEmailState('error')
            setTestEmailMsg(err?.response?.data?.message || 'Failed to send test alert. Check SMTP settings.')
        }
        setTimeout(() => { setTestEmailState('idle'); setTestEmailMsg('') }, 6000)
    }

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true)
        try {
            const response = await authApi.updateProfile({
                id: user.id,
                name: `${firstName} ${lastName}`.trim() || undefined,
                email: email || undefined,
                notifications: {
                    slackWebhook: slackWebhook || undefined,
                    emailAlertTo: emailAlertTo || undefined,
                    whatsappNumber: whatsappNumber || undefined,
                }
            })
            if (response.success && response.data) {
                const updatedUser = (response.data as any).user || response.data;
                updateUser(updatedUser);
                alert('Profile and notifications updated successfully.')
            } else {
                alert(`Failed to update profile: ${response.message}`)
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
            alert('An error occurred while saving profile settings.')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveAISettings = async () => {
        if (!user) return;
        setSavingAI(true)
        try {
            const response = await authApi.updateProfile({
                id: user.id,
                aiSettings: { provider: aiProvider, model: aiModel, apiKey: aiApiKey }
            })
            if (response.success && response.data) {
                const updatedUser = (response.data as any).user || response.data;
                updateUser(updatedUser);
                alert('AI settings saved successfully.')
            } else {
                alert('Failed to save AI settings.')
            }
        } catch {
            alert('An error occurred while saving AI settings.')
        } finally {
            setSavingAI(false)
        }
    }

    const currentProviderMeta = LLM_PROVIDERS.find(p => p.value === aiProvider)

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div>
                <h1 className="text-3xl font-bold text-themed-primary font-heading">Settings</h1>
                <p className="text-themed-muted">Manage your account and profile preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Alert Channels</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="ai">AI Settings</TabsTrigger>
                </TabsList>

                {/* ── Profile Tab ─────────────────────────────────────────── */}
                <TabsContent value="profile">
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardHeader>
                            <CardTitle className="text-themed-primary">Profile Information</CardTitle>
                            <CardDescription>Update your personal details and password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-themed-primary font-medium">{user?.name || 'User'}</p>
                                    <p className="text-sm text-themed-muted">{user?.email || ''}</p>
                                    <Button variant="outline" size="sm" className="mt-2 border-white/10 rounded-lg hover:bg-white/10">Change Avatar</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl" />
                                <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl" />
                            </div>
                            <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-xl" />
                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-lg font-medium text-themed-primary mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <Input label="Current Password" type="password" className="rounded-xl" />
                                    <Input label="New Password" type="password" className="rounded-xl" />
                                    <Input label="Confirm New Password" type="password" className="rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end bg-black/40 border-t border-white/10 p-4">
                            <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ── Alert Channels Tab ──────────────────────────────────── */}
                <TabsContent value="notifications">
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardHeader>
                            <CardTitle className="text-themed-primary flex items-center gap-2">
                                <Bell className="h-5 w-5 text-accent" />
                                Alert Notifications
                            </CardTitle>
                            <CardDescription>Configure external channels to receive real-time threat alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-themed-primary border-b border-white/10 pb-2">Slack Integration</h3>
                                <p className="text-sm text-themed-muted">Receive alerts directly in a Slack channel via an Incoming Webhook.</p>
                                <Input label="Slack Webhook URL" placeholder="https://hooks.slack.com/services/..." value={slackWebhook} onChange={(e) => setSlackWebhook(e.target.value)} className="rounded-xl" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-themed-primary border-b border-white/10 pb-2 pt-2">Email Integration</h3>
                                <p className="text-sm text-themed-muted">Receive alerts at a specific email address using the app's internal email credentials.</p>
                                <Input
                                    label="Send Alerts To"
                                    placeholder="security-team@yourcompany.com"
                                    value={emailAlertTo}
                                    onChange={(e) => { setEmailAlertTo(e.target.value); setTestEmailState('idle'); setTestEmailMsg('') }}
                                    className="rounded-xl"
                                    helpText="The email address that should receive the alerts."
                                />
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        onClick={handleTestAlertEmail}
                                        disabled={!emailAlertTo.trim() || testEmailState === 'sending'}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-accent/40 text-accent hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {testEmailState === 'sending'
                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                                            : <><Send className="h-4 w-4" /> Send Test Alert</>}
                                    </button>
                                    {testEmailState === 'sent' && (
                                        <span className="inline-flex items-center gap-1.5 text-sm text-status-success">
                                            <CheckCircle2 className="h-4 w-4" />{testEmailMsg}
                                        </span>
                                    )}
                                    {testEmailState === 'error' && (
                                        <span className="inline-flex items-center gap-1.5 text-sm text-status-danger">
                                            <XCircle className="h-4 w-4" />{testEmailMsg}
                                        </span>
                                    )}
                                </div>
                                {!emailAlertTo.trim() && (
                                    <p className="text-xs text-themed-muted">Save an email address above to enable the test button.</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-themed-primary border-b border-white/10 pb-2 pt-2">WhatsApp Integration</h3>
                                <p className="text-sm text-themed-muted">Receive critical alerts on WhatsApp.</p>
                                <Input label="Target WhatsApp Number" placeholder="+1234567890" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="rounded-xl" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40 border-t border-white/10 p-4">
                            <p className="text-xs text-status-warning max-w-md text-center md:text-left">
                                These credentials will be securely stored and used by the backend notification service.
                            </p>
                            <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl shrink-0">
                                {saving ? "Saving..." : "Save Notification Settings"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ── Appearance Tab ──────────────────────────────────────── */}
                <TabsContent value="appearance">
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardHeader>
                            <CardTitle className="text-themed-primary flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Theme
                            </CardTitle>
                            <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${theme === t.id
                                            ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {theme === t.id && (
                                            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                                                <Check className="h-3 w-3 text-on-accent" />
                                            </div>
                                        )}
                                        <div className="flex gap-1 mb-3">
                                            {t.colors.map((color, i) => (
                                                <div key={i} className="h-8 w-8 rounded-lg" style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                        <h4 className="font-medium text-themed-primary mb-1">{t.name}</h4>
                                        <p className="text-xs text-themed-muted">{t.description}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── AI Settings Tab ─────────────────────────────────────── */}
                <TabsContent value="ai">
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardHeader>
                            <CardTitle className="text-themed-primary flex items-center gap-2">
                                <Brain className="h-5 w-5 text-accent" />
                                AI Advisor Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure your LLM provider for the AI Advisor chat on the AI Insights page.
                                Your API key is sent directly from your browser to the LLM provider — it never passes through DecoyVerse servers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Provider selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-themed-muted">LLM Provider</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {LLM_PROVIDERS.map(p => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => { setAiProvider(p.value); setAiModel(''); }}
                                            className={cn(
                                                "p-3 rounded-xl border text-sm font-medium transition-all",
                                                aiProvider === p.value
                                                    ? "border-accent bg-accent/10 text-accent"
                                                    : "border-white/10 bg-white/5 text-themed-muted hover:border-white/20 hover:bg-white/10"
                                            )}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Model */}
                            <Input
                                label="Model"
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}
                                placeholder={currentProviderMeta?.placeholder || 'Select a provider first'}
                                className="rounded-xl"
                                helpText="The exact model identifier for your chosen provider."
                            />

                            {/* API Key */}
                            <div className="relative">
                                <Input
                                    label="API Key"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={aiApiKey}
                                    onChange={(e) => setAiApiKey(e.target.value)}
                                    placeholder="sk-... or your provider key"
                                    className="rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-8 text-themed-muted hover:text-themed-primary transition-colors"
                                >
                                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            <div className="p-3 bg-status-warning/10 border border-status-warning/30 rounded-xl text-xs text-status-warning leading-relaxed">
                                Your API key is stored in your profile and used only for direct browser-to-LLM API calls on the AI Insights page.
                                It is never processed or logged by DecoyVerse servers.
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end bg-black/40 border-t border-white/10 p-4">
                            <Button onClick={handleSaveAISettings} disabled={savingAI} className="rounded-xl">
                                {savingAI ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : 'Save AI Settings'}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
