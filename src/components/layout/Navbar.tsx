import { Bell, Search, User } from "lucide-react"
import { Input } from "../common/Input"
import { Button } from "../common/Button"
import { ThemeToggle } from "../common/ThemeToggle"

export function Navbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-700 bg-black-900/50 backdrop-blur-md px-6 sticky top-0 z-40">
            <div className="w-96">
                <Input
                    placeholder="Search..."
                    className="bg-black-800/50 border-gray-700 focus:border-gold-500/50"
                    icon={<Search className="h-4 w-4" />}
                />
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-status-danger ring-2 ring-black-900" />
                </Button>

                <div className="h-8 w-px bg-gray-700" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs text-gray-400">Owner</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-black-800 border border-gray-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>
        </header>
    )
}
