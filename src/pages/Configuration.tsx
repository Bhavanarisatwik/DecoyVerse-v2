import { Key, CreditCard, Bell } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/Tabs"
import { Badge } from "../components/common/Badge"
import { Breadcrumb } from "../components/common/Breadcrumb"

export default function Configuration() {
    return (
        <div className="space-y-6">
            <Breadcrumb />
            
            <div>
                <h1 className="text-3xl font-bold text-themed-primary font-heading">Configuration</h1>
                <p className="text-themed-muted">Manage your API keys, billing, and notification preferences.</p>
            </div>

            <Tabs defaultValue="api" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="api">API Keys</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="api">
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardHeader>
                            <CardTitle className="text-themed-primary">API Management</CardTitle>
                            <CardDescription>Manage your API keys for external integrations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-themed-primary">Default API Key</h4>
                                        <Badge variant="success">Active</Badge>
                                    </div>
                                    <p className="text-sm text-themed-muted font-mono mt-1">dcv_live_8f92k3920dk20dk29d02kd92kd92</p>
                                    <p className="text-xs text-themed-dimmed mt-2">Created on Nov 20, 2024</p>
                                </div>
                                <Button variant="outline" size="sm" className="border-white/10 rounded-lg hover:bg-white/10">Revoke</Button>
                            </div>
                            <Button variant="outline" className="w-full border-dashed border-white/10 hover:border-accent hover:text-accent rounded-xl">
                                <Key className="mr-2 h-4 w-4" />
                                Generate New Key
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardHeader>
                            <CardTitle className="text-themed-primary">Subscription & Billing</CardTitle>
                            <CardDescription>Manage your plan and payment methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-accent">Pro Plan</h4>
                                    <Badge className="bg-accent text-on-accent">Current</Badge>
                                </div>
                                <p className="text-sm text-themed-secondary mb-4">
                                    $49/month • Next billing date: Dec 20, 2024
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-lg">Upgrade Plan</Button>
                                    <Button size="sm" variant="ghost" className="text-status-danger hover:text-red-300 hover:bg-red-500/10 rounded-lg">Cancel Subscription</Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-themed-primary mb-4 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Methods
                                </h4>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-12 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold text-themed-secondary">VISA</div>
                                        <div>
                                            <p className="text-sm font-medium text-themed-primary">•••• 4242</p>
                                            <p className="text-xs text-themed-dimmed">Expires 12/25</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-lg">Edit</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-black">
                        <CardHeader>
                            <CardTitle className="text-themed-primary">Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be alerted.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { title: "Critical Alerts", desc: "Immediate notification for high-severity incidents", email: true, push: true },
                                { title: "Weekly Reports", desc: "Summary of weekly security activity", email: true, push: false },
                                { title: "System Updates", desc: "Maintenance and feature updates", email: false, push: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <h4 className="font-medium text-themed-primary">{item.title}</h4>
                                        <p className="text-sm text-themed-muted">{item.desc}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-themed-secondary cursor-pointer">
                                            <input type="checkbox" defaultChecked={item.email} className="rounded border-white/20 bg-transparent text-accent focus:ring-accent" />
                                            Email
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-themed-secondary cursor-pointer">
                                            <input type="checkbox" defaultChecked={item.push} className="rounded border-white/20 bg-transparent text-accent focus:ring-accent" />
                                            Push
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
