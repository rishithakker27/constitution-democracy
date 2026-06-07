import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import trendsData from '../data/dimension_trends.json'
import './DimensionTrends.css'

// trendsData is a flat { "1900": { dim: score, ... }, ... } dict
const ALL_YEARS = Object.keys(trendsData).map(Number).sort((a, b) => a - b)
const MIN_YEAR  = ALL_YEARS[0]
const MAX_YEAR  = ALL_YEARS[ALL_YEARS.length - 1]

// Compute 1940s baseline (average of 1940–1949)
const BASELINE_YEARS = ALL_YEARS.filter(y => y >= 1940 && y <= 1949)
const BASELINE = (() => {
  const b = {}
  const dims = Object.keys(trendsData[String(BASELINE_YEARS[0])] || {})
  dims.forEach(dim => {
    const vals = BASELINE_YEARS
      .map(y => trendsData[String(y)]?.[dim])
      .filter(v => v != null)
    b[dim] = vals.length > 0 ? vals.reduce((a, c) => a + c, 0) / vals.length : 0
  })
  return b
})()

// Color by dimension category
const DIM_COLORS = {
  'Civil Liberties':           '#60a5fa',
  'Socioeconomic Rights':      '#818cf8',
  'Political Competition':     '#34d399',
  'Legislative Autonomy':      '#4ade80',
  'Executive Constraints':     '#86efac',
  'Judicial Independence':     '#a3e635',
  'Rule of Law':               '#60a5fa',
  'Institutional Accountability': '#38bdf8',
  'Emergency Powers':          '#f59e0b',
  'Civilian Control':          '#fb923c',
  'Amendment Rigidity':        '#f472b6',
  'Federalism':                '#c084fc',
  'Transparency':              '#2dd4bf',
  'Equality':                  '#a78bfa',
}

const CustomTooltip = ({ active, payload, year }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const sign = d.change >= 0 ? '+' : ''
  const isGain = d.change >= 0
  return (
    <div className="dt__tooltip">
      <div className="dt__tooltip-dim">{d.dim}</div>
      <div className="dt__tooltip-row">
        <span>Change from 1940s</span>
        <strong style={{ color: isGain ? '#34d399' : '#f87171' }}>
          {sign}{d.change.toFixed(4)}
        </strong>
      </div>
      <div className="dt__tooltip-row">
        <span>1940s baseline</span>
        <strong>{BASELINE[d.dim]?.toFixed(3)}</strong>
      </div>
      <div className="dt__tooltip-row">
        <span>Score in {year}</span>
        <strong>{((BASELINE[d.dim] || 0) + d.change).toFixed(3)}</strong>
      </div>
    </div>
  )
}

export default function DimensionTrends() {
  const [year, setYear] = useState(2020)

  // Find nearest available year
  const nearest = useMemo(() => {
    return ALL_YEARS.reduce((prev, cur) =>
      Math.abs(cur - year) < Math.abs(prev - year) ? cur : prev
    )
  }, [year])

  const chartData = useMemo(() => {
    const raw = trendsData[String(nearest)] || {}
    return Object.entries(raw)
      .filter(([, v]) => v !== null)
      .map(([dim, score]) => ({ dim, change: score - (BASELINE[dim] || 0) }))
      .sort((a, b) => b.change - a.change)
  }, [nearest])

  const biggestGain = chartData[0]
  const biggestDrop = chartData[chartData.length - 1]

  return (
    <section id="dimension-trends" className="dt">
      <div className="section-wrap">
        <div className="section-label">Step 10 — Dimension Trends</div>
        <h2 className="dt__heading">How Constitutional Provisions Have Changed</h2>
        <p className="dt__sub">
          Each bar shows how much a dimension's global average score has shifted
          relative to the <strong>1940s baseline</strong>.
          Drag the slider to move through history.
        </p>

        {/* ── Year slider ── */}
        <div className="dt__slider-wrap">
          <div className="dt__year-display">{nearest}</div>
          <input
            type="range"
            className="dt__slider"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          />
          <div className="dt__year-range">
            <span>{MIN_YEAR}</span>
            <span className="dt__baseline-marker">1940s baseline ↑</span>
            <span>{MAX_YEAR}</span>
          </div>
        </div>

        {/* ── Bar chart ── */}
        <div className="dt__chart-wrap">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 110 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="dim"
                tick={{ fill: '#8fa3bb', fontSize: 11 }}
                angle={-50}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: '#8fa3bb', fontSize: 11 }}
                tickFormatter={v => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
                domain={[-0.12, 0.35]}
              />
              <Tooltip content={<CustomTooltip year={nearest} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} label={{ value: '1940s avg', fill: '#8fa3bb', fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="change" radius={[3, 3, 0, 0]}>
                {chartData.map(entry => (
                  <Cell
                    key={entry.dim}
                    fill={entry.change >= 0 ? DIM_COLORS[entry.dim] || '#60a5fa' : '#f87171'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Callout ── */}
        {biggestGain && biggestDrop && (
          <div className="dt__callout-row">
            <div className="dt__callout dt__callout--gain">
              <div className="dt__callout-label">Biggest gain in {nearest}</div>
              <div className="dt__callout-dim">{biggestGain.dim}</div>
              <div className="dt__callout-val">+{biggestGain.change.toFixed(3)}</div>
            </div>
            <div className="dt__callout dt__callout--flat">
              <div className="dt__callout-label">Most unchanged in {nearest}</div>
              {(() => {
                const flattest = [...chartData].sort((a, b) => Math.abs(a.change) - Math.abs(b.change))[0]
                return (
                  <>
                    <div className="dt__callout-dim">{flattest?.dim}</div>
                    <div className="dt__callout-val">{flattest?.change >= 0 ? '+' : ''}{flattest?.change.toFixed(3)}</div>
                  </>
                )
              })()}
            </div>
            <div className="dt__callout dt__callout--drop">
              <div className="dt__callout-label">
                {biggestDrop.change < 0 ? `Biggest drop in ${nearest}` : `Smallest gain in ${nearest}`}
              </div>
              <div className="dt__callout-dim">{biggestDrop.dim}</div>
              <div className="dt__callout-val" style={{ color: biggestDrop.change < 0 ? '#f87171' : '#34d399' }}>
                {biggestDrop.change >= 0 ? '+' : ''}{biggestDrop.change.toFixed(3)}
              </div>
            </div>
          </div>
        )}

        <p className="dt__note">
          Scores are 5-year rolling global averages (0–1 scale). Bars show Δ from 1940–1949 mean.
          The Madisonian provisions — Executive Constraints, Legislative Autonomy, Emergency Powers —
          stay near zero across all years; Socioeconomic Rights and Equality drive most of the growth.
        </p>
      </div>
    </section>
  )
}
