import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell,
} from 'recharts'
import allTargets   from '../data/targets.json'
import countriesData from '../data/countries.json'
import './LiveDemo.css'

const TARGET_OPTIONS = [
  { value: 'polyarchy',  label: 'Electoral Democracy (Polyarchy)',    vdem: 'v2x_polyarchy' },
  { value: 'libdem',     label: 'Liberal Democracy',                   vdem: 'v2x_libdem' },
  { value: 'egaldem',    label: 'Egalitarian Democracy',               vdem: 'v2x_egaldem' },
  { value: 'partipdem',  label: 'Participatory Democracy',             vdem: 'v2x_partipdem' },
  { value: 'delibdem',   label: 'Deliberative Democracy',              vdem: 'v2x_delibdem' },
]

const SORT_OPTIONS = [
  { value: 'gap',    label: 'Constitutional gap ↑ (worst first)' },
  { value: '-gap',   label: 'Constitutional gap ↓ (best first)' },
  { value: 'value',  label: 'Democracy score ↑ (least democratic)' },
  { value: '-value', label: 'Democracy score ↓ (most democratic)' },
]

const CULTURE_SORT_OPTIONS = [
  { value: 'gap_culture',   label: 'Culture-adjusted gap ↑ (worst first)' },
  { value: '-gap_culture',  label: 'Culture-adjusted gap ↓ (best first)' },
  { value: 'gap_const',     label: 'Constitutional gap ↑ (worst first)' },
  { value: '-gap_const',    label: 'Constitutional gap ↓ (best first)' },
]

function getBarColor(gap) {
  if (gap < -0.25) return '#e05555'
  if (gap < -0.1)  return '#f59e0b'
  if (gap < 0.1)   return '#8fa3bb'
  return '#34d399'
}

const MainTooltip = ({ active, payload, targetLabel }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="demo__tooltip">
      <div className="demo__tooltip-name">{d.country_name} <span className="demo__iso">{d.country_text_id}</span></div>
      <div className="demo__tooltip-row"><span>{targetLabel}</span><strong>{d.value.toFixed(3)}</strong></div>
      <div className="demo__tooltip-row"><span>Constitutional prediction</span><strong>{d.pred.toFixed(3)}</strong></div>
      <div className="demo__tooltip-row">
        <span>Constitutional gap</span>
        <strong style={{ color: getBarColor(d.gap) }}>{d.gap > 0 ? '+' : ''}{d.gap.toFixed(3)}</strong>
      </div>
    </div>
  )
}

const CultureTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="demo__tooltip">
      <div className="demo__tooltip-name">{d.country_name} <span className="demo__iso">{d.country_text_id}</span></div>
      <div className="demo__tooltip-row"><span>V-Dem Polyarchy</span><strong>{d.v2x_polyarchy.toFixed(3)}</strong></div>
      <div className="demo__tooltip-row"><span>EIU Culture score</span><strong>{d.dem_culture.toFixed(2)} / 10</strong></div>
      <div className="demo__tooltip-row"><span>Constitutional gap</span>
        <strong style={{ color: getBarColor(d.gap_const) }}>{d.gap_const > 0 ? '+' : ''}{d.gap_const.toFixed(3)}</strong>
      </div>
      <div className="demo__tooltip-row"><span>Culture-adjusted gap</span>
        <strong style={{ color: getBarColor(d.gap_culture) }}>{d.gap_culture > 0 ? '+' : ''}{d.gap_culture.toFixed(3)}</strong>
      </div>
    </div>
  )
}

