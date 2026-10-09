"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/contacto", label: "Contacto" },
]

// Floating solid pill navbar (matches the Stitch "Variante 2" design).
export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-4 inset-x-0 z-50 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-7xl mx-auto bg-white border border-[#ead7c3] rounded-full shadow-md shadow-foreground/5 px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand — official mark */}
        <Link
          href="/"
          className="flex items-center transition-transform duration-200 active:scale-95"
          aria-label="Wasi Granel — Inicio"
        >
          <span aria-hidden className="wasi-logo text-primary h-9 md:h-10" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`nav-link text-sm px-2 pb-1 ${
                  active
                    ? "font-bold text-primary border-b-2 border-primary"
                    : "font-semibold text-foreground hover:text-primary transition-colors"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav — rounded panel under the pill */}
      {isOpen && (
        <div className="pointer-events-auto md:hidden w-full max-w-7xl mx-auto mt-2 bg-white border border-[#ead7c3] rounded-2xl shadow-md shadow-foreground/5 p-3">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block px-3 py-2.5 rounded-xl text-sm ${
                  active
                    ? "font-bold text-primary bg-primary/10"
                    : "font-semibold text-foreground hover:bg-background"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}