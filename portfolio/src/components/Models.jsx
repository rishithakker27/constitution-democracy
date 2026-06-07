import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import featureImportances from '../data/feature_importances.json'
import './Models.css'

const TARGET_OPTIONS = [
  { value: 'polyarchy',  label: 'Electoral Democracy (Polyarchy)' },
  { value: 'libdem',     label: 'Liberal Democracy' },
  { value: 'egaldem',    label: 'Egalitarian Democracy' },
  { value: 'partipdem',  label: 'Participatory Democracy' },
  { value: 'delibdem',   label: 'Deliberative Democracy' },
]

function featureColor(idx) {
  if (idx < 2) return '#34d399'
  if (idx < 5) return '#60a5fa'
  return '#8fa3bb'
}

const r2Data = [
  { model: 'Electoral\nDemocracy\n(Polyarchy)',  r2: 0.0541, color: '#34d399' },
  { model: 'Liberal\nDemocracy',                 r2: 0.0606, color: '#60a5fa' },
  { model: 'Egalitarian\nDemocracy',             r2: 0.0726, color: '#a78bfa' },
  { model: 'Participatory\nDemocracy',           r2: 0.0763, color: '#f472b6' },
  { model: 'Deliberative\nDemocracy',            r2: 0.0563, color: '#38bdf8' },
]

const FeatTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="models__tooltip">
      <div style={{ fontWeight: 700 }}>{d.label}</div>
      <div style={{ color: '#34d399' }}>{d.importance.toFixed(2)}% importance</div>
    </div>
  )
}

const R2Tooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="models__tooltip">
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label?.replace(/\\n/g, ' ')}</div>
      <div style={{ color: '#34d399' }}>OOF R² = {payload[0].value.toFixed(3)}</div>
    </div>
  )
}

function FeatureImportanceChart({ data, height = 380 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#8fa3bb', fontSize: 11 }}
          tickFormatter={v => `${v}%`} domain={[0, 13]} />
        <YAxis type="category" dataKey="label" width={182} tick={{ fill: '#8fa3bb', fontSize: 11 }} />
        <Tooltip content={<FeatTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="importance" radius={[0, 3, 3, 0]}>
          {data.map((f, i) => <Cell key={f.label} fill={featureColor(i)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function Models() {
  const [featTarget, setFeatTarget] = useState('polyarchy')
  const featData = featureImportances[featTarget]

  return (
    <section id="models" className="models">
      <div className="section-wrap">
        <div className="section-label">Models</div>
        <h2 className="models__heading">Constitutional Model — Performance &amp; Feature Importance</h2>

        {/* ── Row 1: Feature importance (with dropdown) + R²/lag ── */}
        <div className="models__grid">
          <div className="models__panel models__panel--tall">
            <div className="models__panel-header">
              <h3>Feature Importance</h3>
              <select className="models__select" value={featTarget}
                onChange={e => setFeatTarget(e.target.value)}>
                {TARGET_OPTIONS.map(o =>
                  <option key={o.value} value={o.value}>{o.label}</option>
                )}
              </select>
              {featTarget === 'polyarchy' && (
                <span className="models__primary-badge">Primary model</span>
              )}
            </div>
            <p className="models__panel-sub">
              5-fold country-blocked CatBoost on 14 constitutional dimensions.
              Select a target democracy index above to compare feature rankings.
            </p>
            <FeatureImportanceChart data={featData} height={380} />
          </div>

          <div className="models__panels-right">
            <div className="models__panel">
              <h3>Out-of-Fold R² — All Democracy Targets</h3>
              <p className="models__panel-sub">
                Same CatBoost setup (depth=2, 5-fold country-blocked CV) run against all five
                V-Dem democracy indices. Constitutional text predicts electoral democracy best;
                egalitarian democracy least.
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={r2Data} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="model" tick={{ fill: '#8fa3bb', fontSize: 10 }}
                    angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#8fa3bb', fontSize: 11 }}
                    domain={[0, 0.10]} tickFormatter={v => v.toFixed(2)} />
                  <Tooltip content={<R2Tooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="r2" radius={[3, 3, 0, 0]}>
                    {r2Data.map(d => <Cell key={d.model} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 2: Polyarchy vs Liberal Democracy — feature importance comparison ── */}
        <div className="models__comparison-section">
          <div className="section-label" style={{ marginBottom: '0.5rem' }}>Target Comparison</div>
          <h3 className="models__shap-heading">
            Polyarchy vs Liberal Democracy — Feature Importance
          </h3>
          <p className="models__shap-sub">
            Political competition leads for polyarchy; transparency and institutional accountability
            lead for liberal democracy. Executive constraints also rank higher when predicting libdem,
            reflecting the stronger role of formal checks in liberal-democratic theory.
          </p>
          <div className="models__shap-grid">
            <div className="models__panel">
              <div className="models__shap-label models__shap-label--primary">
                Electoral Democracy (Polyarchy) <span>· Step 3 primary</span>
              </div>
              <FeatureImportanceChart data={featureImportances.polyarchy} height={320} />
            </div>
            <div className="models__panel">
              <div className="models__shap-label models__shap-label--libdem">
                Liberal Democracy <span>· Step 3 robustness</span>
              </div>
              <FeatureImportanceChart data={featureImportances.libdem} height={320} />
            </div>
          </div>
        </div>

        {/* ── Row 3: SHAP beeswarms — polyarchy vs libdem ── */}
        <div className="models__shap-section">
          <div className="section-label" style={{ marginBottom: '0.5rem' }}>SHAP Analysis</div>
          <h3 className="models__shap-heading">
            SHAP Beeswarm — Polyarchy vs Liberal Democracy
          </h3>
          <p className="models__shap-sub">
            Each dot is one country-year. Color = feature value (red = high, blue = low).
            Left: predicting electoral democracy — political competition and civil liberties dominate.
            Right: predicting liberal democracy — transparency and institutional accountability
            shift to the top, reflecting the greater weight of rule-of-law in liberal theory.
          </p>
          <div className="models__shap-grid">
            <div className="models__shap-panel">
              <div className="models__shap-label models__shap-label--primary">
                Polyarchy <span>(Step 3 · primary model)</span>
              </div>
              <img src="/shap_const.png"
                alt="SHAP beeswarm — electoral democracy"
                className="models__shap-img" />
            </div>
            <div className="models__shap-panel">
              <div className="models__shap-label models__shap-label--libdem">
                Liberal Democracy <span>(Step 3 · robustness)</span>
              </div>
              <img src="/shap_libdem_beeswarm.png"
                alt="SHAP beeswarm — liberal democracy"
                className="models__shap-img" />
            </div>
          </div>
        </div>

        {/* ── Caveats ── */}
        <div className="models__caveats">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Methodological Caveats</div>
          <ul>
            <li>LLM-generated typology has no inter-rater reliability validation</li>
            <li>Constitutional scores are time-invariant between amendments — creating pseudo-replication</li>
            <li>Endogeneity: liberal constitutions correlate with pre-existing democratic culture, not just formal text</li>
            <li>Episode validation has partial circularity (gap uses same V-Dem index as backsliding episode labels)</li>
            <li>Lead-lag OOF R² 0.006–0.035 explains &lt;4% of variance in future democratic change</li>
            <li>EIU culture data only covers 2006–2023 — culture comparison is not available for the full historical sample</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
