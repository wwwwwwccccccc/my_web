import { useEffect, useRef } from 'react'
import SectionHead from './SectionHead'
import FlexCarousel, { type FlexCarouselItem } from './FlexCarousel'
import { projects, type Project } from '../data/site'
import { asset } from '../lib/asset'

type Props = {
  onOpen: (project: Project) => void
}

export default function Works({ onOpen }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nodes = sectionRef.current?.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!nodes?.length) return undefined
    const frame = requestAnimationFrame(() => {
      nodes.forEach((node) => node.classList.add('is-inview'))
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const carouselItems: FlexCarouselItem[] = projects.map((project) => ({
    src: asset(project.cover),
    alt: project.alt,
    title: project.title,
    subtitle: project.subtitle,
  }))

  const projectCount = String(projects.length).padStart(2, '0')
  const years = projects
    .map((project) => Number.parseInt(project.year, 10))
    .filter((year) => Number.isFinite(year))
  const yearRange = years.length ? `${Math.min(...years)} — ${Math.max(...years)}` : '2023 — 2026'

  return (
    <section ref={sectionRef} className="section works" id="works" aria-labelledby="works-title">
      <div className="shell">
        <SectionHead
          index="02"
          label="WORKS / 快生活"
          title={
            <span id="works-title">
              在快节奏的生活中，
              <br />
              留下扎实的痕迹
            </span>
          }
        />

        <div className="works__bar" data-reveal>
          <span className="mono">{yearRange} / {projectCount} PROJECTS</span>
          <span className="mono works__bar-hint">DRAG / SCROLL · CLICK A CARD TO OPEN</span>
        </div>

        <div className="works__carousel" data-reveal>
          <FlexCarousel
            items={carouselItems}
            preset="liquid"
            intro="rise"
            cardHeight={0.64}
            gap={16}
            radius={4}
            fit="natural"
            squeeze={0.18}
            autoplay
            autoplaySpeed={32}
            focusOnClick={false}
            selectAnyClick
            captions={false}
            cardLabels
            captureWheel={false}
            ariaLabel="快生活项目展示"
            onSelect={(index) => {
              const project = projects[index]
              if (project) onOpen(project)
            }}
          />
        </div>

        <p className="works__hint" data-reveal>
          <span className="mono">SELECTED WORKS / 2023—26</span>
          <span>拖动图片，或使用 ← → 浏览；点击图片打开案例，照片下方是对应项目名称。</span>
        </p>
      </div>
    </section>
  )
}
