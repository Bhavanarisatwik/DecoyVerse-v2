import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Ghost } from "lucide-react"
import { ThemeSwitcher } from "../common/ThemeSwitcher"
import { useTheme } from "../../context/ThemeContext"

const NAV_LINKS = [
    { label: 'Platform', id: 'use-cases' },
    { label: 'Decoys',   id: 'features'  },
    { label: 'Pricing',  id: 'pricing'   },
    { label: 'Docs',     id: 'faq'       },
]

export function LandingNavbar() {
    const { theme } = useTheme()
    const isLight = theme === 'light'

    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    // Theme-responsive nav surface: frosty white in light mode, subtle dark tint in dark mode
    const navBg    = isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0,0,0,0.35)'
    // Adjust text colors to ensure contrast with the lighter subtle tint
    const linkColor = isLight ? '#52525B' : '#A1A1AA'
    const linkHover = isLight ? '#09090B' : '#FAFAFA'
    const brandColor = isLight ? '#09090B' : '#FAFAFA'

    const monoLink: React.CSSProperties = {
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        transition: 'color .15s ease',
        cursor: 'none',
    }

    return (
        <nav
            style={{
                position: 'fixed', 
                top: scrolled ? '16px' : '24px', 
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
                height: '56px',
                width: 'calc(100% - 48px)',
                maxWidth: '1100px',
                borderRadius: '50px',
                // Frosty Glassmorphism: dark tinted bg + extreme blur and saturation
                background: navBg,
                backdropFilter: 'blur(40px) saturate(200%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                // Subtle bright rim for dark glass, dark rim for light glass
                border: isLight
                    ? '1px solid rgba(0,0,0,0.08)'
                    : '1px solid rgba(255,255,255,0.08)',
                // Specular highlight and deep drop shadow
                boxShadow: scrolled
                    ? (isLight ? '0 12px 40px rgba(0,0,0,0.06)' : `inset 0 1px 1px rgba(255,255,255,0.1), inset 0 0 20px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.4)`)
                    : (isLight ? '0 4px 16px rgba(0,0,0,0.03)' : 'inset 0 1px 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.01), 0 4px 16px rgba(0,0,0,0.2)'),
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            <div style={{
                width: '100%', height: '100%',
                padding: '0 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>

                {/* ── Brand: Ghost icon (no bg box) + gradient text ── */}
                <Link
                    to="/"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        textDecoration: 'none', cursor: 'none',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700, fontSize: '16px',
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                        color: brandColor,
                    }}
                >
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        filter: 'drop-shadow(0 0 6px rgba(var(--accent-rgb), 0.55))',
                    }}>
                        <Ghost size={26} strokeWidth={1.8} style={{ color: 'var(--accent-400)' }} />
                    </span>
                    <span className="bg-clip-text text-transparent" style={{
                        backgroundImage: 'linear-gradient(90deg, var(--accent-400) 0%, var(--accent-500) 55%, var(--accent-600) 100%)',
                    }}>
                        DecoyVerse
                    </span>
                </Link>

                {/* ── Mono nav links ── */}
                <div className="hidden md:flex items-center" style={{ gap: '32px' }}>
                    {NAV_LINKS.map(({ label, id }) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            onClick={(e) => handleScroll(e, id)}
                            style={{ ...monoLink, color: linkColor }}
                            onMouseEnter={e => { e.currentTarget.style.color = linkHover }}
                            onMouseLeave={e => { e.currentTarget.style.color = linkColor }}
                        >
                            {label}
                        </a>
                    ))}
                </div>

                {/* ── Right side ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <ThemeSwitcher />

                    <Link
                        to="/auth/login"
                        className="hidden sm:block"
                        style={{ ...monoLink, color: linkColor }}
                        onMouseEnter={e => { e.currentTarget.style.color = linkHover }}
                        onMouseLeave={e => { e.currentTarget.style.color = linkColor }}
                    >
                        Login
                    </Link>

                    <Link
                        to="/auth/signup"
                        style={{
                            ...monoLink,
                            color: 'var(--accent-500)',
                            border: '1px solid rgba(var(--accent-rgb), 0.40)',
                            padding: '6px 14px',
                            borderRadius: '4px',
                            background: 'transparent',
                            transition: 'background .15s ease, color .15s ease, border-color .15s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.10)'
                            e.currentTarget.style.color = 'var(--accent-400)'
                            e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.65)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--accent-500)'
                            e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.40)'
                        }}
                    >
                        Deploy
                    </Link>
                </div>
            </div>
        </nav>
    )
}
