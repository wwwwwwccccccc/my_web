import type { ReactNode } from 'react'

type Props = {
  index?: string
  label: string
  title: ReactNode
  intro?: ReactNode
}

export default function SectionHead({ index, label, title, intro }: Props) {
  return (
    <header className="section-head" data-reveal>
      <div className="section-head__meta">
        {index ? <span className="section-head__index">{index}</span> : null}
        <span className="section-head__label">{label}</span>
      </div>
      <div className="section-head__main">
        <h2 className="section-head__title">{title}</h2>
        {intro ? <p className="section-head__intro">{intro}</p> : null}
      </div>
    </header>
  )
}
