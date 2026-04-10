import { useEffect, useRef } from 'react'
import './Background.css'

export default function Background() {
  const orb1Ref = useRef(null)
  const orb2Ref = useRef(null)
  const orb3Ref = useRef(null)
  const gridRef = useRef(null)
  const linesRef = useRef(null)

  useEffect(() => {
    let rafId = null

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        if (orb1Ref.current)  orb1Ref.current.style.transform  = `translateY(${y * 0.25}px)`
        if (orb2Ref.current)  orb2Ref.current.style.transform  = `translateY(${y * -0.18}px)`
        if (orb3Ref.current)  orb3Ref.current.style.transform  = `translateY(${y * 0.35}px) translateX(${y * 0.05}px)`
        if (gridRef.current)  gridRef.current.style.transform  = `translateY(${y * 0.08}px)`
        if (linesRef.current) linesRef.current.style.transform = `translateY(${y * 0.12}px)`
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="bg" aria-hidden="true">

      {/* Dot grid */}
      <div className="bg__grid" ref={gridRef} />

      {/* Diagonal lines */}
      <svg className="bg__lines" ref={linesRef} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <line x1="0"    y1="200" x2="1440" y2="600" className="bg__line bg__line--1" />
        <line x1="0"    y1="500" x2="1440" y2="100" className="bg__line bg__line--2" />
        <line x1="200"  y1="0"   x2="800"  y2="900" className="bg__line bg__line--3" />
        <line x1="900"  y1="0"   x2="1200" y2="900" className="bg__line bg__line--4" />
        <line x1="0"    y1="750" x2="600"  y2="0"   className="bg__line bg__line--5" />
        <line x1="1100" y1="0"   x2="1440" y2="450" className="bg__line bg__line--6" />
      </svg>

      {/* Corner accent brackets */}
      <svg className="bg__corner bg__corner--tl" viewBox="0 0 60 60" fill="none">
        <path d="M2 30 L2 2 L30 2" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <svg className="bg__corner bg__corner--br" viewBox="0 0 60 60" fill="none">
        <path d="M58 30 L58 58 L30 58" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <svg className="bg__corner bg__corner--tr" viewBox="0 0 60 60" fill="none">
        <path d="M30 2 L58 2 L58 30" stroke="#1d6fa4" strokeWidth="1" strokeLinecap="round"/>
      </svg>
      <svg className="bg__corner bg__corner--bl" viewBox="0 0 60 60" fill="none">
        <path d="M30 58 L2 58 L2 30" stroke="#1d6fa4" strokeWidth="1" strokeLinecap="round"/>
      </svg>

      {/* Ambient orbs */}
      <div className="bg__orb bg__orb--1" ref={orb1Ref} />
      <div className="bg__orb bg__orb--2" ref={orb2Ref} />
      <div className="bg__orb bg__orb--3" ref={orb3Ref} />

      {/* Floating particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className={`bg__particle bg__particle--${i + 1}`} />
      ))}

      {/* Horizontal scan line */}
      <div className="bg__scan" />

    </div>
  )
}