export default function LiveDemo() {
  const [target,      setTarget]      = useState('polyarchy')
  const [sort,        setSort]        = useState('gap')
  const [cultureSort, setCultureSort] = useState('gap_culture')
  const [search,      setSearch]      = useState('')
  const [view,        setView]        = useState('chart')
  const [selected,    setSelected]    = useState(null)
  const [showCulture, setShowCulture] = useState(false)

  const targetMeta = TARGET_OPTIONS.find(o => o.value === target)
  const data       = allTargets[target]

  // ── Main filtered + sorted data ────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...data]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.country_name.toLowerCase().includes(q) ||
        c.country_text_id.toLowerCase().includes(q)
      )
    }
    const desc = sort.startsWith('-')
    const key  = sort.replace(/^-/, '')
    list.sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key])
    return list
  }, [data, search, sort])

  // ── Culture data (polyarchy only) ─────────────────────────────────────────
  const cultureFiltered = useMemo(() => {
    let list = [...countriesData]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.country_name.toLowerCase().includes(q) ||
        c.country_text_id.toLowerCase().includes(q)
      )
    }
    const desc = cultureSort.startsWith('-')
    const key  = cultureSort.replace(/^-/, '')
    list.sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key])
    return list
  }, [search, cultureSort])

  const chartData        = filtered.slice(0, 30)
  const cultureChartData = cultureFiltered.slice(0, 30)
  const selectedRow      = selected ? data.find(c => c.country_name === selected) : null
  const selectedCulture  = selected ? countriesData.find(c => c.country_name === selected) : null

  return (
    <section id="demo" className="demo">
      <div className="section-wrap">
        <div className="section-label">Interactive Demo</div>
        <h2 className="demo__heading">Explore Countries</h2>
        <p className="demo__sub">
          The <em>constitutional gap</em> = actual democracy score − what the model predicts
          from constitutional text alone. Negative = underperforming relative to constitution.
        </p>

        {/* ── Controls ── */}
        <div className="demo__controls">
          <select className="demo__select demo__select--target"
            value={target} onChange={e => { setTarget(e.target.value); setSelected(null) }}>
            {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input className="demo__search" type="text" placeholder="Search country…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="demo__select" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="demo__toggle">
            <button className={view === 'chart' ? 'active' : ''} onClick={() => setView('chart')}>Chart</button>
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="demo__legend">
          <span className="demo__dot" style={{ background: '#e05555' }} /> Severe underperformance (&lt; −0.25)
          <span className="demo__dot" style={{ background: '#f59e0b' }} /> Moderate (−0.25 to −0.1)
          <span className="demo__dot" style={{ background: '#8fa3bb' }} /> Near prediction
          <span className="demo__dot" style={{ background: '#34d399' }} /> Outperforms constitution
        </div>

        {/* ── Chart ── */}
        {view === 'chart' && (
          <div className="demo__chart-wrap">
            <p className="demo__chart-note">
              Showing top {Math.min(30, filtered.length)} of {filtered.length} countries
              · <strong style={{ color: '#60a5fa' }}>{targetMeta.label}</strong> · Constitutional model only
            </p>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 100 }}
                onClick={e => e?.activePayload && setSelected(e.activePayload[0]?.payload?.country_name)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="country_name" tick={{ fill: '#8fa3bb', fontSize: 11 }}
                  angle={-55} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: '#8fa3bb', fontSize: 11 }} tickFormatter={v => v.toFixed(2)} domain={[-0.7, 0.7]} />
                <Tooltip content={<MainTooltip targetLabel={targetMeta.label} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                <Bar dataKey="gap" radius={[3, 3, 0, 0]}>
                  {chartData.map(entry => (
                    <Cell key={entry.country_name}
                      fill={getBarColor(entry.gap)}
                      opacity={selected && selected !== entry.country_name ? 0.4 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Table ── */}
        {view === 'table' && (
          <div className="demo__table-wrap">
            <table className="demo__table">
              <thead>
                <tr>
                  <th>Country</th><th>ISO</th><th>{targetMeta.label}</th>
                  <th>Const. Prediction</th><th>Constitutional Gap</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.country_name}
                    className={selected === c.country_name ? 'demo__row--selected' : ''}
                    onClick={() => setSelected(c.country_name === selected ? null : c.country_name)}>
                    <td>{c.country_name}</td>
                    <td className="demo__iso">{c.country_text_id}</td>
                    <td>{c.value.toFixed(3)}</td>
                    <td>{c.pred.toFixed(3)}</td>
                    <td style={{ color: getBarColor(c.gap) }}>
                      {c.gap > 0 ? '+' : ''}{c.gap.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Selected country detail ── */}
        {selectedRow && (
          <div className="demo__detail">
            <button className="demo__detail-close" onClick={() => setSelected(null)}>✕</button>
            <div className="demo__detail-name">
              {selectedRow.country_name} <span className="demo__iso">{selectedRow.country_text_id}</span>
            </div>
            <div className="demo__detail-grid">
              <div className="demo__detail-item">
                <span>{targetMeta.label}</span>
                <strong>{selectedRow.value.toFixed(3)}</strong>
              </div>
              <div className="demo__detail-item">
                <span>Constitutional prediction</span>
                <strong>{selectedRow.pred.toFixed(3)}</strong>
              </div>
              <div className="demo__detail-item">
                <span>Constitutional gap</span>
                <strong style={{ color: getBarColor(selectedRow.gap) }}>
                  {selectedRow.gap > 0 ? '+' : ''}{selectedRow.gap.toFixed(3)}
                </strong>
              </div>
              {target === 'polyarchy' && selectedCulture && (
                <>
                  <div className="demo__detail-item">
                    <span>EIU Culture score</span>
                    <strong>{selectedCulture.dem_culture.toFixed(2)} / 10</strong>
                  </div>
                  <div className="demo__detail-item">
                    <span>Culture-adj. prediction</span>
                    <strong>{selectedCulture.pred_culture.toFixed(3)}</strong>
                  </div>
                  <div className="demo__detail-item">
                    <span>Culture-adjusted gap</span>
                    <strong style={{ color: getBarColor(selectedCulture.gap_culture) }}>
                      {selectedCulture.gap_culture > 0 ? '+' : ''}{selectedCulture.gap_culture.toFixed(3)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Culture section (polyarchy only, at bottom) ── */}
        {target === 'polyarchy' && (
          <div className="demo__culture-section">
            <button className="demo__culture-toggle" onClick={() => setShowCulture(v => !v)}>
              <span className="demo__culture-toggle-icon">{showCulture ? '▲' : '▼'}</span>
              <span className="demo__culture-badge">Step 8 — Robustness</span>
              Culture-adjusted comparison
              <span className="demo__culture-hint">
                {showCulture ? 'hide' : 'Adding EIU Democratic Culture Index — how does it change the gap?'}
              </span>
            </button>

            {showCulture && (
              <>
                <div className="demo__culture-controls">
                  <select className="demo__select" value={cultureSort}
                    onChange={e => setCultureSort(e.target.value)}>
                    {CULTURE_SORT_OPTIONS.map(o =>
                      <option key={o.value} value={o.value}>{o.label}</option>
                    )}
                  </select>
                  <p className="demo__culture-note">
                    157 countries with EIU culture data (2006–2023 window only).
                    Culture triples R² from 0.116 → 0.401 but confirms text is a real signal.
                  </p>
                </div>

                <div className="demo__chart-wrap" style={{ marginTop: '0.75rem' }}>
                  <p className="demo__chart-note">
                    Showing top {Math.min(30, cultureFiltered.length)} of {cultureFiltered.length} countries
                    · bars = culture-adjusted gap · tick marks = constitutional gap
                  </p>
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={cultureChartData} margin={{ top: 10, right: 20, left: 0, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="country_name" tick={{ fill: '#8fa3bb', fontSize: 11 }}
                        angle={-55} textAnchor="end" interval={0} />
                      <YAxis tick={{ fill: '#8fa3bb', fontSize: 11 }} tickFormatter={v => v.toFixed(2)} domain={[-0.7, 0.7]} />
                      <Tooltip content={<CultureTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                      <Bar dataKey="gap_culture" radius={[3, 3, 0, 0]}>
                        {cultureChartData.map(entry => (
                          <Cell key={entry.country_name} fill={getBarColor(entry.gap_culture)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="demo__table-wrap" style={{ marginTop: '1rem' }}>
                  <table className="demo__table">
                    <thead>
                      <tr>
                        <th>Country</th><th>ISO</th><th>V-Dem</th>
                        <th>Culture (EIU)</th><th>Gap (const.)</th><th>Gap (+ culture)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cultureFiltered.map(c => (
                        <tr key={c.country_name}>
                          <td>{c.country_name}</td>
                          <td className="demo__iso">{c.country_text_id}</td>
                          <td>{c.v2x_polyarchy.toFixed(3)}</td>
                          <td>{c.dem_culture.toFixed(2)}</td>
                          <td style={{ color: getBarColor(c.gap_const) }}>
                            {c.gap_const > 0 ? '+' : ''}{c.gap_const.toFixed(3)}
                          </td>
                          <td style={{ color: getBarColor(c.gap_culture) }}>
                            {c.gap_culture > 0 ? '+' : ''}{c.gap_culture.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
