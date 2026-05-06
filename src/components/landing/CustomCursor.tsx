import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

const C  = 32   // SVG viewBox centre
const OR = 27   // outer ring radius

export function CustomCursor() {
    const [isTouch] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
    )

    // ── Motion values (stable references, never recreated) ──────────────────
    const mouseX = useMotionValue(-200)
    const mouseY = useMotionValue(-200)
    const ringX  = useSpring(mouseX, { stiffness: 560, damping: 32, mass: 0.18 })
    const ringY  = useSpring(mouseY, { stiffness: 560, damping: 32, mass: 0.18 })

    // ── UI state ─────────────────────────────────────────────────────────────
    const [visible,  setVisible]  = useState(false)
    const [hovering, setHovering] = useState(false)
    const [clicking, setClicking] = useState(false)

    // Ref so event handlers never go stale → no need to put `visible` in deps
    const visibleRef = useRef(false)

    useEffect(() => {
        if (isTouch) return
        document.body.style.cursor = 'none'

        const onMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
            // Only one setState call ever; doesn't tear down the listener
            if (!visibleRef.current) { visibleRef.current = true; setVisible(true) }
        }
        const onOver = (e: MouseEvent) => {
            const t = e.target as HTMLElement
            setHovering(!!t.closest('a,button,input,textarea,select,[data-cursor],.cursor-pointer'))
        }
        const onLeave = () => { visibleRef.current = false; setVisible(false) }
        const onEnter = () => { visibleRef.current = true;  setVisible(true)  }
        const onDown  = () => setClicking(true)
        const onUp    = () => setClicking(false)

        document.addEventListener('mousemove',  onMove,  { passive: true })
        document.addEventListener('mouseover',  onOver,  { passive: true })
        document.addEventListener('mouseleave', onLeave)
        document.addEventListener('mouseenter', onEnter)
        document.addEventListener('mousedown',  onDown)
        document.addEventListener('mouseup',    onUp)

        return () => {
            document.body.style.cursor = ''
            document.removeEventListener('mousemove',  onMove)
            document.removeEventListener('mouseover',  onOver)
            document.removeEventListener('mouseleave', onLeave)
            document.removeEventListener('mouseenter', onEnter)
            document.removeEventListener('mousedown',  onDown)
            document.removeEventListener('mouseup',    onUp)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // ← stable empty deps: motion values / isTouch never change

    if (isTouch) return null

    const sz = clicking ? 28 : hovering ? 60 : 48

    return (
        <>
            {/* ── Trailing reticle (ring spring) ─────────────────────────── */}
            <motion.div
                style={{
                    position: 'fixed', top: 0, left: 0,
                    x: ringX, y: ringY,
                    pointerEvents: 'none', zIndex: 99999,
                    willChange: 'transform',
                }}
            >
                {/* Plain div centres without fighting framer's transform stack */}
                <div style={{ position: 'absolute', transform: 'translate(-50%,-50%)' }}>

                    <motion.div
                        animate={{ width: sz, height: sz, opacity: visible ? 1 : 0, scale: clicking ? 0.82 : 1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.28 }}
                        style={{
                            position: 'relative',
                            // CSS transition for filter → GPU-composited, no JS per-frame cost
                            filter: hovering
                                ? 'drop-shadow(0 0 9px rgba(255,107,53,.75)) drop-shadow(0 0 2px #FF6B35)'
                                : 'drop-shadow(0 0 4px rgba(255,107,53,.4))',
                            transition: 'filter 0.25s ease',
                        }}
                    >
                        {/* Layer 1 — outer dashed ring, rotates CW */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: hovering ? 2.5 : 6, repeat: Infinity, ease: 'linear' }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <svg width="100%" height="100%" viewBox="0 0 64 64">
                                <circle cx={C} cy={C} r={OR}
                                    stroke="#FF6B35"
                                    strokeWidth="1.2"
                                    strokeDasharray={hovering ? '4 3' : '9 5'}
                                    strokeOpacity={hovering ? 0.95 : 0.6}
                                    fill="none"
                                />
                            </svg>
                        </motion.div>

                        {/* Layer 2 — radar sweep, rotates CCW */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <svg width="100%" height="100%" viewBox="0 0 64 64">
                                <defs>
                                    <linearGradient id="sw" x1="1" y1="0" x2="0" y2="1">
                                        <stop offset="0%"   stopColor="#FF6B35" stopOpacity="0" />
                                        <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.9" />
                                    </linearGradient>
                                </defs>
                                {/* Filled wedge */}
                                <path
                                    d={`M${C},${C} L${C},${C - OR} A${OR},${OR} 0 0,1 ${(C + OR * Math.sin(Math.PI / 3)).toFixed(2)},${(C - OR * Math.cos(Math.PI / 3)).toFixed(2)} Z`}
                                    fill="url(#sw)" opacity={hovering ? 0.32 : 0.16}
                                />
                                {/* Bright leading edge */}
                                <path
                                    d={`M${C},${C - OR} A${OR},${OR} 0 0,1 ${(C + OR * Math.sin(Math.PI / 5)).toFixed(2)},${(C - OR * Math.cos(Math.PI / 5)).toFixed(2)}`}
                                    stroke="#FF6B35" strokeWidth={hovering ? 2.2 : 1.6}
                                    fill="none" strokeLinecap="round" strokeOpacity="0.95"
                                />
                            </svg>
                        </motion.div>

                        {/* Layer 3 — corner brackets, snap inward on hover */}
                        <motion.div
                            animate={{ scale: hovering ? 0.58 : 1 }}
                            transition={{ type: 'spring', stiffness: 440, damping: 22 }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <svg width="100%" height="100%" viewBox="0 0 64 64">
                                <g stroke="#FF6B35" strokeWidth="1.8" fill="none" strokeLinecap="round">
                                    <path d="M11,20 L11,11 L20,11" />
                                    <path d="M44,11 L53,11 L53,20" />
                                    <path d="M11,44 L11,53 L20,53" />
                                    <path d="M53,44 L53,53 L44,53" />
                                </g>
                            </svg>
                        </motion.div>

                        {/* Layer 4 — static: crosshairs + centre rings */}
                        <div style={{ position: 'absolute', inset: 0 }}>
                            <svg width="100%" height="100%" viewBox="0 0 64 64">
                                <g stroke="#FF6B35" strokeWidth="0.85" strokeOpacity="0.5" strokeLinecap="round">
                                    <line x1={C} y1="6"  x2={C} y2="18" />
                                    <line x1={C} y1="46" x2={C} y2="58" />
                                    <line x1="6"  y1={C} x2="18" y2={C} />
                                    <line x1="46" y1={C} x2="58" y2={C} />
                                </g>
                                <circle cx={C} cy={C} r="5"
                                    stroke="#FF6B35" strokeWidth="0.7" fill="none"
                                    strokeOpacity={hovering ? 0.9 : 0.45}
                                />
                                <circle cx={C} cy={C} r="2" fill="#FF6B35" opacity={hovering ? 1 : 0.8} />
                            </svg>
                        </div>

                        {/* Layer 5 — hover pulse ring */}
                        <motion.div
                            animate={{ opacity: hovering ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <svg width="100%" height="100%" viewBox="0 0 64 64">
                                <motion.circle
                                    cx={C} cy={C}
                                    stroke="#FF6B35" fill="rgba(255,107,53,0.06)" strokeWidth="0.5"
                                    animate={{ r: [9, 15, 9], opacity: [0.9, 0.2, 0.9] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            </svg>
                        </motion.div>
                    </motion.div>

                    {/* LOCKED label */}
                    <motion.div
                        animate={{ opacity: hovering ? 1 : 0, y: hovering ? 0 : 5 }}
                        initial={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.16 }}
                        style={{
                            position: 'absolute',
                            top: '100%', left: '50%',
                            x: '-50%',
                            marginTop: 7,
                            fontSize: 7,
                            letterSpacing: '0.22em',
                            fontFamily: '"Fira Code", monospace',
                            color: '#FF6B35',
                            whiteSpace: 'nowrap',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                        }}
                    >
                        ◉ LOCKED
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Exact-position dot (zero lag) ──────────────────────────── */}
            <motion.div
                style={{
                    position: 'fixed', top: 0, left: 0,
                    x: mouseX, y: mouseY,
                    pointerEvents: 'none', zIndex: 99999,
                    willChange: 'transform',
                }}
            >
                <div style={{ position: 'absolute', transform: 'translate(-50%,-50%)' }}>
                    <motion.div
                        animate={{
                            width:   clicking ? 3 : hovering ? 0 : 5,
                            height:  clicking ? 3 : hovering ? 0 : 5,
                            opacity: visible ? 1 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 900, damping: 36 }}
                        style={{
                            borderRadius: '50%',
                            backgroundColor: '#FF6B35',
                            boxShadow: '0 0 7px rgba(255,107,53,.9)',
                        }}
                    />
                </div>
            </motion.div>
        </>
    )
}
