import { ExternalLink, RefreshCw, BarChart3 } from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card"

export default function Grafana() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-status-warning" />
                        Grafana Metrics
                    </h1>
                    <p className="text-gray-400">Deep dive into system performance and attack metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-700">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button className="bg-status-warning hover:bg-yellow-600 text-black-900 font-bold">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Grafana
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700 h-[300px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Network Traffic Analysis</CardTitle>
                        <CardDescription>Inbound vs Outbound traffic on decoy interfaces</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center bg-black-800 m-6 rounded-lg border border-gray-700 border-dashed">
                        <div className="text-center text-gray-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Grafana Dashboard Embed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700 h-[300px] flex flex-col">
                    <CardHeader>
                        <CardTitle>CPU & Memory Usage</CardTitle>
                        <CardDescription>Resource consumption by agent nodes</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center bg-black-800 m-6 rounded-lg border border-gray-700 border-dashed">
                        <div className="text-center text-gray-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Grafana Dashboard Embed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700 h-[300px] flex flex-col md:col-span-2">
                    <CardHeader>
                        <CardTitle>Attack Geo-Distribution</CardTitle>
                        <CardDescription>Global map of incoming threat sources</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center bg-black-800 m-6 rounded-lg border border-gray-700 border-dashed">
                        <div className="text-center text-gray-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Grafana World Map Embed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
