import { useEffect, useRef } from 'react'
import './SmoothCursor.css'

/**
 * A restrained Smooth Cursor-inspired trail.
 *
 * The official React Bits Pro component is license-gated and this project has
 * no REACTBITS_LICENSE_KEY / components.json, so this is an original
 * implementation: an exact core dot plus a spring-lagged ring and a short,
 * fading trail. It keeps the native cursor on touch/reduced-motion devices.
 */

const INTERACTIVE =
  'a, button, [role="button"]:not(.archive-map__province), input, textarea, select, label, .tech-text, .work-card, .archive__card, .cap-card'

const TAU = Math.PI * 2
const approach = (current: number, target: number, dt: number, seconds: number) =>
  current + (target - current) * (1 - Math.exp(-dt / seconds))

export default function SmoothCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return undefined

    const fine = window.matchMedia('(pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return undefined

    const root = document.documentElement
    let width = 1
    let height = 1
    let dpr = 1
    let raf = 0
    let last = 0
    let alive = true
    let hasPointer = false
    let visible = false
    let vis = 0
    let hovered = false
    let hoverAmt = 0
    let pressed = false
    let pressAmt = 0

    const pointer = { x: 0, y: 0 }
    const spring = { x: 0, y: 0, vx: 0, vy: 0 }
    const trail: { x: number; y: number }[] = []

    function schedule() {
      if (!alive || raf || document.hidden) return
      last = 0
      raf = requestAnimationFrame(tick)
    }

    const resize = () => {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onResize = () => {
      resize()
      schedule()
    }

    const setHover = (target: EventTarget | null) => {
      const next = target instanceof Element && Boolean(target.closest(INTERACTIVE))
      if (next === hovered) return
      hovered = next
      schedule()
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      setHover(event.target)
      if (!hasPointer) {
        hasPointer = true
        spring.x = pointer.x
        spring.y = pointer.y
        spring.vx = 0
        spring.vy = 0
        trail.length = 0
        trail.push({ x: spring.x, y: spring.y })
        root.classList.add('smooth-cursor-on')
      }
      visible = true
      schedule()
    }

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pressed = true
      setHover(event.target)
      schedule()
    }

    const onUp = () => {
      pressed = false
      schedule()
    }

    const onLeave = () => {
      visible = false
      schedule()
    }

    const onEnter = () => {
      if (hasPointer) {
        visible = true
        schedule()
      }
    }

    const onBlur = () => {
      visible = false
      pressed = false
      schedule()
    }

    const onVisibility = () => {
      if (document.hidden) {
        visible = false
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        return
      }
      if (hasPointer) {
        visible = true
        schedule()
      }
    }

    const tick = (now: number) => {
      raf = 0
      if (!alive) return
      const dt = last ? Math.min(0.033, (now - last) / 1000) : 0.016
      last = now

      if (hasPointer) {
        const stiffness = 220
        const damping = 18
        spring.vx += (pointer.x - spring.x) * stiffness * dt
        spring.vy += (pointer.y - spring.y) * stiffness * dt
        const decay = Math.exp(-damping * dt)
        spring.vx *= decay
        spring.vy *= decay
        spring.x += spring.vx * dt
        spring.y += spring.vy * dt

        trail.unshift({ x: spring.x, y: spring.y })
        if (trail.length > 24) trail.pop()
      }

      vis = approach(vis, visible ? 1 : 0, dt, 0.1)
      hoverAmt = approach(hoverAmt, hovered ? 1 : 0, dt, 0.08)
      pressAmt = approach(pressAmt, pressed ? 1 : 0, dt, 0.06)

      ctx.clearRect(0, 0, width, height)

      if (hasPointer && vis >= 0.015) {
        // Trail: broad, faint glow first, then a fine pink filament.
        ctx.lineCap = 'round'
        for (let i = 0; i < trail.length - 1; i++) {
          const a = trail[i]
          const b = trail[i + 1]
          const t = 1 - i / (trail.length - 1)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(255, 159, 207, ${0.035 * t * vis})`
          ctx.lineWidth = 9 * t
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(255, 159, 207, ${0.28 * t * vis})`
          ctx.lineWidth = 0.6 + 1.5 * t
          ctx.stroke()
        }

        const ringRadius = (11 + 8 * hoverAmt) * (1 - 0.16 * pressAmt)
        ctx.beginPath()
        ctx.moveTo(spring.x, spring.y)
        ctx.lineTo(pointer.x, pointer.y)
        ctx.strokeStyle = `rgba(255, 159, 207, ${0.1 * vis})`
        ctx.lineWidth = 0.8
        ctx.stroke()

        ctx.save()
        ctx.shadowColor = 'rgba(255, 159, 207, 0.46)'
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.arc(spring.x, spring.y, ringRadius, 0, TAU)
        ctx.strokeStyle = `rgba(255, 159, 207, ${(0.44 + 0.3 * hoverAmt) * vis})`
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.restore()

        // The exact pointer gets a small ivory dot with a dark halo, so it stays
        // visible over both the dark page and the cream buttons.
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 4.2, 0, TAU)
        ctx.fillStyle = `rgba(7, 8, 8, ${0.55 * vis})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 2.4, 0, TAU)
        ctx.fillStyle = `rgba(246, 242, 233, ${0.95 * vis})`
        ctx.fill()
      }

      const moving =
        hasPointer &&
        (Math.abs(pointer.x - spring.x) > 0.08 ||
          Math.abs(pointer.y - spring.y) > 0.08 ||
          Math.abs(spring.vx) > 0.08 ||
          Math.abs(spring.vy) > 0.08)
      const changing =
        Math.abs(vis - (visible ? 1 : 0)) > 0.002 ||
        Math.abs(hoverAmt - (hovered ? 1 : 0)) > 0.002 ||
        Math.abs(pressAmt - (pressed ? 1 : 0)) > 0.002

      if (moving || changing) schedule()
    }

    resize()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('blur', onBlur)
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.documentElement.addEventListener('pointerenter', onEnter)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      root.classList.remove('smooth-cursor-on')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('blur', onBlur)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.removeEventListener('pointerenter', onEnter)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="smooth-cursor" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
