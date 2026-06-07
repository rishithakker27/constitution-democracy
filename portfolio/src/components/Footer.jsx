import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="section-wrap footer__inner">
        <div className="footer__left">
          <div className="footer__name">Rishi Thakker</div>
          <div className="footer__bio">Dartmouth &apos;27 · Government &amp; Quantitative Social Science</div>
          <div className="footer__note">
            Data: CCPCNC v5, V-Dem v13, EIU Democracy Index.<br />
            Models: CatBoost (country-blocked CV). Coded with GPT-o1 &amp; Claude.
          </div>
        </div>
        <div className="footer__links">
          <div className="footer__links-col">
            <div className="footer__links-head">Resources</div>
            <a href="#" className="footer__link">
              Paper <span className="footer__soon">coming soon</span>
            </a>
            <a href="#" className="footer__link">
              GitHub <span className="footer__soon">coming soon</span>
            </a>
          </div>
          <div className="footer__links-col">
            <div className="footer__links-head">Sections</div>
            <a href="#methodology" className="footer__link">Methodology</a>
            <a href="#findings"    className="footer__link">Key Findings</a>
            <a href="#demo"        className="footer__link">Live Demo</a>
            <a href="#models"      className="footer__link">Models</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="section-wrap">
          QSS 45 · Dartmouth College · 2025
        </div>
      </div>
    </footer>
  )
}
