import { useEffect, useRef } from 'react'
import { profile, type Project } from '../data/site'
import { asset } from '../lib/asset'

type Props = {
  project: Project | null
  onClose: () => void
}

export default function ProjectDialog({ project, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!project) return
    previousFocus.current = document.activeElement as HTMLElement | null
    document.body.classList.add('is-locked')
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    const id = window.setTimeout(() => closeRef.current?.focus(), 30)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(id)
      document.body.classList.remove('is-locked')
      previousFocus.current?.focus?.()
    }
  }, [project, onClose])

  if (!project) return null

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-dialog-title"
    >
      <div className="modal__scrim" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel" ref={panelRef}>
        <button
          ref={closeRef}
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="关闭项目详情"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <div className="modal__media">
          <img className="modal__media-bg" src={asset(project.cover)} alt="" aria-hidden="true" />
          <img
            className="modal__media-img"
            src={asset(project.cover)}
            alt={project.alt}
            style={{ objectPosition: project.focus ?? '50% 50%' }}
          />
          <span className="modal__media-index mono">{project.index}</span>
          <a
            className="modal__full mono"
            href={asset(project.cover)}
            target="_blank"
            rel="noreferrer"
          >
            查看完整封面 <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="modal__content">
          <span className="modal__meta mono">
            {project.category} — {project.year}
          </span>
          <h2 className="modal__title" id="project-dialog-title">
            {project.title}
          </h2>
          <p className="modal__subtitle">{project.subtitle}</p>

          <div className="modal__text">
            {project.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="modal__facts">
            {project.facts.map((fact) => (
              <div className="modal__fact" key={fact.label}>
                <dt className="mono">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="modal__tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="modal__actions">
            <a className="btn btn--solid" href={`mailto:${profile.email}`}>
              聊聊类似的项目 <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className="modal__text-close" onClick={onClose}>
              返回作品列表
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
