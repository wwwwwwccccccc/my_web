import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import AboutMe from './components/AboutMe'
import Folio, { type FolioId } from './components/Folio'
import EndNote from './components/EndNote'
import ProjectDialog from './components/ProjectDialog'
import GlimmerWrap from './components/GlimmerWrap'
import SmoothCursor from './components/SmoothCursor'
import type { Project } from './data/site'

export default function App() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [folio, setFolio] = useState<FolioId>('archive')

  const selectFolio = (id: FolioId) => {
    setFolio(id)
    const folioEl = document.getElementById('folio')
    if (folioEl) {
      folioEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const panel = document.querySelector<HTMLElement>(`.folio__panel[data-panel="${id}"]`)
    if (panel) panel.scrollTop = 0
  }

  // One global reveal observer for every [data-reveal] element on the page.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (reduced) {
      nodes.forEach((node) => node.classList.add('is-inview'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <div className="grain" aria-hidden="true" />
      <GlimmerWrap />
      <SmoothCursor />
      <Nav folio={folio} onFolioSelect={selectFolio} />
      <main id="main">
        <Hero />
        <AboutMe />
        <Folio active={folio} onChange={setFolio} onOpenProject={setActiveProject} />
      </main>
      <EndNote />
      <ProjectDialog project={activeProject} onClose={() => setActiveProject(null)} />
    </>
  )
}
