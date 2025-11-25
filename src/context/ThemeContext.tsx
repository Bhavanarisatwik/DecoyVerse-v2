import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type ThemeMode = 'gold' | 'orange' | 'light'

interface ThemeContextType {
    theme: ThemeMode
    setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('decoyverse-theme')
        return (saved as ThemeMode) || 'gold'
    })

    useEffect(() => {
        localStorage.setItem('decoyverse-theme', theme)
        
        // Remove all theme classes
        document.documentElement.classList.remove('theme-gold', 'theme-orange', 'theme-light')
        
        // Add current theme class
        document.documentElement.classList.add(`theme-${theme}`)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
