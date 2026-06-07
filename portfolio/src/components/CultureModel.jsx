import './CultureModel.css'

const lift = [
  { label: 'Step 3 — Constitution only (all years, OOF)',      r2: '17.3%', note: 'True OOF R² across 158 countries', primary: true },
  { label: 'Step 8a — Constitution only (EIU window, OOF)',    r2: '9.0%',  note: 'Fair OOF on EIU-window subset (2006–2023)', primary: false },
  { label: 'Step 8b — Constitution + Culture (EIU OOF)',       r2: '37.0%', note: 'Adding EIU Democratic Culture Index', primary: false, highlight: true },
]

export default function CultureModel() {
  return (
    <section id="culture" className="culture">
      <div className="section-wrap">
        <div className="section-label">Step 8 — Final Model</div>
        <h2 className="culture__heading">Adding Democratic Culture</h2>
        <p className="culture__sub">
          Constitutional text is a real but limited predictor. When we add the EIU Democratic
          Culture Index — a country's historical democratic norms and civic engagement — predictive
          power triples. This is the robustness check that frames the interpretation of everything above.
        </p>

        {/* ── R² lift cards ── */}
        <div className="culture__lift-row">
          {lift.map(m => (
            <div key={m.label} className={`culture__lift-card${m.highlight ? ' culture__lift-card--highlight' : ''}`}>
              <div className="culture__lift-r2">{m.r2}</div>
              <div className="culture__lift-label">{m.label}</div>
              <div className="culture__lift-note">{m.note}</div>
            </div>
          ))}
        </div>

        {/* ── Images ── */}
        <div className="culture__charts">
          <div className="culture__chart-panel culture__chart-panel--wide">
            <div className="culture__chart-label">R² comparison across model specifications</div>
            <img src="/culture_r2.png" alt="R² model comparison" className="culture__img" />
            <p className="culture__img-caption">
              Step 3 (constitution only) is the primary result. The jump to Step 8b shows how much
              democratic culture absorbs — but this is a robustness check, not the main claim.
            </p>
          </div>
          <div className="culture__chart-panel">
            <div className="culture__chart-label">Feature importance — constitution + culture model</div>
            <img src="/culture_feat_imp.png" alt="Culture model feature importances" className="culture__img" />
            <p className="culture__img-caption">
              Democratic culture (EIU) accounts for ~38% of feature importance — more than any
              single constitutional dimension. Political competition remains the top constitutional predictor.
            </p>
          </div>
          <div className="culture__chart-panel">
            <div className="culture__chart-label">Gap comparison — constitutional vs. culture-adjusted</div>
            <img src="/culture_gap.png" alt="Gap comparison" className="culture__img" />
            <p className="culture__img-caption">
              Culture-adjusted predictions narrow the gap for most countries,
              particularly those whose democratic performance reflects entrenched civic norms
              not captured by formal text.
            </p>
          </div>
        </div>

        {/* ── Takeaway ── */}
        <div className="culture__takeaway">
          <div className="culture__takeaway-grid">
            <div className="culture__takeaway-item">
              <div className="culture__takeaway-icon">📜</div>
              <div className="culture__takeaway-title">Constitutional text</div>
              <div className="culture__takeaway-r2">R² = 0.1734</div>
              <p>Real, measurable signal. Political competition, rule of law, and judicial independence clauses move the needle.</p>
            </div>
            <div className="culture__takeaway-arrow">+</div>
            <div className="culture__takeaway-item">
              <div className="culture__takeaway-icon">🏛</div>
              <div className="culture__takeaway-title">Democratic culture</div>
              <div className="culture__takeaway-r2">+38% importance</div>
              <p>Historical civic norms (EIU index) dominate. Constitutions that match their culture outperform; those that don't, underperform.</p>
            </div>
            <div className="culture__takeaway-arrow">=</div>
            <div className="culture__takeaway-item culture__takeaway-item--result">
              <div className="culture__takeaway-icon">⚖️</div>
              <div className="culture__takeaway-title">Combined model</div>
              <div className="culture__takeaway-r2">R² = 0.3695</div>
              <p>Text + culture together explain 37% of democratic variation. The gap between them is where democratic change lives.</p>
            </div>
          </div>
          <p className="culture__takeaway-caveat">
            Note: EIU culture data covers 2006–2023 only. The culture model is a robustness check
            on a restricted sample — the Step 3 constitutional model remains the primary result.
          </p>
        </div>
      </div>
    </section>
  )
}
