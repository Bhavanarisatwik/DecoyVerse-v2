import { Bell, Search, User, Settings, LogOut, AlertCircle, ShieldAlert, Menu } from "lucide-react"
import { Button } from "../common/Button"
import { useNavigate, Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { alertsApi, type Alert } from "../../api/endpoints/alerts"

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const searchLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Nodes', path: '/nodes' },
        { name: 'Decoys', path: '/decoys' },
        { name: 'Honeytokens', path: '/honeytokens' },
        { name: 'Alerts', path: '/alerts' },
        { name: 'Configuration', path: '/configuration' },
        { name: 'Logs', path: '/logs' },
    ];

    useEffect(() => {
        alertsApi.getAlerts(5).then(res => setAlerts(res.data)).catch(console.error);
    }, []);

    // Get user initials for avatar
    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex h-[58px] items-center justify-between border-b border-white/5 bg-gradient-to-r from-[#0c0c0e] via-[#111113] to-[#0c0c0e] px-4 md:px-6 sticky top-0 z-40">
            {/* Left: Page title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden h-9 w-9 rounded-lg flex items-center justify-center text-themed-muted hover:bg-white/5 hover:text-themed-primary transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                {/* Search */}
                <div className="relative mr-1 md:mr-2" ref={searchRef}>
                    <div className="group flex items-center gap-2 h-9 w-9 md:w-64 rounded-full border border-transparent md:border-white/10 hover:bg-white/5 md:bg-white/5 px-0 md:px-4 justify-center md:justify-start text-sm text-themed-muted transition-all duration-200 focus-within:!w-64 focus-within:!border-white/20 focus-within:!bg-white/[0.08] focus-within:!px-4 focus-within:!justify-start cursor-text">
                        <Search className="h-4 w-4 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearch(true);
                            }}
                            onFocus={() => setShowSearch(true)}
                            className="w-full bg-transparent border-none outline-none text-themed-primary placeholder:text-themed-muted hidden md:block group-focus-within:block"
                        />
                    </div>
                    {/* Search Dropdown */}
                    {showSearch && searchQuery && (
                        <div className="absolute left-0 top-12 w-64 rounded-xl bg-gradient-to-b from-[#1a1a1c] to-[#141416] border border-white/10 shadow-xl overflow-hidden z-50 py-2">
                            {searchLinks.filter(link => link.name.toLowerCase().includes(searchQuery.toLowerCase())).map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        navigate(link.path);
                                        setShowSearch(false);
                                        setSearchQuery("");
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-themed-secondary hover:bg-white/5 hover:text-themed-primary transition-colors text-left"
                                >
                                    {link.name}
                                </button>
                            ))}
                            {searchLinks.filter(link => link.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-sm text-themed-muted text-center">
                                    No results found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative h-9 w-9 rounded-full hover:bg-white/5"
                    >
                        <Bell className="h-[18px] w-[18px] text-themed-muted" />
                        {(() => {
                            const count = alerts.filter(a => a.status === 'open' || a.severity === 'critical').length;
                            if (count === 0) return null;
                            return (
                                <span className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-0.5 rounded-full bg-status-danger flex items-center justify-center text-[10px] font-bold text-white leading-none">
                                    {count > 9 ? '9+' : count}
                                </span>
                            );
                        })()}
                    </Button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 rounded-xl bg-gradient-to-b from-[#1a1a1c] to-[#141416] border border-white/10 shadow-xl overflow-hidden z-50 flex flex-col max-h-[400px]">
                            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-semibold text-themed-primary">Notifications</h3>
                                <Link to="/alerts" onClick={() => setShowNotifications(false)} className="text-xs text-accent hover:text-accent-hover transition-colors">
                                    View All
                                </Link>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {alerts.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-themed-muted">
                                        No new notifications
                                    </div>
                                ) : (
                                    alerts.slice(0, 5).map(alert => (
                                        <div key={alert.id} className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { navigate('/alerts'); setShowNotifications(false); }}>
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-status-danger' : alert.severity === 'high' ? 'text-status-warning' : 'text-status-info'}`}>
                                                    {alert.severity === 'critical' || alert.severity === 'high' ? <ShieldAlert className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-themed-primary leading-tight">{alert.message}</p>
                                                    <p className="text-xs text-themed-muted mt-1 opacity-80">{new Date(alert.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar with Dropdown */}
                <div className="relative ml-2" ref={menuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent-600 flex items-center justify-center cursor-pointer ring-2 ring-white/10 hover:ring-white/20 transition-all"
                    >
                        {user ? (
                            <span className="text-xs font-semibold text-on-accent">
                                {getUserInitials(user.name)}
                            </span>
                        ) : (
                            <User className="h-4 w-4 text-white" />
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-48 rounded-xl bg-gradient-to-b from-[#1a1a1c] to-[#141416] border border-white/10 shadow-xl overflow-hidden z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-sm font-medium text-themed-primary">{user?.name || 'User'}</p>
                                <p className="text-xs text-themed-muted">{user?.email || 'user@example.com'}</p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <button
                                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-themed-secondary hover:bg-white/5 transition-colors"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </button>
                                <button
                                    onClick={() => { logout(); setShowUserMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-status-danger hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
