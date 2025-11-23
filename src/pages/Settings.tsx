import { CreditCard, Key } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/common/Card"
import { Input } from "../components/common/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/Tabs"
import { Badge } from "../components/common/Badge"

export default function Settings() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white font-heading">Settings</h1>
                <p className="text-gray-400">Manage your account, billing, and API preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="api">API Keys</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-20 w-20 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 text-2xl font-bold">
                                    JD
                                </div>
                                <div>
                                    <Button variant="outline" size="sm" className="border-gray-700">Change Avatar</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="First Name" defaultValue="John" />
                                <Input label="Last Name" defaultValue="Doe" />
                            </div>
                            <Input label="Email Address" defaultValue="john.doe@example.com" type="email" />
                            <div className="pt-4 border-t border-gray-700">
                                <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <Input label="Current Password" type="password" />
                                    <Input label="New Password" type="password" />
                                    <Input label="Confirm New Password" type="password" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="api">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>API Management</CardTitle>
                            <CardDescription>Manage your API keys for external integrations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-black-800 border border-gray-700">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-white">Default API Key</h4>
                                        <Badge variant="success">Active</Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono mt-1">dcv_live_8f92k3920dk20dk29d02kd92kd92</p>
                                    <p className="text-xs text-gray-500 mt-2">Created on Nov 20, 2024</p>
                                </div>
                                <Button variant="outline" size="sm" className="border-gray-700">Revoke</Button>
                            </div>
                            <Button variant="outline" className="w-full border-dashed border-gray-700 hover:border-gold-500 hover:text-gold-500">
                                <Key className="mr-2 h-4 w-4" />
                                Generate New Key
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Subscription & Billing</CardTitle>
                            <CardDescription>Manage your plan and payment methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-lg bg-gold-500/10 border border-gold-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gold-500">Pro Plan</h4>
                                    <Badge className="bg-gold-500 text-black-900">Current</Badge>
                                </div>
                                <p className="text-sm text-gray-300 mb-4">
                                    $49/month • Next billing date: Dec 20, 2024
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-black-900 font-bold">Upgrade Plan</Button>
                                    <Button size="sm" variant="ghost" className="text-status-danger hover:text-red-300 hover:bg-red-500/10">Cancel Subscription</Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Methods
                                </h4>
                                <div className="flex items-center justify-between p-3 rounded bg-black-900 border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs font-bold">VISA</div>
                                        <div>
                                            <p className="text-sm font-medium text-white">•••• 4242</p>
                                            <p className="text-xs text-gray-500">Expires 12/25</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be alerted.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { title: "Critical Alerts", desc: "Immediate notification for high-severity incidents", email: true, push: true },
                                { title: "Weekly Reports", desc: "Summary of weekly security activity", email: true, push: false },
                                { title: "System Updates", desc: "Maintenance and feature updates", email: false, push: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-black-800 border border-gray-700">
                                    <div>
                                        <h4 className="font-medium text-white">{item.title}</h4>
                                        <p className="text-sm text-gray-400">{item.desc}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input type="checkbox" defaultChecked={item.email} className="rounded border-gray-700 bg-black-900 text-gold-500 focus:ring-gold-500" />
                                            Email
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input type="checkbox" defaultChecked={item.push} className="rounded border-gray-700 bg-black-900 text-gold-500 focus:ring-gold-500" />
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
