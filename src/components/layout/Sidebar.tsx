import { Link, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    Server,
    Ghost,
    FileKey,
    ScrollText,
    Siren,
    BrainCircuit,
    Activity,
    Settings,
    LogOut
} from "lucide-react"
import { cn } from "../../utils/cn"

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Server, label: "Nodes", href: "/nodes" },
    { icon: Ghost, label: "Decoys", href: "/decoys" },
    { icon: FileKey, label: "Honeytokens", href: "/honeytokens" },
    { icon: ScrollText, label: "Logs", href: "/logs" },
    { icon: Siren, label: "Alerts", href: "/alerts" },
    { icon: BrainCircuit, label: "AI Insights", href: "/ai-insights" },
    { icon: Activity, label: "Grafana", href: "/grafana" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-screen w-64 flex-col border-r border-gray-700 bg-black-900 text-gray-200">
            <div className="flex h-16 items-center px-6 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                        <Ghost className="h-5 w-5 text-gold-500" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">DECOYVERSE</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-gold-500/10 text-gold-500 border-r-2 border-gold-500"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-gold-500" : "text-gray-500")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t border-gray-700 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-status-danger transition-colors">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
