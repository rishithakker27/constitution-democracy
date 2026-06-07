import './SectionTransition.css'

export default function SectionTransition({ label, sublabel }) {
  return (
    <div className="transition">
      <div className="transition__line" />
      <div className="transition__body">
        <div className="transition__arrow">↓</div>
        <div className="transition__label">{label}</div>
        {sublabel && <div className="transition__sublabel">{sublabel}</div>}
      </div>
      <div className="transition__line" />
    </div>
  )
}
