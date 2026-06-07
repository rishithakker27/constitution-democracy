import './Methodology.css'

const steps = [
  {
    num: '1',
    tag: 'LLM Coding',
    title: 'Constitutional Variable Mapping',
    desc: 'GPT-4o (Dartmouth Cloud API, T=0) reads the CCPCNC v5 codebook and assigns 731 of 1,175 constitutional variables to 14 theoretical dimensions, with weights (0.5–3.0) and binary 0–1 value maps per response code.',
    out: 'ccpc_typology_v4.json',
    color: '#c084fc',
  },
  {
    num: '2',
    tag: 'Scoring',
    title: 'Dimension Score Computation',
    desc: 'Applies the LLM typology via weighted average across all ~17,000 CCPCNC v5 country-year observations. Missing/inapplicable codes are excluded; explicit "No" answers count as 0. Produces 14 normalized scores (0–1) per country-year.',
    out: 'ccpc_axis_scores_llm.csv',
    color: '#60a5fa',
  },
  {
    num: '3',
    tag: 'CatBoost · K-Fold',
    title: 'Constitutional Baseline Model',
    desc: '5-fold country-blocked CatBoost (depth=2, 1,000 iters) predicts V-Dem v2x_polyarchy from the 14 dimension scores. The out-of-fold residual (actual − predicted) is the "constitutional gap."',
    out: 'OOF R² = 0.116',
    color: '#34d399',
  },
  {
    num: '4',
    tag: 'Lead-Lag',
    title: 'Predictive Signal Analysis',
    desc: 'CatBoost predicts Δv2x_polyarchy at t+1 to t+5 using [gap, current polyarchy]. Episode validation shows gap is −0.11 three years before known backsliding onsets vs. +0.03 for stable years.',
    out: 'OOF R² 0.006 → 0.035',
    color: '#f59e0b',
  },
  {
    num: '5',
    tag: 'Analysis',
    title: 'Constitutional Ambition vs. Delivery',
    desc: 'Tests whether higher constitutional promise predicts more democracy. OLS slope = 0.49 — each unit of constitutional promise yields only 0.49 units of actual democracy. High-ambition constitutions underdeliver.',
    out: 'Conversion rate collapses at Q5',
    color: '#f472b6',
  },
  {
    num: '6',
    tag: 'Pattern Analysis',
    title: 'Age & Era Patterns',
    desc: 'Examines constitutional age and drafting era. Older constitutions massively outperform their text (60+ yr gap = +0.36). Post-2005 constitutions are increasingly aspirational (gap = −0.06).',
    out: 'r(age, gap) = +0.49',
    color: '#38bdf8',
  },
  {
    num: '7',
    tag: 'Typology',
    title: 'Culture × Constitution Interaction',
    desc: 'Adds EIU Democratic Culture Index. Culture alone explains 33% of variance vs. 4% for constitution. 2×2 typology classifies countries as Stable, Ripe for Change, Stuck Autocracy, or Fragile Democracy.',
    out: 'Combined R² = 0.36',
    color: '#a78bfa',
  },
  {
    num: '8',
    tag: 'Final Model',
    title: 'Culture-Augmented CatBoost',
    desc: 'Adding democratic culture (EIU) to CatBoost triples predictive power. Culture alone accounts for 38% of feature importance — far outweighing any single constitutional dimension.',
    out: 'OOF R² = 0.40 (+0.33 lift)',
    color: '#00693e',
  },
]

export default function Methodology() {
  return (
    <section id="methodology">
      <div className="section-wrap">
        <div className="section-label">Methodology</div>
        <h2 className="meth__heading">An 8-Step LLM + ML Pipeline <span className="meth__steps-note">(Steps 1–8)</span></h2>
        <p className="meth__sub">
          From raw constitutional text to a predictive democracy model — fully reproducible,
          country-blocked cross-validation throughout.
        </p>

        <div className="meth__grid">
          {steps.map((s) => (
            <div key={s.num} className="meth__card">
              <div className="meth__num" style={{ color: s.color }}>{s.num}</div>
              <div className="meth__tag" style={{ color: s.color, borderColor: `${s.color}33`, background: `${s.color}11` }}>
                {s.tag}
              </div>
              <h3 className="meth__title">{s.title}</h3>
              <p className="meth__desc">{s.desc}</p>
              <div className="meth__out">
                <span className="meth__out-label">Output</span>
                <code className="meth__out-val">{s.out}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
