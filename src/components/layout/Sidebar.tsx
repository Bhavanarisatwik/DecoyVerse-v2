import { Link, useLocation } from "react-router-dom"
import { useEffect } from "react"
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
    LogOut,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    ChevronDown,
    Cog
} from "lucide-react"
import { cn } from "../../utils/cn"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext"

const mainMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Server, label: "Nodes", href: "/nodes" },
    { icon: Ghost, label: "Decoys", href: "/decoys" },
    { icon: FileKey, label: "Honeytokens", href: "/honeytokens" },
]

const monitorMenu = [
    { icon: ScrollText, label: "Logs", href: "/logs" },
    { icon: Siren, label: "Alerts", href: "/alerts" },
    { icon: BrainCircuit, label: "AI Insights", href: "/ai-insights" },
    { icon: Activity, label: "Grafana", href: "/grafana" },
]

const toolsMenu = [
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Cog, label: "Configuration", href: "/configuration" },
    { icon: HelpCircle, label: "Help center", href: "#" },
]

export function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean; setIsMobileMenuOpen: (val: boolean) => void }) {
    const location = useLocation();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mainExpanded, setMainExpanded] = useState(true);
    const [featuresExpanded, setFeaturesExpanded] = useState(true);
    const [toolsExpanded, setToolsExpanded] = useState(true);

    // Close on mobile navigation
    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [location.pathname]);

    const NavItem = ({ item, isActive }: { item: typeof mainMenu[0], isActive: boolean }) => (
        <Link
            to={item.href}
            className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                    ? "text-themed-primary bg-themed-elevated"
                    : "text-themed-muted hover:text-themed-primary hover:bg-themed-elevated/50"
            )}
            title={collapsed ? item.label : undefined}
        >
            {/* Left accent bar for active state */}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
            )}

            <item.icon className={cn(
                "h-[18px] w-[18px] flex-shrink-0",
                collapsed && "h-5 w-5"
            )} />
            {!collapsed && <span>{item.label}</span>}
        </Link>
    );

    const NavSection = ({ title, items, expanded, onToggle }: { title: string, items: typeof mainMenu, expanded: boolean, onToggle: () => void }) => (
        <div className="space-y-1">
            {!collapsed && (
                <button
                    onClick={onToggle}
                    className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-semibold text-themed-dimmed uppercase tracking-wider hover:text-themed-muted transition-colors"
                >
                    <span>{title}</span>
                    <ChevronDown className={cn("h-3 w-3 transition-transform", !expanded && "-rotate-90")} />
                </button>
            )}
            {collapsed && <div className="my-3 mx-2 border-t border-white/5" />}
            {(expanded || collapsed) && items.map((item) => {
                const isActive = location.pathname === item.href;
                return <NavItem key={item.href} item={item} isActive={isActive} />;
            })}
        </div>
    );

    return (
        <div className={cn(
            "flex h-screen flex-col bg-gradient-to-b from-[#0c0c0e] via-[#0e0e10] to-[#0a0a0c] border-r border-white/5 transition-all duration-300 z-50",
            isMobileMenuOpen ? "fixed inset-y-0 left-0 translate-x-0" : "fixed inset-y-0 left-0 -translate-x-full lg:relative lg:translate-x-0",
            collapsed ? "w-[68px]" : "w-64 lg:w-56"
        )}>
            {/* Logo */}
            <div className={cn(
                "flex h-[58px] items-center",
                collapsed ? "justify-center px-2" : "justify-between px-4"
            )}>
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-600 flex items-center justify-center flex-shrink-0">
                        <Ghost className="h-4 w-4 text-on-accent" />
                    </div>
                    {!collapsed && (
                        <span className="text-sm font-semibold text-themed-primary tracking-tight">DecoyVerse</span>
                    )}
                </div>
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(true)}
                        className="h-6 w-6 rounded flex items-center justify-center text-themed-dimmed hover:bg-white/5 hover:text-themed-muted transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Expand button when collapsed */}
            {collapsed && (
                <div className="flex justify-center py-2">
                    <button
                        onClick={() => setCollapsed(false)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-themed-dimmed hover:bg-white/5 hover:text-themed-muted transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <div className={cn(
                "flex-1 py-2 overflow-y-auto scrollbar-thin",
                collapsed ? "px-2" : "px-3"
            )}
                style={{
                    scrollbarGutter: 'stable'
                }}
            >
                <div className="space-y-4">
                    <NavSection title="Main" items={mainMenu} expanded={mainExpanded} onToggle={() => setMainExpanded(!mainExpanded)} />
                    <NavSection title="Features" items={monitorMenu} expanded={featuresExpanded} onToggle={() => setFeaturesExpanded(!featuresExpanded)} />
                    <NavSection title="Tools" items={toolsMenu} expanded={toolsExpanded} onToggle={() => setToolsExpanded(!toolsExpanded)} />
                </div>
            </div>

            {/* Logout */}
            <div className={cn("border-t border-white/5 py-3", collapsed ? "px-2" : "px-3")}>
                <button
                    onClick={logout}
                    className={cn(
                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-themed-muted hover:text-themed-primary hover:bg-white/5 transition-all duration-200",
                        collapsed ? "justify-center" : ""
                    )}
                    title={collapsed ? "Logout" : undefined}
                >
                    <LogOut className={cn("h-[18px] w-[18px] flex-shrink-0", collapsed && "h-5 w-5")} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    )
}
