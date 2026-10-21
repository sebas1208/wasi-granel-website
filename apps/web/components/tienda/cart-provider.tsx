"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { CartDrawer } from "./cart-drawer"
import { CartToast } from "./cart-toast"

/**
 * Mounted ONCE in the root layout so the cart is available on every page (the navbar is global).
 *
 * The drawer is rendered here — as a portal sibling of the page content, never nested inside the
 * navbar's cart button. An overlay rendered inside a clickable parent re-opens on close, because
 * portal events bubble through the React tree rather than the DOM.
 *
 * Not URL-driven, deliberately: `url-driven-overlays` covers overlays that must be SHAREABLE. Nobody
 * shares their cart, so local state is the right call (unlike the Quick View in ticket 13).
 */
const CartContext = createContext<{ openCart: () => void } | null>(null)

export function useCartDrawer() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCartDrawer must be used inside <CartProvider>")
  return ctx
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const openCart = useCallback(() => setOpen(true), [])

  return (
    <CartContext.Provider value={{ openCart }}>
      {children}
      <CartDrawer open={open} onOpenChange={setOpen} />
      <CartToast />
    </CartContext.Provider>
  )
}
