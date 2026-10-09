"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingCart, User, Menu, X } from "lucide-react"
import { useState } from "react"

const links = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/contacto", label: "Contacto" },
]

// Note: the active-link accent is Stitch's #785a00 dark amber (distinct from the
// brand yellow #fcbf00 used for the logo / cart badge).

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  // Cart badge is wired to real state in ticket 12/13; 0 hides it for now.
  const cartCount = 0

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 pointer-events-none">
      {/* Solid pill bar */}
      <div className="pointer-events-auto max-w-7xl mx-auto h-16 border border-[#ead7c3] rounded-full shadow-md hover:shadow-lg shadow-foreground/5 px-6 flex items-center justify-between bg-white/95 backdrop-blur-sm">
        {/* Left: brand + nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center group transition-transform duration-200 active:scale-95"
            aria-label="Página de inicio Wasi Granel"
          >
            <span
              aria-hidden
              className="wasi-logo text-primary h-10 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link text-sm pb-1 transition-colors ${
                    active
                      ? "font-bold border-b-2 text-[#785a00] border-[#785a00]"
                      : "font-semibold text-foreground hover:text-[#785a00]"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: search + cart + account + mobile toggle */}
        <div className="flex items-center gap-4">
          <form
            role="search"
            action="/tienda"
            className="hidden lg:flex items-center bg-[#fff8f4] rounded-full px-4 py-1.5 border border-[#d3c5ab]/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300"
          >
            <Search className="text-foreground mr-2 h-5 w-5" aria-hidden />
            <input
              aria-label="Buscar en la tienda"
              type="search"
              name="q"
              placeholder="Buscar en la tienda..."
              className="bg-transparent border-none focus:ring-0 text-sm w-48 focus:w-64 text-foreground placeholder:text-muted-foreground p-0 outline-none transition-all duration-300"
            />
          </form>

          <div className="flex items-center gap-3">
            <Link
              href="/tienda"
              aria-label={`Carrito de compras${cartCount ? ` con ${cartCount} productos` : ""}`}
              className="relative w-10 h-10 bg-[#fff8f4] hover:bg-[#f3dfcb] active:scale-90 rounded-full border border-[#d3c5ab]/50 transition-all duration-200 text-foreground flex items-center justify-center group"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-foreground font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/contacto"
              aria-label="Mi Cuenta de usuario"
              className="w-10 h-10 bg-[#fff8f4] hover:bg-[#f3dfcb] active:scale-90 rounded-full border border-[#d3c5ab]/50 transition-all duration-200 text-foreground flex items-center justify-center group"
            >
              <User className="h-5 w-5" aria-hidden />
            </Link>

            <button
              type="button"
              aria-label={isOpen ? "Cerrar menú principal" : "Abrir menú principal"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((o) => !o)}
              className="md:hidden p-2 text-foreground active:scale-90 transition-transform flex items-center justify-center rounded-full hover:bg-[#f3dfcb]"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav — rounded panel under the pill */}
      {isOpen && (
        <div className="pointer-events-auto md:hidden max-w-7xl mx-auto mt-2 bg-white border border-[#ead7c3] rounded-2xl shadow-md shadow-foreground/5 p-3">
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
                    ? "font-bold text-[#785a00] bg-[#785a00]/10"
                    : "font-semibold text-foreground hover:bg-background"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="flex items-center gap-3 mt-2 pt-3 border-t border-[#ead7c3]">
            <Link href="/tienda" aria-label="Carrito de compras" className="w-10 h-10 bg-[#fff8f4] rounded-full border border-[#d3c5ab]/50 text-foreground flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" aria-hidden />
            </Link>
            <Link href="/contacto" aria-label="Mi Cuenta de usuario" className="w-10 h-10 bg-[#fff8f4] rounded-full border border-[#d3c5ab]/50 text-foreground flex items-center justify-center">
              <User className="h-5 w-5" aria-hidden />
            </Link>
            <form role="search" action="/tienda" className="flex-1 flex items-center bg-[#fff8f4] rounded-full px-3 py-1.5 border border-[#d3c5ab]/60">
              <Search className="text-foreground mr-2 h-4 w-4" aria-hidden />
              <input aria-label="Buscar en la tienda" type="search" name="q" placeholder="Buscar..." className="bg-transparent border-none focus:ring-0 text-sm w-full text-foreground placeholder:text-muted-foreground outline-none" />
            </form>
          </div>
        </div>
      )}
    </header>
  )
}