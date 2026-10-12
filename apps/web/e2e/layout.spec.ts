import { test, expect } from "@playwright/test"

/**
 * Automated layout regression check — the storefront homepage must match the
 * Stitch screens (desktop Variante 2 + Inicio Móvil). Runs at desktop (1280)
 * and mobile (390) viewports and asserts the layout invariants that have
 * historically regressed. Any failure means a UI regression — fix it, don't
 * weaken the assertion.
 *
 * Run: `pnpm --filter @wasi-granel/web check:layout`
 */
async function metrics(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const el = (id: string) => document.querySelector(`[data-testid="${id}"]`)
    const rect = (e: Element) => {
      const r = e.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }
    }
    const heroCard = el("hero-card")
    const btnAs = heroCard ? [...heroCard.querySelectorAll("a")] : []
    const btns = btnAs.map((a) => {
      const r = a.getBoundingClientRect()
      return { h: Math.round(r.height), top: Math.round(r.top) }
    })
    const imgWrap = document.querySelector("main img, section img")?.closest("div") || null
    const header = document.querySelector("header")
    const catGrid = el("categories-grid")
    return {
      vw: window.innerWidth,
      headerPos: header ? getComputedStyle(header).position : null,
      navRadius: el("nav-bar") ? parseFloat(getComputedStyle(el("nav-bar")!).borderRadius) : null,
      heroCard: heroCard ? rect(heroCard) : null,
      btns,
      imgH: imgWrap ? Math.round(imgWrap.getBoundingClientRect().height) : null,
      catCols: catGrid ? getComputedStyle(catGrid).gridTemplateColumns.split(" ").length : null,
      benMobDisplay: el("benefits-mobile") ? getComputedStyle(el("benefits-mobile")!).display : null,
      benDescDisplay: el("benefits-desktop") ? getComputedStyle(el("benefits-desktop")!).display : null,
      slides: document.querySelectorAll('[aria-roledescription="slide"]').length,
    }
  })
}

test("homepage layout matches Stitch (desktop + mobile)", async ({ page }) => {
  await page.goto("/")
  await page.getByTestId("hero-card").waitFor({ state: "attached", timeout: 20_000 })
  const m = await metrics(page)
  const isDesktop = m.vw >= 1024

  expect(m.heroCard, "hero card must render").toBeTruthy()

  if (isDesktop) {
    // Navbar = floating rounded pill (header fixed, radius ~rounded-full)
    expect(m.headerPos).toBe("fixed")
    expect(m.navRadius! > 15, "desktop navbar must be the floating rounded pill").toBe(true)
    // Hero card must clear the navbar by a comfortable margin (Stitch pt-32)
    expect(m.heroCard!.top - m.navRadius!, "card must not touch the navbar").toBeGreaterThanOrEqual(0)
    expect(m.heroCard!.top - (m.headerPos === "fixed" ? 80 : 0), "card clearance from navbar").toBeGreaterThanOrEqual(40)
    // CTA buttons: single-line, on one row (no internal text wrap)
    expect(m.btns.length).toBe(2)
    for (const b of m.btns) expect(b.h, "button label must not wrap").toBeLessThanOrEqual(60)
    expect(Math.abs(m.btns[0].top - m.btns[1].top)).toBeLessThan(4)
    // Desktop variants
    expect(m.benDescDisplay).toBe("flex")
    expect(m.benMobDisplay).toBe("none")
  } else {
    // Navbar = full-width sticky bar (radius 0), NOT the floating pill
    expect(m.headerPos).toBe("sticky")
    expect(m.navRadius! <= 1, "mobile navbar must be a full-width bar, not a pill").toBe(true)
    // Hero: top image block (h≈460) + card overlapping below
    expect(m.imgH!).toBeGreaterThanOrEqual(430)
    expect(m.heroCard!.top).toBeGreaterThan(300) // card sits below the 460px image + nav
    // CTA buttons stacked (mobile) — not on the same row
    expect(m.btns.length).toBe(2)
    expect(Math.abs(m.btns[0].top - m.btns[1].top)).toBeGreaterThan(20)
    // Mobile variants
    expect(m.benMobDisplay).toBe("grid")
    expect(m.benDescDisplay).toBe("none")
  }

  // Category grid columns (data-dependent — only assert when rendered)
  if (m.catCols) expect(m.catCols, "category grid column count").toBe(isDesktop ? 4 : 2)
  // Carousel must have 2+ slides when products are present
  if (m.slides > 0) expect(m.slides).toBeGreaterThanOrEqual(2)
})
