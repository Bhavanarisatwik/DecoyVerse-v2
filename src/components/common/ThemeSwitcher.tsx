import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Check } from 'lucide-react'
import { useTheme, ThemeMode } from '../../context/ThemeContext'
import { cn } from '../../utils/cn'

const themes: { id: ThemeMode; name: string; colors: string[] }[] = [
    {
        id: 'gold',
        name: 'Cyan Dark',
        colors: ['#06B6D4', '#22D3EE', '#09090B']
    },
    {
        id: 'orange',
        name: 'Orange Dark',
        colors: ['#FF6B35', '#FF8C42', '#09090B']
    },
    {
        id: 'light',
        name: 'Orange Light',
        colors: ['#FF6B35', '#FF8C42', '#FFFFFF']
    }
]

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const isLightTheme = theme === 'light'

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-xl border transition-all",
                    "border-themed bg-themed-elevated/50 hover:bg-themed-elevated text-themed-muted hover:text-themed-primary"
                )}
            >
                {isLightTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute right-0 mt-2 w-48 rounded-2xl border p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200",
                    "bg-themed-card border-themed"
                )}>
                    <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-themed-dimmed">
                        Select Theme
                    </div>
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                "hover:bg-themed-elevated",
                                theme === t.id && "bg-themed-elevated"
                            )}
                        >
                            <div className="flex -space-x-1">
                                {t.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="h-5 w-5 rounded-full border-2 border-themed-card"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium flex-1 text-left text-themed-secondary">
                                {t.name}
                            </span>
                            {theme === t.id && (
                                <Check className="h-4 w-4 text-accent" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
