import { useEffect, useRef, useState } from 'react'

type VisitData = {
  count: number
  first: string
  last: string
}

const STORAGE_KEY = 'wp-visit-stats'
const SESSION_KEY = 'wp-visit-session'

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return '—'
  }
}

function readVisit(): VisitData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<VisitData>
    if (typeof parsed.count !== 'number') return null
    return {
      count: parsed.count,
      first: typeof parsed.first === 'string' ? parsed.first : '',
      last: typeof parsed.last === 'string' ? parsed.last : '',
    }
  } catch {
    return null
  }
}

export default function VisitStats() {
  const [data, setData] = useState<VisitData | null>(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const now = new Date().toISOString()
    let current = readVisit()

    if (!current) {
      current = { count: 0, first: now, last: now }
    }

    try {
      const counted = window.sessionStorage.getItem(SESSION_KEY)
      if (!counted) {
        current = {
          count: current.count + 1,
          first: current.first || now,
          last: now,
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
        window.sessionStorage.setItem(SESSION_KEY, '1')
      }
    } catch {
      // localStorage / sessionStorage may be unavailable; show what we have.
    }

    setData(current)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const count = data ? String(data.count).padStart(3, '0') : '···'

  return (
    <div className="visit" ref={rootRef}>
      <button
        type="button"
        className="nav__cta nav__stats"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="visit-panel"
      >
        <span className="status-dot" aria-hidden="true" />
        <span>累计访问人数</span>
        <span className="nav__count mono">{ready ? count : '···'}</span>
      </button>

      {open ? (
        <div className="visit-panel" id="visit-panel" role="dialog" aria-label="累计访问人数">
          <div className="visit-panel__head">
            <span className="mono">VISIT LOG / 浏览记录</span>
            <span className="mono">LOCAL</span>
          </div>
          <div className="visit-panel__count">
            <b>{count}</b>
            <span>本机累计访问</span>
          </div>
          <dl className="visit-panel__meta">
            <div>
              <dt>首次访问</dt>
              <dd>{formatDate(data?.first ?? '')}</dd>
            </div>
            <div>
              <dt>最近访问</dt>
              <dd>{formatDate(data?.last ?? '')}</dd>
            </div>
          </dl>
          <p className="visit-panel__note">
            仅保存在当前浏览器，统计的是本机访问次数，不是全站真实人数；不上传服务器。
          </p>
        </div>
      ) : null}
    </div>
  )
}
