import './Hero.css'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="section-wrap hero__content">
        <div className="hero__eyebrow section-label">QSS 45 · Dartmouth College · 2025</div>
        <h1 className="hero__title">
          Do Constitutions<br />
          <span className="hero__accent">Predict Democracy?</span>
        </h1>
        <p className="hero__sub">
          I use a GPT-coded typology and CatBoost to measure how well a country's
          constitutional text predicts its actual democratic outcomes —
          and where that prediction systematically fails.
        </p>
        <div className="hero__actions">
          <a href="#demo" className="hero__cta hero__cta--primary">
            Explore Live Demo
          </a>
          <a href="#" className="hero__cta hero__cta--ghost" aria-label="Paper coming soon">
            Read Paper ↗
          </a>
          <a href="#" className="hero__cta hero__cta--ghost" aria-label="GitHub coming soon">
            GitHub ↗
          </a>
        </div>

        <div id="about" className="hero__about">
          <div className="hero__avatar" aria-label="Rishi Thakker">RT</div>
          <div>
            <div className="hero__name">Rishi Thakker</div>
            <div className="hero__bio">
              Dartmouth &apos;27 · Government &amp; Quantitative Social Science
            </div>
          </div>
        </div>

        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-num">178</span>
            <span className="hero__stat-lbl">Countries</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">234</span>
            <span className="hero__stat-lbl">Years (1789–2023)</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">13,208</span>
            <span className="hero__stat-lbl">Country-years</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">731</span>
            <span className="hero__stat-lbl">Constitutional vars</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">14</span>
            <span className="hero__stat-lbl">Dimensions scored</span>
          </div>
        </div>
      </div>
    </section>
  )
}
