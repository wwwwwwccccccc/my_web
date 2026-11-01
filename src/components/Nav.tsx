import { useEffect, useState } from 'react'
import { navItems } from '../data/site'
import VisitStats from './VisitStats'
import type { FolioId } from './Folio'

type Props = {
  folio: FolioId
  onFolioSelect: (id: FolioId) => void
}

export default function Nav({ folio, onFolioSelect }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('')

  useEffect(() => {
    let frame = 0
    const update = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (y < 200) setActive((current) => (current === '' ? current : ''))
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(y / max, 1) : 0)
      frame = 0
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const top = document.getElementById('top')
    const folioEl = document.getElementById('folio')
    if (!top || !folioEl) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const id = visible.target.id
        setActive(id === 'folio' ? folio : id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.2, 0.55] },
    )
    observer.observe(top)
    observer.observe(folioEl)

    const rect = folioEl.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.45) {
      setActive(folio)
    }

    return () => observer.disconnect()
  }, [folio])

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav__inner">
        <a className="brand" href="#top" aria-label="王迧 — 回到顶部">
          <span className="brand__cn">
            王迧<span className="brand__dot">.</span>
          </span>
          <span className="brand__en">BASEBAND / EMBEDDED / WEB</span>
        </a>

        <nav className="nav__links" aria-label="主要导航">
          {navItems.map((item) => {
            const isFolio = item.id === 'archive' || item.id === 'works'
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav__link${active === item.id ? ' is-active' : ''}`}
                aria-current={active === item.id ? 'true' : undefined}
                onClick={(event) => {
                  if (!isFolio) return
                  event.preventDefault()
                  setActive(item.id)
                  onFolioSelect(item.id as FolioId)
                }}
              >
                <span className="nav__index">{item.index}</span>
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="nav__actions">
          <VisitStats />
        </div>
      </div>
      <div className="nav__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  )
}
