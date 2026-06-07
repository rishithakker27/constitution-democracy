import './Findings.css'

const stats = [
  { val: '11.6%',   label: 'Constitutional model R²',      sub: 'OOF R² — 5-fold country-blocked CatBoost (Step 3)', highlight: true },
  { val: '10.7%',   label: '#1 feature: Political competition', sub: 'Top constitutional predictor by SHAP importance', highlight: true },
  { val: '+0.49',   label: 'Age–gap correlation',            sub: 'Older constitutions dramatically outperform their text', highlight: false },
  { val: '0.96×',   label: 'Q5 conversion rate',             sub: 'Most ambitious constitutions deliver below their own promise', highlight: false },
  { val: '+0.33',   label: 'R² lift from culture',           sub: 'Adding EIU culture index: 0.116 → 0.401', highlight: false },
]

const findings = [
  {
    icon: '📜',
    title: 'Constitutional Text Has Real Predictive Power…',
    body: 'Trained on 14 GPT-coded constitutional dimensions across 178 countries (1789–2023), CatBoost achieves OOF R² = 0.116 with 5-fold country-blocked CV — formal text is a genuine, if partial, signal of democratic outcomes.',
    primary: true,
  },
  {
    icon: '🏆',
    title: '…Led by Political Competition & Accountability',
    body: 'Political competition (10.7%), institutional accountability (9.2%), civil liberties (8.7%), emergency-power constraints (8.7%), and civilian security control (8.6%) are the five strongest constitutional predictors by SHAP importance.',
    primary: true,
  },
  {
    icon: '🕰',
    title: 'Age Beats Ambition',
    body: 'Constitutions 60+ years old outperform their text by +0.36 V-Dem points on average. Post-2005 constitutions are the most rights-laden yet fall short of prediction (gap = −0.06) — newer text is increasingly aspirational.',
    primary: false,
  },
  {
    icon: '🔄',
    title: 'Recovery, Not Amendment, Closes the Gap',
    body: 'For deep-negative countries, actual democracy improves at every lag (t+1→t+5) while the constitutional baseline barely moves. People push back — the text is not the binding constraint.',
    primary: false,
  },
  {
    icon: '🔬',
    title: 'Robustness Check: Culture Dominates Text',
    body: 'Adding the EIU Democratic Culture Index triples R² to 0.40, with culture alone contributing 38% of feature importance. This confirms constitutional text is a real but limited predictor — historical democratic culture is the dominant underlying force.',
    primary: false,
    comparison: true,
  },
]

export default function Findings() {
  return (
    <section id="findings" className="findings">
      <div className="section-wrap">
        <div className="section-label">Key Findings</div>
        <h2 className="findings__heading">What the Model Reveals</h2>

        <div className="findings__stats">
          {stats.map(s => (
            <div key={s.label} className={`findings__stat-card${s.highlight ? ' findings__stat-card--primary' : ''}`}>
              <div className="findings__stat-val">{s.val}</div>
              <div className="findings__stat-label">{s.label}</div>
              <div className="findings__stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="findings__grid">
          {findings.map(f => (
            <div
              key={f.title}
              className={`findings__card${f.primary ? ' findings__card--primary' : ''}${f.comparison ? ' findings__card--comparison' : ''}`}
            >
              <div className="findings__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              {f.comparison && (
                <div className="findings__comparison-tag">Robustness comparison — Step 8</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
