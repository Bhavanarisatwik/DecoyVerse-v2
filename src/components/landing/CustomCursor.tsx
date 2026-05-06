import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CustomCursor() {
    const [isTouch] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
    )

    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    // Liquid spring effect - extremely tight for near-instant tracking
    const springX = useSpring(cursorX, { stiffness: 800, damping: 35, mass: 0.1 })
    const springY = useSpring(cursorY, { stiffness: 800, damping: 35, mass: 0.1 })

    const [visible,  setVisible]  = useState(false)
    const [hovering, setHovering] = useState(false)
    const [clicking, setClicking] = useState(false)

    useEffect(() => {
        if (isTouch) return
        document.body.style.cursor = 'none'

        const onMove = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
            if (!visible) setVisible(true)
        }
        
        const onOver = (e: MouseEvent) => {
            const t = e.target as HTMLElement
            // Trigger liquid expansion on interactive elements
            if (t.closest('a, button, input, textarea, select, [data-cursor], .interactive, .cursor-pointer')) {
                setHovering(true)
            } else {
                setHovering(false)
            }
        }

        const onLeave  = () => setVisible(false)
        const onEnter  = () => setVisible(true)
        const onDown   = () => setClicking(true)
        const onUp     = () => setClicking(false)

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
    }, [cursorX, cursorY, isTouch, visible])

    if (isTouch) return null

    // Determine size of the liquid blob
    let size = 20
    if (hovering) size = 64
    if (clicking) size = 12

    return (
        <motion.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 99999,
                x: springX,
                y: springY,
                mixBlendMode: 'difference', // Creates the dynamic liquid color inversion effect
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    backgroundColor: 'white', // White with difference blending inverts colors flawlessly
                    borderRadius: '50%',
                    // Center the blob directly on the coordinate
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    width: size,
                    height: size,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    mass: 0.5
                }}
            />
        </motion.div>
    )
}
