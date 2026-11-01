import { useEffect, useRef } from 'react'
import './GlimmerWrap.css'

/**
 * A restrained, Glimmer Wrap-inspired side background.
 *
 * The official React Bits Pro component is distributed through a licensed
 * registry and needs REACTBITS_LICENSE_KEY. That key is not configured in this
 * project, so this is an original, dependency-free approximation: a sparse
 * field of fine glints drifting slowly and catching the light at long,
 * offset intervals. No rainbow, no rapid blinking.
 */

const SPRITE = 48

type Tint = 'warm' | 'cool' | 'pink'

interface Glint {
  x: number
  y: number
  size: number
  phase: number
  period: number
  driftX: number
  driftY: number
  depth: number
  tint: Tint
}

const TINTS: Record<Tint, [string, string, string]> = {
  warm: ['rgba(255, 252, 244, 1)', 'rgba(255, 224, 190, 0.5)', 'rgba(255, 207, 164, 0)'],
  cool: ['rgba(250, 252, 255, 1)', 'rgba(196, 218, 255, 0.38)', 'rgba(170, 198, 255, 0)'],
  pink: ['rgba(255, 250, 252, 1)', 'rgba(255, 184, 216, 0.34)', 'rgba(255, 159, 207, 0)'],
}

function makeSprite(tint: Tint) {
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE
  canvas.height = SPRITE
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  const [core, halo, edge] = TINTS[tint]
  const gradient = ctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2)
  gradient.addColorStop(0, core)
  gradient.addColorStop(0.08, core)
  gradient.addColorStop(0.24, halo)
  gradient.addColorStop(0.62, edge)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SPRITE, SPRITE)
  return canvas
}

const random = (index: number, salt: number) => {
  let hash = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263)
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177)
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296
}

const wrap = (value: number, min: number, max: number) => {
  const span = max - min
  return min + (((value - min) % span) + span) % span
}

export default function GlimmerWrap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return undefined

    const narrow = window.matchMedia('(max-width: 1023px)')
    if (narrow.matches) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sprites: Record<Tint, HTMLCanvasElement> = {
      warm: makeSprite('warm'),
      cool: makeSprite('cool'),
      pink: makeSprite('pink'),
    }

    let width = 1
    let height = 1
    let dpr = 1
    let raf = 0
    let last = 0
    let clock = 0
    let alive = true
    let band = 0.04
    let glints: Glint[] = []

    const build = () => {
      const side = Math.max(64, (width - 1700) / 2)
      band = side / width
      const perSide = Math.min(160, Math.max(30, Math.round((side * height) / 5200)))
      glints = []
      for (let i = 0; i < perSide; i++) {
        const tintRoll = random(i, 8)
        glints.push({
          x: band * (0.03 + random(i, 1) * 0.94),
          y: random(i, 2),
          size: 1.3 + Math.pow(random(i, 3), 2) * 3.2,
          phase: random(i, 4) * Math.PI * 2,
          period: 10 + random(i, 5) * 16,
          driftX: (random(i, 6) - 0.5) * 0.005,
          driftY: (random(i, 7) - 0.5) * 0.002,
          depth: 0.35 + random(i, 9) * 0.65,
          tint: tintRoll < 0.14 ? 'pink' : tintRoll < 0.28 ? 'cool' : 'warm',
        })
      }
    }

    const resize = () => {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      // A barely-there warmth on each side; the glints do the rest.
      const haze = (x: number) => {
        const gradient = ctx.createRadialGradient(x, height * 0.42, 0, x, height * 0.42, width * 0.3)
        gradient.addColorStop(0, 'rgba(255, 232, 208, 0.035)')
        gradient.addColorStop(0.55, 'rgba(255, 220, 214, 0.012)')
        gradient.addColorStop(1, 'rgba(255, 220, 214, 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }
      haze(width * 0.08)
      haze(width * 0.92)

      for (const glint of glints) {
        const x = wrap(glint.x + glint.driftX * time, band * 0.01, band * 0.99)
        const y = wrap(glint.y + glint.driftY * time, 0.01, 0.99)
        const catchLight = Math.pow(
          Math.max(0, Math.sin((time / glint.period) * Math.PI * 2 + glint.phase)),
          12,
        )
        const alpha = 0.085 + catchLight * (0.2 + glint.depth * 0.42)
        const size = glint.size * (0.85 + catchLight * 0.7) * (0.85 + glint.depth * 0.35)
        const sprite = sprites[glint.tint]
        const drawSize = size * 5.8

        ctx.globalAlpha = alpha
        ctx.drawImage(sprite, x * width - drawSize / 2, y * height - drawSize / 2, drawSize, drawSize)

        // The mirrored glint uses the same phase, so both sides catch the
        // light together and the field stays symmetrical.
        ctx.globalAlpha = alpha
        ctx.drawImage(
          sprite,
          (1 - x) * width - drawSize / 2,
          y * height - drawSize / 2,
          drawSize,
          drawSize,
        )
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const tick = (now: number) => {
      if (!alive) return
      raf = requestAnimationFrame(tick)
      if (last && now - last < 32) return
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      if (!reduced) clock += dt
      render(clock)
    }

    const onResize = () => {
      resize()
      render(clock)
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        return
      }
      if (alive && !raf) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    resize()
    render(0)
    if (!reduced) {
      raf = requestAnimationFrame(tick)
      document.addEventListener('visibilitychange', onVisibility)
    }
    window.addEventListener('resize', onResize)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="glimmer-wrap" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
