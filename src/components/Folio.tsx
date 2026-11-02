import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Archive from './Archive'
import type { Project } from '../data/site'

export type FolioId = 'archive' | 'works'

const Works = lazy(() => import('./Works'))

type Props = {
  active: FolioId
  onChange: (id: FolioId) => void
  onOpenProject: (project: Project) => void
}

export default function Folio({ active, onChange, onOpenProject }: Props) {
  const archiveRef = useRef<HTMLDivElement>(null)
  const worksRef = useRef<HTMLDivElement>(null)
  const [worksVisited, setWorksVisited] = useState(active === 'works')

  useEffect(() => {
    if (active === 'works') setWorksVisited(true)
  }, [active])

  useEffect(() => {
    const panel = active === 'archive' ? archiveRef.current : worksRef.current
    if (panel) panel.scrollTop = 0
  }, [active])

  const next: FolioId = active === 'archive' ? 'works' : 'archive'
  const nextLabel = next === 'works' ? '快生活' : '慢档案'

  return (
    <section className="folio" id="folio" aria-label="慢档案与快生活">
      <div className="folio__viewport">
        <div
          className="folio__track"
          style={{ transform: active === 'archive' ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <div
            ref={archiveRef}
            className="folio__panel"
            data-panel="archive"
            aria-hidden={active !== 'archive'}
            inert={active !== 'archive'}
          >
            <Archive />
          </div>
          <div
            ref={worksRef}
            className="folio__panel"
            data-panel="works"
            aria-hidden={active !== 'works'}
            inert={active !== 'works'}
          >
            {worksVisited ? (
              <Suspense
                fallback={
                  <div className="folio__loading" role="status">
                    <span className="mono">02 / WORKS</span>
                    <span>LOADING PROJECTS</span>
                  </div>
                }
              >
                <Works onOpen={onOpenProject} />
              </Suspense>
            ) : null}
          </div>
        </div>
      </div>

      <div className="folio__rail">
        <span className="mono folio__count">{active === 'archive' ? '01 / 02' : '02 / 02'}</span>
        <button
          type="button"
          className="folio__arrow"
          onClick={() => onChange(next)}
          aria-label={`切换到${nextLabel}`}
        >
          <span aria-hidden="true">{active === 'archive' ? '→' : '←'}</span>
        </button>
      </div>
    </section>
  )
}
