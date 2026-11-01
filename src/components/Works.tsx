import SectionHead from './SectionHead'
import { projects, type Project } from '../data/site'
import { asset } from '../lib/asset'

type Props = {
  onOpen: (project: Project) => void
}

export default function Works({ onOpen }: Props) {
  return (
    <section className="section works" id="works" aria-labelledby="works-title">
      <div className="shell">
        <SectionHead
          index="02"
          label="WORKS / 快生活"
          title={
            <span id="works-title">
              把复杂的系统，
              <br />
              做成<em>可靠</em>的软件。
            </span>
          }
          intro="从工业视觉、异构算力到车载系统与 Web 产品——四个项目，四种把问题拆开、实现、交付的路径。点击任意卡片，查看项目背景、职责与技术栈。"
        />

        <div className="works__bar" data-reveal>
          <span className="mono">2023 — 2026 / 04 PROJECTS</span>
          <span className="mono works__bar-hint">CLICK A CARD TO OPEN THE CASE</span>
        </div>

        <div className="works__grid">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`work work--${project.layout}`}
              onClick={() => onOpen(project)}
              aria-label={`查看项目：${project.title}，${project.subtitle}`}
              data-reveal
            >
              <div className="work__media">
                <img
                  className="work__img"
                  src={asset(project.cover)}
                  alt={project.alt}
                  loading={project.layout === 'feature' ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="work__shade" aria-hidden="true" />
                <span className="work__view" aria-hidden="true">
                  查看案例 <span>↗</span>
                </span>
              </div>
              <div className="work__caption">
                <div className="work__info">
                  <span className="work__meta mono">
                    {project.index} — {project.category} / {project.year}
                  </span>
                  <h3 className="work__title">
                    {project.title}
                    <span className="work__subtitle">{project.subtitle}</span>
                  </h3>
                  <div className="work__tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <span className="work__circle" aria-hidden="true">
                  ↗
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
