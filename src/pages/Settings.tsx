import { useState } from "react"
import { Palette, Check, Bell } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/common/Card"
import { Input } from "../components/common/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/Tabs"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { useTheme, ThemeMode } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { authApi } from "../api"

const themes: { id: ThemeMode; name: string; colors: string[]; description: string }[] = [
    { id: 'gold', name: 'Cyan', colors: ['#06B6D4', '#0891B2', '#0E7490'], description: 'Modern cyan accent' },
    { id: 'orange', name: 'Orange', colors: ['#F97316', '#EA580C', '#C2410C'], description: 'Warm orange accent' },
    { id: 'light', name: 'Light', colors: ['#FAFAFA', '#E5E5E5', '#3B82F6'], description: 'Light mode' },
]

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();

    // Form state with user data
    const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '')
    const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '')
    const [email, setEmail] = useState(user?.email || '')
    const [saving, setSaving] = useState(false)

    // Notification state
    const [slackWebhook, setSlackWebhook] = useState(user?.notifications?.slackWebhook || '')
    const [emailAlertTo, setEmailAlertTo] = useState(user?.notifications?.emailAlertTo || '')
    const [whatsappNumber, setWhatsappNumber] = useState(user?.notifications?.whatsappNumber || '')

    // Get initials for avatar
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
                // Update local auth context
                // You may need to expose an `updateUser` method string in AuthContext
                // assuming the backend returns the updated user object.
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

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div>
                <h1 className="text-3xl font-bold text-themed-primary font-heading">Settings</h1>
                <p className="text-themed-muted">Manage your account and profile preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Alert Channels</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

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
                                <Input
                                    label="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="rounded-xl"
                                />
                                <Input
                                    label="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <Input
                                label="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="rounded-xl"
                            />
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
                                <Input
                                    label="Slack Webhook URL"
                                    placeholder="https://hooks.slack.com/services/..."
                                    value={slackWebhook}
                                    onChange={(e) => setSlackWebhook(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-themed-primary border-b border-white/10 pb-2 pt-2">Email Integration</h3>
                                <p className="text-sm text-themed-muted">Receive alerts at a specific email address using the app's internal email credentials.</p>
                                <Input
                                    label="Send Alerts To"
                                    placeholder="security-team@yourcompany.com"
                                    value={emailAlertTo}
                                    onChange={(e) => setEmailAlertTo(e.target.value)}
                                    className="rounded-xl"
                                    helpText="The email address that should receive the alerts."
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-themed-primary border-b border-white/10 pb-2 pt-2">WhatsApp Integration</h3>
                                <p className="text-sm text-themed-muted">Receive critical alerts on WhatsApp. (Note: standard integration requires a simple webhook or Twilio setup on the backend)</p>
                                <Input
                                    label="Target WhatsApp Number"
                                    placeholder="+1234567890"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    className="rounded-xl"
                                />
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

                                        {/* Color Preview */}
                                        <div className="flex gap-1 mb-3">
                                            {t.colors.map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="h-8 w-8 rounded-lg"
                                                    style={{ backgroundColor: color }}
                                                />
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
            </Tabs>
        </div>
    )
}
