import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { Button } from "../common/Button"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"

export function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex h-[58px] items-center justify-between border-b border-white/5 bg-gradient-to-r from-[#0c0c0e] via-[#111113] to-[#0c0c0e] px-6 sticky top-0 z-40">
            {/* Left: Page title */}
            <div className="flex items-center gap-4">
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                {/* Search */}
                <div className="relative mr-2">
                    <div className="flex items-center gap-2 h-9 w-64 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-themed-muted cursor-pointer hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200">
                        <Search className="h-4 w-4" />
                        <span>Search Anything...</span>
                    </div>
                </div>

                
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-white/5">
                    <Bell className="h-[18px] w-[18px] text-themed-muted" />
                    <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-accent" />
                </Button>

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
