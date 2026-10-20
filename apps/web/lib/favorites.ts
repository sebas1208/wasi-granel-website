"use client"

import { useMemo, useSyncExternalStore } from "react"

const KEY = "wg-favorites"
let cache: Set<number> | null = null
const listeners = new Set<() => void>()

function load(): Set<number> {
  if (cache) return cache
  try {
    cache = new Set<number>(JSON.parse(localStorage.getItem(KEY) || "[]"))
  } catch {
    cache = new Set<number>()
  }
  return cache
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

// stable string snapshot (required by useSyncExternalStore)
function snapshot(): string {
  return JSON.stringify([...load()].sort((a, b) => a - b))
}

function serverSnapshot(): string {
  return "[]"
}

export function toggleFavorite(id: number): void {
  const s = load()
  if (s.has(id)) s.delete(id)
  else s.add(id)
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

/** Favorites persisted in localStorage (no backend session yet). SSR-safe via useSyncExternalStore. */
export function useFavorite(id: number): [boolean, () => void] {
  const snap = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const has = useMemo(() => (JSON.parse(snap) as number[]).includes(id), [snap, id])
  return [has, () => toggleFavorite(id)]
}