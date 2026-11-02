import type { ReactNode } from 'react'

type Props = {
  index?: string
  label: string
  title: ReactNode
  intro?: ReactNode
}

export default function SectionHead({ index, label, title, intro }: Props) {
  const [labelEn, labelCn] = label.includes(' / ') ? label.split(' / ') : ['', label]

  return (
    <header className="section-head" data-reveal>
      <div className="section-head__meta">
        {index ? <span className="section-head__index">{index}</span> : null}
        <span className="section-head__meta-text">
          <span className="section-head__label">{labelCn}</span>
          {labelEn ? <span className="section-head__label-en">{labelEn}</span> : null}
        </span>
      </div>
      <div className="section-head__main">
        <h2 className="section-head__title">{title}</h2>
        {intro ? <p className="section-head__intro">{intro}</p> : null}
      </div>
    </header>
  )
}
