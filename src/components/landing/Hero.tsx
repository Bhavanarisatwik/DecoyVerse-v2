import { useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowRight, Terminal } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

/* ══════════════════════════════════════════
   BaitingGrid — Minimal, premium background grid with glowing pathway
══════════════════════════════════════════ */
function BaitingGrid({ theme }: { theme: string }) {
    const isLight = theme === 'light'
    const gridColor = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: 0.8 }}>
            {/* Background Grid */}
            <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)'
            }} />
            
            {/* Glowing Path (Baiting line) */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 0 12px rgba(var(--accent-rgb), 0.8))' }}>
                <motion.path
                    d="M-100,600 L200,600 L300,400 L600,400 L800,200 L1200,200 L1400,400 L2000,400"
                    fill="none"
                    stroke="rgba(var(--accent-rgb), 0.4)"
                    strokeWidth="2"
                    strokeDasharray="10 10"
                    initial={{ strokeDashoffset: 1000 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                    d="M-100,600 L200,600 L300,400 L600,400 L800,200 L1200,200 L1400,400 L2000,400"
                    fill="none"
                    stroke="url(#glowGradient)"
                    strokeWidth="3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <defs>
                    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(var(--accent-rgb), 0)" />
                        <stop offset="50%" stopColor="rgba(var(--accent-rgb), 1)" />
                        <stop offset="100%" stopColor="rgba(var(--accent-rgb), 0)" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

/* ── Corner crosshair mark ── */
function Crosshair({ style, flipX = false, flipY = false }: {
    style?: React.CSSProperties
    flipX?: boolean
    flipY?: boolean
}) {
    const t = [flipX && 'scaleX(-1)', flipY && 'scaleY(-1)'].filter(Boolean).join(' ')
    return (
        <div style={{
            position: 'absolute', width: '14px', height: '14px',
            pointerEvents: 'none',
            transform: t || undefined,
            ...style,
        }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '14px', height: '1px', background: 'var(--accent-500)' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, width: '1px', height: '14px', background: 'var(--accent-500)' }} />
        </div>
    )
}

/* ── Active Alert Card (replaces KillChip) ── */
function ActiveAlertCard({ isLight }: { isLight: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
            style={{
                width: '100%', maxWidth: '520px',
                background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(14, 14, 16, 0.65)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                border: isLight ? '1px solid rgba(var(--accent-rgb), 0.2)' : '1px solid rgba(var(--accent-rgb), 0.35)',
                borderRadius: '16px',
                padding: '26px 20px',
                boxShadow: isLight 
                    ? '0 24px 48px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 24px rgba(var(--accent-rgb), 0.1), inset 0 0 12px rgba(var(--accent-rgb), 0.05)'
                    : '0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 24px rgba(var(--accent-rgb), 0.15), inset 0 0 12px rgba(var(--accent-rgb), 0.08)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                position: 'relative',
                outline: '1px solid transparent', // Forces anti-aliasing on 3D edges
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden'
            }}
        >
            {/* Top Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)',
                        color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '10px',
                        letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444', animation: 'dv-blink 1s infinite' }} />
                        ALERT FIRED · 00:00:02 AGO
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dimmed)', letterSpacing: '0.05em' }}>DV-8841 · INCIDENT</span>
                </div>
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', letterSpacing: '0.1em'
                }}>
                    SEVERITY: CRITICAL
                </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }} />
                    DECOY INTERACTION · SSH
                </div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 600, lineHeight: 1.3, margin: 0 }}>
                    SSH brute-force on <span style={{ color: '#0ea5e9' }}>Ubuntu_DB_Decoy</span> — 142 attempts, 1 success.
                </h3>
            </div>

            {/* Grid details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: '16px' }}>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dimmed)', letterSpacing: '0.1em', marginBottom: '4px' }}>ATTACKER</div>
                    <div style={{ fontSize: '13px', color: '#0ea5e9' }}>185.220.101.47 <span style={{ color: 'var(--text-muted)' }}>· TOR exit</span></div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dimmed)', letterSpacing: '0.1em', marginBottom: '4px' }}>TARGET DECOY</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>10.0.4.15 <span style={{ color: 'var(--text-muted)' }}>· prod-east</span></div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dimmed)', letterSpacing: '0.1em', marginBottom: '4px' }}>HONEYTOKEN USED</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>aws_lure_07.key</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dimmed)', letterSpacing: '0.1em', marginBottom: '4px' }}>REACHED REAL ASSETS</div>
                    <div style={{ fontSize: '13px', color: '#22c55e' }}>No — contained</div>
                </div>
            </div>

            {/* AI Advisor */}
            <div style={{
                background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.1)',
                borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px'
            }}>
                <div style={{
                    width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(14, 165, 233, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Terminal size={14} color="#0ea5e9" />
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: '#0ea5e9', letterSpacing: '0.1em', marginBottom: '6px', fontWeight: 600 }}>
                        AI ADVISOR · SUGGESTED ACTION
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Block <span style={{ color: '#0ea5e9' }}>185.220.101.47</span> at edge, rotate the staged credential, and quarantine all sessions originating from this fingerprint across the last 30 minutes.
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button style={{
                    background: 'var(--text-primary)', color: isLight ? '#FFF' : '#000', border: 'none',
                    borderRadius: '6px', padding: '0 16px', height: '36px',
                    fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, cursor: 'none',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span style={{ width: '8px', height: '10px', border: `1.5px solid ${isLight ? '#FFF' : '#000'}`, borderRadius: '2px', borderTopWidth: '3px' }} />
                    Apply & block
                </button>
                <button style={{
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', padding: '0 16px', height: '36px',
                    fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'none',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s'
                }}>
                    <Terminal size={14} />
                    Investigate
                </button>
            </div>
        </motion.div>
    )
}

/* ── Primary CTA ── */
function PrimaryBtn({ label: btnLabel }: { label: string }) {
    return (
        <button
            type="button"
            data-cursor="DEPLOY"
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                height: '46px', padding: '0 22px',
                background: 'var(--accent-500)', color: 'var(--text-on-accent)',
                borderRadius: '6px', border: '0', cursor: 'none',
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '14px',
                boxShadow: '0 8px 24px -8px rgba(var(--accent-rgb), 0.5)',
                transition: 'background .15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-400)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-500)' }}
        >
            {btnLabel}
            <ArrowRight size={14} />
        </button>
    )
}

/* ── Shared tokens ── */
const monoSm = { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.16em' } as const
const slashMark = {
    display: 'inline-block', width: '0.4em', height: '1.0em',
    background: 'var(--accent-500)',
    transform: 'skewX(-18deg) translateY(0.06em)',
    margin: '0 0.05em', verticalAlign: '-0.06em',
} as const

/* ── Headline ── */
function HeadlineLines({ fontSize, strokeColor }: { fontSize: string; strokeColor: string }) {
    return (
        <h1 style={{
            margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700,
            lineHeight: 0.92, letterSpacing: '-0.045em',
            color: 'var(--text-primary)', fontSize,
        }}>
            <motion.span className="block"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, type: 'spring', stiffness: 100 }}>
                Stop{' '}
                <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${strokeColor}` }}>
                    defending.
                </span>
            </motion.span>
            <motion.span className="block"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
                style={{ paddingLeft: 'clamp(40px, 14vw, 180px)' }}>
                <span style={{ color: 'var(--accent-500)', fontStyle: 'italic', fontWeight: 600 }}>Start</span>
            </motion.span>
            <motion.span className="block"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100 }}>
                <span aria-hidden="true" style={slashMark} />
                baiting.
            </motion.span>
        </h1>
    )
}

/* ══════════════════════════════════════════
   Hero
══════════════════════════════════════════ */
export function Hero() {
    const { theme } = useTheme()
    const isLight = theme === 'light'

    const strokeColor = isLight ? 'rgba(60,60,70,0.38)' : 'rgba(160,160,170,0.45)'

    /* Mouse-tracking glow and interactive tilt */
    const glowX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 - 200 : 400)
    const glowY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 - 200 : 200)
    const springGlowX = useSpring(glowX, { stiffness: 40, damping: 20 })
    const springGlowY = useSpring(glowY, { stiffness: 40, damping: 20 })

    const normalizedMouseX = useMotionValue(0)
    const normalizedMouseY = useMotionValue(0)

    useEffect(() => {
        const fn = (e: MouseEvent) => { 
            // Glow tracking
            glowX.set(e.clientX - 200)
            glowY.set(e.clientY - 200)

            // Normalized (-1 to 1) for 3D tilt
            normalizedMouseX.set((e.clientX / window.innerWidth) * 2 - 1)
            normalizedMouseY.set((e.clientY / window.innerHeight) * 2 - 1)
        }
        window.addEventListener('mousemove', fn, { passive: true })
        return () => window.removeEventListener('mousemove', fn)
    }, [glowX, glowY, normalizedMouseX, normalizedMouseY])

    // Smooth springs for interactive tilt
    const springTiltX = useSpring(normalizedMouseX, { stiffness: 100, damping: 20 })
    const springTiltY = useSpring(normalizedMouseY, { stiffness: 100, damping: 20 })

    // Map normalized mouse to 3D rotations around the base angles: Y=-12, X=6
    const rotateY = useTransform(springTiltX, [-1, 1], [-6, -18])
    const rotateX = useTransform(springTiltY, [-1, 1], [12, 0])

    const subCopyStyle = {
        margin: '0 0 24px', fontSize: '16px', lineHeight: 1.55,
        color: 'var(--text-muted)',
        borderLeft: '2px solid var(--accent-500)', paddingLeft: '16px',
    } as const

    return (
        <>
            <style>{`@keyframes dv-blink { 50% { opacity: 0.25; } }`}</style>

            <section
                id="hero"
                className="relative min-h-screen overflow-hidden transition-colors duration-300"
                style={{ background: 'var(--bg-primary)' }}
            >
                {/* ════════════════════════════
                    LAYER 0 — Code rain canvas
                    Security data stream at very low opacity,
                    gives the "live system" feel without distracting.
                ════════════════════════════ */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <BaitingGrid theme={theme} />
                </div>

                {/* ════════════════════════════
                    LAYER 1 — Morphing liquid blobs
                    Slow-drifting radial washes that breathe.
                ════════════════════════════ */}

                {/* Blob A — drifts diagonally across */}
                <motion.div
                    className="absolute pointer-events-none z-[1]"
                    style={{
                        width: '900px', height: '900px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at center, rgba(var(--accent-rgb),0.09) 0%, transparent 65%)',
                        filter: 'blur(70px)',
                    }}
                    animate={{
                        x: ['-15%', '25%', '5%',  '-15%'],
                        y: ['-5%',  '35%', '65%', '-5%' ],
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Blob B — counter-drift, smaller */}
                <motion.div
                    className="absolute pointer-events-none z-[1]"
                    style={{
                        width: '640px', height: '640px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at center, rgba(var(--accent-rgb),0.06) 0%, transparent 60%)',
                        filter: 'blur(90px)',
                    }}
                    animate={{
                        x: ['65%', '30%', '70%', '65%'],
                        y: ['55%', '15%', '75%', '55%'],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
                />

                {/* Blob C — slow vertical pulse, center-bottom */}
                <motion.div
                    className="absolute pointer-events-none z-[1]"
                    style={{
                        width: '500px', height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at center, rgba(var(--accent-rgb),0.05) 0%, transparent 60%)',
                        filter: 'blur(60px)',
                        left: '35%',
                    }}
                    animate={{ y: ['80%', '40%', '80%'], scale: [1, 1.25, 1] }}
                    transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                />

                {/* ════════════════════════════
                    LAYER 2 — Mouse-tracking ambient glow
                ════════════════════════════ */}
                <motion.div
                    className="absolute pointer-events-none z-[2] rounded-full"
                    style={{
                        x: springGlowX, y: springGlowY,
                        width: '420px', height: '420px',
                        background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.11) 0%, transparent 70%)',
                        filter: 'blur(55px)',
                    }}
                />

                {/* LAYER 3 (Diagonal slash) removed per user request */}

                {/* ════════════════════════════
                    DECORATIVE CHROME
                ════════════════════════════ */}
                {/* Vertical mono label */}
                <div
                    className="absolute z-[4] hidden md:block select-none"
                    style={{
                        left: '18px', top: '50%',
                        transform: 'translateY(-50%) rotate(-90deg)',
                        transformOrigin: '0 50%',
                        fontFamily: 'var(--font-mono)', fontSize: '10px',
                        color: 'var(--text-dimmed)', letterSpacing: '0.32em',
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}
                >
                    DV-OS · Mode: Active Defense
                </div>

                {/* ══════════════════════════════════════════
                    DESKTOP LAYOUT (lg+)
                    flex-col: top zone → spacer → bottom bar
                ══════════════════════════════════════════ */}
                <div className="hidden lg:flex absolute inset-0 z-10 flex-col" style={{ paddingTop: '80px' }}>

                    {/* Corner crosshairs */}
                    <Crosshair style={{ top: '32px', left: '32px' }} />
                    <Crosshair style={{ top: '32px', right: '32px' }} flipX />
                    <Crosshair style={{ bottom: '32px', left: '32px' }} flipY />
                    <Crosshair style={{ bottom: '32px', right: '32px' }} flipX flipY />

                    {/* Main Content Layout - 2 Columns */}
                    <div style={{ flex: 1, display: 'flex', padding: '0 64px 40px', gap: '40px' }}>
                        
                        {/* LEFT COLUMN */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <motion.div
                                style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', marginTop: '60px' }}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span style={{ ...monoSm, color: 'var(--accent-500)' }}>001 / DV‑OS</span>
                                <span style={{ width: '60px', height: '1px', background: 'rgba(var(--accent-rgb),0.5)', display: 'block', flexShrink: 0 }} />
                                <span style={{ ...monoSm, color: 'var(--text-dimmed)', textTransform: 'uppercase' }}>Doctrine</span>
                            </motion.div>
                            
                            <HeadlineLines fontSize="clamp(40px, 6vw, 90px)" strokeColor={strokeColor} />

                            <div style={{ flex: 1, minHeight: '32px' }} />

                            <motion.div
                                style={{ maxWidth: '460px' }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                <p style={{ ...subCopyStyle, fontSize: '15px', marginBottom: '20px' }}>
                                    Walls fail. Patches lag. So we flip the model:{' '}
                                    <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                        your network becomes the trap.
                                    </strong>{' '}
                                    Decoys, lures, and honeytokens that exist only to be touched&nbsp;—&nbsp;and the second they are, you have the attacker cold.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <Link to="/auth/signup">
                                        <PrimaryBtn label="Arm the network" />
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        data-cursor="CAPTURE"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                                            height: '46px', padding: '0 16px',
                                            color: 'var(--text-secondary)',
                                            fontFamily: 'var(--font-mono)', fontSize: '12px',
                                            textDecoration: 'none', letterSpacing: '0.06em',
                                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                                            transition: 'border-color .15s ease, color .15s ease',
                                            cursor: 'none',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.color = 'var(--text-primary)'
                                            e.currentTarget.style.borderBottomColor = 'var(--accent-500)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.color = 'var(--text-secondary)'
                                            e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.08)'
                                        }}
                                    >
                                        <Terminal size={12} style={{ color: 'var(--text-dimmed)' }} />
                                        See a real capture →
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN - Stacked Alert Effect */}
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', perspective: '1200px' }}>
                            <motion.div
                                style={{ 
                                    width: '480px', 
                                    transformStyle: 'preserve-3d',
                                    transformOrigin: 'center right',
                                    position: 'relative',
                                    scale: 1,
                                    rotateY,
                                    rotateX,
                                    rotateZ: -4,
                                    right: '40px'
                                }}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                            >
                                {/* Background Stack Card 2 (Bottom) */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(14, 14, 16, 0.4)',
                                    border: '1px solid rgba(var(--accent-rgb), 0.1)',
                                    borderRadius: '16px',
                                    transform: 'translateZ(-60px) translateY(16px) translateX(-16px)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    outline: '1px solid transparent',
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden'
                                }} />
                                
                                {/* Background Stack Card 1 (Middle) */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(14, 14, 16, 0.6)',
                                    border: '1px solid rgba(var(--accent-rgb), 0.2)',
                                    borderRadius: '16px',
                                    transform: 'translateZ(-30px) translateY(8px) translateX(-8px)',
                                    boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
                                    outline: '1px solid transparent',
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden'
                                }} />

                                {/* Foreground Card */}
                                <div style={{ position: 'relative', zIndex: 3, transform: 'translateZ(0px)' }}>
                                    <ActiveAlertCard isLight={isLight} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    MOBILE LAYOUT (< lg)
                ══════════════════════════════════════════ */}
                <div className="lg:hidden relative z-10 flex flex-col px-5 pt-28 pb-16 min-h-screen">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <span style={{ ...monoSm, color: 'var(--accent-500)' }}>001 / DV‑OS</span>
                        <span style={{ width: '40px', height: '1px', background: 'rgba(var(--accent-rgb),0.5)', display: 'block', flexShrink: 0 }} />
                        <span style={{ ...monoSm, color: 'var(--text-dimmed)', textTransform: 'uppercase' }}>Doctrine</span>
                    </div>
                    <div style={{ marginBottom: '36px' }}>
                        <HeadlineLines fontSize="clamp(48px, 13vw, 80px)" strokeColor={strokeColor} />
                    </div>
                    <p style={subCopyStyle}>
                        Walls fail. Patches lag. So we flip the model:{' '}
                        <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            your network becomes the trap.
                        </strong>{' '}
                        Decoys, lures, and honeytokens that exist only to be touched&nbsp;—&nbsp;and the second they are, you have the attacker cold.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                        <Link to="/auth/signup"><PrimaryBtn label="Arm the network" /></Link>
                        <Link
                            to="/dashboard"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                height: '46px', padding: '0 4px',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-mono)', fontSize: '12px',
                                textDecoration: 'none', letterSpacing: '0.06em',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <Terminal size={12} style={{ color: 'var(--text-dimmed)' }} />
                            See a real capture →
                        </Link>
                    </div>
                    <ActiveAlertCard isLight={isLight} />
                </div>
            </section>
        </>
    )
}
