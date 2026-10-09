"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/** Reveal-on-scroll wrapper matching the Stitch `reveal-init`/`reveal-active` pattern. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal-init ${active ? "reveal-active" : ""} ${className}`}>
      {children}
    </div>
  )
}
