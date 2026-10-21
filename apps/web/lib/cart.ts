"use client"

import { useSyncExternalStore } from "react"

/**
 * Minimal cart store (localStorage, no backend session yet) — enough for "Agregar" to actually add
 * something. Ticket 14 builds the drawer, the cart page and checkout on top of this.
 *
 * A cart LINE is a product + a specific purchase option (e.g. Almendras · 1 lb), so adding the same
 * option twice bumps the quantity while a different option becomes its own line.
 */
const KEY = "wg-cart"

export type CartLine = {
  id: string
  productId: number
  slug: string
  name: string
  image?: string | null
  kind: "weight" | "money" | "unit"
  grams?: number | null
  amount?: number | null
  label: string
  unitPrice: number
  qty: number
}

let cache: CartLine[] | null = null
const listeners = new Set<() => void>()
const addListeners = new Set<(line: CartLine) => void>()

function load(): CartLine[] {
  if (cache) return cache
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]")
    cache = Array.isArray(raw) ? (raw as CartLine[]) : []
  } catch {
    cache = []
  }
  return cache
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache ?? []))
  } catch {
    /* ignore (private mode) */
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Stable snapshot for useSyncExternalStore. */
function snapshot(): string {
  return JSON.stringify(load())
}

const serverSnapshot = () => "[]"

export function cartLines(): CartLine[] {
  return load()
}

export function cartCount(): number {
  return load().reduce((n, l) => n + l.qty, 0)
}

export function cartTotal(): number {
  return Number(load().reduce((sum, l) => sum + l.unitPrice * l.qty, 0).toFixed(2))
}

export function addToCart(line: Omit<CartLine, "id">): void {
  const id = `${line.productId}:${line.kind}:${line.grams ?? ""}:${line.amount ?? ""}`
  const cart = load()
  const existing = cart.find((l) => l.id === id)
  if (existing) existing.qty += line.qty
  else cart.push({ ...line, id })
  persist()
  const added: CartLine = { ...line, id }
  listeners.forEach((l) => l())
  addListeners.forEach((cb) => cb(added))
}

/**
 * Set a line's quantity. Below 1 the line is removed — a zero-quantity line is not a thing, and
 * this is what the drawer's stepper does when you press minus at 1.
 */
export function updateQty(id: string, qty: number): void {
  const cart = load()
  const line = cart.find((l) => l.id === id)
  if (!line) return
  if (qty < 1) {
    removeLine(id)
    return
  }
  line.qty = qty
  persist()
  listeners.forEach((l) => l())
}

/** Remove a line outright (the drawer's delete button). */
export function removeLine(id: string): void {
  const cart = load()
  const i = cart.findIndex((l) => l.id === id)
  if (i === -1) return
  cart.splice(i, 1)
  persist()
  listeners.forEach((l) => l())
}

export function clearCart(): void {
  cache = []
  persist()
  listeners.forEach((l) => l())
}

/** Subscribe to "a line was just added" — drives the cart toast. */
export function onCartAdd(cb: (line: CartLine) => void): () => void {
  addListeners.add(cb)
  return () => {
    addListeners.delete(cb)
  }
}

export function useCartLines(): CartLine[] {
  const snap = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  return JSON.parse(snap) as CartLine[]
}

export function useCartCount(): number {
  const lines = useCartLines()
  return lines.reduce((n, l) => n + l.qty, 0)
}
