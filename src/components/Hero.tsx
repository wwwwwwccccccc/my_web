import { profile } from '../data/site'
import { useClock } from '../hooks/useClock'
import { asset } from '../lib/asset'
import TechText from './TechText'

export default function Hero() {
  const time = useClock()

  return (
    <section className="hero" id="top" aria-label="首页">
      <div className="hero__media" aria-hidden="true">
        <img
          className="hero__image"
          src={asset('/images/hero-shanghai.webp')}
          srcSet={`${asset('/images/hero-shanghai-mobile.webp')} 800w, ${asset('/images/hero-shanghai.webp')} 1279w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="hero__warm" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__inner shell">
        <div className="hero__center">
          <p className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            <span>OPEN TO OPPORTUNITIES</span>
            <span className="hero__badge-sep" aria-hidden="true">/</span>
            <span>2026—27</span>
          </p>

          <h1 className="sr-only">Hi，这里是W</h1>

          <div className="hero__tech" aria-hidden="true">
            <div className="hero__tech-line">
              <TechText
                text="Hi，这里是"
                fontFamily="DIN, Xingkai"
                fontWeight={400}
                fontSize={165}
                letterSpacing={-0.01}
                align="center"
                color="#f6f2e9"
                accentColor="#ff9fcf"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={10}
                selection
                labels={false}
                draggable
                clickKick
                intro="type"
                introDuration={1.9}
                guides={false}
                sweep
                speed={0.45}
              />
            </div>
            <div className="hero__tech-line hero__tech-line--second">
              <TechText
                text="W"
                fontFamily="Xingkai"
                fontWeight={400}
                fontSize={165}
                letterSpacing={0}
                align="center"
                color="#f6f2e9"
                accentColor="#ff9fcf"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={6}
                selection
                labels={false}
                draggable
                clickKick
                intro="type"
                introDuration={1.2}
                guides={false}
                sweep={false}
              />
            </div>
          </div>
        </div>

        <div className="hero__bottom">
          <span className="mono">
            {profile.cityEn.toUpperCase()} — {profile.coordinates}
          </span>
          <a className="hero__scroll" href="#about">
            <span>SCROLL TO EXPLORE</span>
            <span className="hero__scroll-line" aria-hidden="true" />
          </a>
          <div className="hero__meta-right">
            <span className="mono">{time}</span>
            <span className="mono">FOLIO / 001</span>
          </div>
        </div>
      </div>
    </section>
  )
}
