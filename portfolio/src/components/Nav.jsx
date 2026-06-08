import { useState, useEffect } from 'react'
import './Nav.css'

const links = [
  { href: '#about',       label: 'About' },
  { href: '#methodology', label: 'Methodology' },
  { href: '#findings',    label: 'Findings' },
  { href: '#demo',        label: 'Live Demo' },
  { href: '#models',      label: 'Models' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav--solid' : ''}`}>
      <div className="nav__inner">
        <a href="#hero" className="nav__brand">RT</a>
        <ul className="nav__links">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <div className="nav__actions">
          <a href="https://drive.google.com/drive/folders/1D9bihk23AZ78DuYXxyMTHpkbGG5kZGC6?usp=sharing" className="nav__btn nav__btn--ghost" target="_blank" rel="noopener noreferrer">
            Paper ↗
          </a>
          <a href="https://github.com/rishithakker27/constitution-democracy" className="nav__btn nav__btn--solid" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
