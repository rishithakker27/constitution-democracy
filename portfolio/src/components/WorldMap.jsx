import { useState, useMemo, useCallback } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import scoresData from '../data/world_map_scores.json'
import './WorldMap.css'

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const { meta, data } = scoresData
const { dims: DIMS, iso3_to_num, countries: COUNTRY_NAMES } = meta
const NUM_TO_ISO3 = Object.fromEntries(
  Object.entries(iso3_to_num).map(([iso3, num]) => [num, iso3])
)
const MIN_YEAR = meta.year_min
const MAX_YEAR = meta.year_max

/* ── helpers ───────────────────────────────────────────────── */

function getScores(iso3, year) {
  const cdata = data[iso3]
  if (!cdata) return null
  const yStr = String(year)
  if (cdata[yStr]) return cdata[yStr]
  // fall back to nearest prior year
  const years = Object.keys(cdata).map(Number).sort((a, b) => a - b)
  const prior = years.filter(y => y <= year)
  if (!prior.length) return null
  return cdata[String(prior[prior.length - 1])]
}

function meanScore(vals) {
  if (!vals) return null
  const valid = vals.filter(v => v !== null)
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

// Color ramp: dark blue → amber → Dartmouth green
function scoreToColor(score) {
  if (score === null || score === undefined) return '#1a2535'
  const t = Math.max(0, Math.min(1, score))
  let r, g, b
  if (t < 0.5) {
    const s = t * 2
    r = Math.round(30 + s * (215 - 30))
    g = Math.round(58 + s * (139 - 58))
    b = Math.round(95 + s * (11 - 95))
  } else {
    const s = (t - 0.5) * 2
    r = Math.round(215 + s * (0 - 215))
    g = Math.round(139 + s * (105 - 139))
    b = Math.round(11 + s * (62 - 11))
  }
  return `rgb(${r},${g},${b})`
}

// Dim colors matching the DimensionTrends palette
const DIM_COLORS = [
  '#60a5fa', '#818cf8', '#34d399', '#4ade80', '#86efac',
  '#a3e635', '#60a5fa', '#38bdf8', '#f59e0b', '#fb923c',
  '#f472b6', '#c084fc', '#2dd4bf', '#a78bfa',
]

const DetailTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { dim, value } = payload[0].payload
  return (
    <div className="wm__tooltip">
      <div className="wm__tooltip-dim">{dim}</div>
      <div className="wm__tooltip-val">{(value * 100).toFixed(1)}%</div>
    </div>
  )
}

/* ── component ─────────────────────────────────────────────── */

