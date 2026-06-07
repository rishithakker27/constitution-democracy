import './AgePatterns.css'

const findings = [
  {
    stat: '+0.36',
    label: 'Average gap for constitutions 60+ years old',
    desc: 'Countries whose constitutions have survived more than six decades consistently outperform what their text alone predicts — suggesting that longevity selects for constitutions matched to their societies.',
  },
  {
    stat: '−0.06',
    label: 'Average gap for post-2005 constitutions',
    desc: 'Newer constitutions are the most rights-laden yet fall slightly short of prediction on average. More ambitious text does not translate automatically into democratic delivery.',
  },
  {
    stat: '+0.49',
    label: 'Pearson r — constitutional age vs. gap',
    desc: 'A strong positive correlation: the older the constitution, the larger the positive gap. Age is the single structural variable most predictive of constitutional over-performance.',
  },
]

export default function AgePatterns() {
  return (
    <section id="age" className="age">
      <div className="section-wrap">
        <div className="section-label">Step 6 — Pattern Analysis</div>
        <h2 className="age__heading">Constitutional Age &amp; Inflation</h2>
        <p className="age__sub">
          Two structural findings emerge when we look beyond raw text. First, older constitutions
          dramatically outperform their promise. Second, post-2005 constitutions have become
          increasingly aspirational — encoding more rights without delivering more democracy.
        </p>

        {/* ── Stat row ── */}
        <div className="age__stats">
          {findings.map(f => (
            <div key={f.label} className="age__stat-card">
              <div className="age__stat-val">{f.stat}</div>
              <div className="age__stat-label">{f.label}</div>
              <p className="age__stat-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Images ── */}
        <div className="age__charts">
          <div className="age__chart-panel">
            <div className="age__chart-label">Constitutional age vs. democracy gap</div>
            <img src="/age_gap.png" alt="Constitutional age vs democracy gap scatter"
              className="age__img" />
            <p className="age__img-caption">
              Each dot is a country. Older constitutions (right) cluster above the zero line —
              they outperform what their text predicts. Newer ones (left) cluster below.
            </p>
          </div>
          <div className="age__chart-panel">
            <div className="age__chart-label">Constitutional inflation by drafting era</div>
            <img src="/age_inflation.png" alt="Constitutional inflation by era"
              className="age__img" />
            <p className="age__img-caption">
              Post-Cold War and post-2005 constitutions encode far more rights
              but show declining average democracy relative to those promises.
            </p>
          </div>
        </div>

        {/* ── Interpretation ── */}
        <div className="age__interpretation">
          <div className="age__interp-icon">💡</div>
          <div>
            <div className="age__interp-title">What this means</div>
            <p className="age__interp-body">
              The gap between constitutional promise and democratic reality is not random —
              it has a clear structural direction. Old constitutions outperform because they
              survived only by being matched to real institutions. New constitutions import
              global rights norms regardless of local conditions, creating a systematic
              optimism gap. Text alone cannot build democracy; time and institutional fit can.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
