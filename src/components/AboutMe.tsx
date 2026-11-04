import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/site'
import { asset } from '../lib/asset'

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E'

export default function About() {
  const portraitRef = useRef<HTMLImageElement>(null)
  const [portraitSrc, setPortraitSrc] = useState(PLACEHOLDER)

  useEffect(() => {
    const node = portraitRef.current
    if (!node) return undefined
    if (!('IntersectionObserver' in window)) {
      setPortraitSrc(asset('/images/about-portrait.webp'))
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPortraitSrc(asset('/images/about-portrait.webp'))
          observer.disconnect()
        }
      },
      { rootMargin: '0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="shell">
        <div className="about__card" data-reveal>
          <figure className="about__portrait">
            <img
              ref={portraitRef}
              src={portraitSrc}
              alt="王迧在苏州东方之门前的照片"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            <figcaption>
              <span className="mono">SUZHOU, 2026</span>
              <span className="mono">ABOUT / 01</span>
            </figcaption>
          </figure>

          <div className="about__body">
            <span className="mono about__eyebrow">ABOUT ME / 关于我</span>
            <h2 id="about-title" className="about__title">
              Hi, I am <em>W!</em>
            </h2>
            <p className="about__lead">
              希望代码不仅可以量化我的工作，
              <br />
              更可以量化我的生活
            </p>
            {/* <p className="about__desc">
              白天写基带软件，晚上把生活慢慢归档。关心系统如何运行，也关心日子如何被记住。
            </p> */}

            <dl className="about__facts">
              <div>
                <dt>当前身份</dt>
                <dd>{profile.role}</dd>
              </div>
              <div>
                <dt>工作方向</dt>
                <dd>{profile.tags.join(' · ')}</dd>
              </div>
              <div>
                <dt>电话</dt>
                <dd>{profile.phoneMasked}</dd>
              </div>
              <div>
                <dt>邮箱</dt>
                <dd>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </dd>
              </div>
            </dl>

            <div className="about__tags">
              <span className="mono">NOW BUILDING / 现在关注</span>
              <div className="about__tag-list">
                {profile.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