export default function WorldMap() {
  const [year, setYear]       = useState(2020)
  const [selected, setSelected] = useState(null)   // { iso3, name, scores }
  const [tooltip, setTooltip]   = useState(null)    // { name, score, x, y }

  /* Per-country mean scores for this year + active country count */
  const { countryMeans, activeCount } = useMemo(() => {
    const countryMeans = {}
    let activeCount = 0
    for (const iso3 of Object.keys(data)) {
      const scores = getScores(iso3, year)
      const mean = meanScore(scores)
      countryMeans[iso3] = mean
      if (mean !== null) activeCount++
    }
    return { countryMeans, activeCount }
  }, [year])

  /* Click a geography on the map */
  const handleGeoClick = useCallback(
    (geo) => {
      const numId = String(geo.id).padStart(3, '0')
      const iso3  = NUM_TO_ISO3[numId]
      if (!iso3 || !data[iso3]) return
      const scores = getScores(iso3, year)
      setSelected({ iso3, name: COUNTRY_NAMES[iso3] || iso3, scores })
    },
    [year]
  )

  /* Chart data for detail panel */
  const chartData = useMemo(() => {
    if (!selected?.scores) return []
    return DIMS.map((dim, i) => ({
      dim,
      value: selected.scores[i] ?? 0,
      color: DIM_COLORS[i],
    })).sort((a, b) => b.value - a.value)
  }, [selected])

  const overallScore = selected?.scores ? meanScore(selected.scores) : null

  return (
    <section id="world-map" className="wm">
      <div className="section-wrap">
        <div className="section-label">Global Constitutional Atlas</div>
        <h2 className="wm__heading">Constitutional Provisions Around the World</h2>
        <p className="wm__sub">
          Countries are shaded by their <strong>mean constitutional score</strong> across
          all 14 dimensions. Drag the slider all the way back to {MIN_YEAR} — countries
          appear as they adopt their first written constitution.{' '}
          <strong>Click any country</strong> to see the full 14-dimension breakdown.
        </p>

        {/* ── Year slider ──────────────────────────────────── */}
        <div className="wm__slider-wrap">
          <div className="wm__year-row">
            <div className="wm__year-display">{year}</div>
            <div className="wm__country-count">
              <span className="wm__count-num">{activeCount}</span>
              <span className="wm__count-label">countries with constitutional data</span>
            </div>
          </div>
          <input
            type="range"
            className="wm__slider"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          />
          <div className="wm__year-range">
            <span>{MIN_YEAR}</span>
            <span>{MAX_YEAR}</span>
          </div>
        </div>

        {/* ── Map ─────────────────────────────────────────── */}
        <div className="wm__map-outer">
          <ComposableMap
            projectionConfig={{ scale: 145, center: [10, 10] }}
            style={{ width: '100%', height: 'auto' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const numId = String(geo.id).padStart(3, '0')
                  const iso3  = NUM_TO_ISO3[numId]
                  const mean  = iso3 ? countryMeans[iso3] : null
                  const isSelected = selected?.iso3 === iso3

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleGeoClick(geo)}
                      onMouseEnter={evt => {
                        if (!iso3) return
                        setTooltip({
                          name:  COUNTRY_NAMES[iso3] || iso3,
                          score: mean,
                          x: evt.clientX,
                          y: evt.clientY,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: {
                          fill:        isSelected ? '#60a5fa' : scoreToColor(mean),
                          stroke:      isSelected ? '#93c5fd' : '#0f172a',
                          strokeWidth: isSelected ? 1.2 : 0.4,
                          outline:     'none',
                          transition:  'fill 0.1s',
                        },
                        hover: {
                          fill:        iso3 ? '#60a5fa' : '#1a2535',
                          stroke:      '#93c5fd',
                          strokeWidth: 0.8,
                          outline:     'none',
                          cursor:      iso3 ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill:    '#3b82f6',
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Hover tooltip */}
          {tooltip && (
            <div
              className="wm__hover-tip"
              style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
            >
              <span className="wm__hover-name">{tooltip.name}</span>
              {tooltip.score !== null && tooltip.score !== undefined && (
                <span className="wm__hover-score">
                  {(tooltip.score * 100).toFixed(0)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Color legend ─────────────────────────────────── */}
        <div className="wm__legend">
          <span className="wm__legend-lbl">Low</span>
          <div className="wm__legend-bar" />
          <span className="wm__legend-lbl">High</span>
          <span className="wm__legend-na">◻ No data</span>
        </div>

        {/* ── Detail panel ─────────────────────────────────── */}
        {selected && (
          <div className="wm__detail">
            <div className="wm__detail-top">
              <div>
                <div className="wm__detail-name">{selected.name}</div>
                <div className="wm__detail-meta">
                  Constitutional profile · {year}
                  {overallScore !== null && (
                    <span className="wm__detail-mean">
                      {' '}· Mean score: <strong>{(overallScore * 100).toFixed(1)}%</strong>
                    </span>
                  )}
                </div>
              </div>
              <button className="wm__close" onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>

            {selected.scores ? (
              <>
                <p className="wm__detail-hint">
                  Bars show each dimension&apos;s score (0–1 scale). Higher = stronger
                  constitutional provisions.
                </p>
                <div className="wm__detail-chart">
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 4, right: 60, left: 160, bottom: 4 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 1]}
                        tick={{ fill: '#8fa3bb', fontSize: 10 }}
                        tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                      />
                      <YAxis
                        type="category"
                        dataKey="dim"
                        width={155}
                        tick={{ fill: '#cbd5e1', fontSize: 11 }}
                      />
                      <ReferenceLine
                        x={overallScore ?? 0}
                        stroke="#60a5fa"
                        strokeDasharray="4 3"
                        strokeWidth={1.5}
                        label={{
                          value: 'avg',
                          fill: '#60a5fa',
                          fontSize: 9,
                          position: 'insideTopRight',
                        }}
                      />
                      <Tooltip
                        content={<DetailTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={16}>
                        {chartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="wm__no-data">
                No constitutional data found for <strong>{selected.name}</strong> in {year}.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
