import { useEffect, useState } from 'react'

type Status = 'loading' | 'ready' | 'error'

const VISIT_ENDPOINT = import.meta.env.VITE_VISIT_API || '/api/visit'

let visitPromise: Promise<number> | null = null

function requestVisitCount(): Promise<number> {
  if (!visitPromise) {
    visitPromise = fetch(VISIT_ENDPOINT, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`visit api ${response.status}`)
        const data = (await response.json()) as { count?: unknown }
        if (typeof data.count !== 'number' || !Number.isFinite(data.count)) {
          throw new Error('invalid visit response')
        }
        return data.count
      })
      .catch((error) => {
        visitPromise = null
        throw error
      })
  }
  return visitPromise
}

export default function VisitStats() {
  const [count, setCount] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let alive = true
    requestVisitCount()
      .then((next) => {
        if (!alive) return
        setCount(next)
        setStatus('ready')
      })
      .catch(() => {
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [])

  const display = status === 'loading' ? '···' : status === 'error' || count === null ? '—' : count.toLocaleString('en-US')

  return (
    <div
      className="nav__cta nav__stats"
      aria-label={count === null ? '全站累计访问次数暂不可用' : `全站累计访问 ${display} 次`}
      title={status === 'error' ? '访问统计暂时不可用' : '全站累计访问次数'}
    >
      <span className="status-dot" aria-hidden="true" />
      <span>累计访问次数</span>
      <span className="nav__count mono" aria-live="polite">{display}</span>
    </div>
  )
}
