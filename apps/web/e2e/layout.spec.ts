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
      navBottom: el("nav-bar") ? Math.round(el("nav-bar")!.getBoundingClientRect().bottom) : null,
      heroCard: heroCard ? rect(heroCard) : null,
      heroRight: heroCard ? Math.round(heroCard.getBoundingClientRect().right) : null,
      catRight: catGrid ? Math.round(catGrid.getBoundingClientRect().right) : null,
      btns,
      imgH: imgWrap ? Math.round(imgWrap.getBoundingClientRect().height) : null,
      catCols: catGrid ? getComputedStyle(catGrid).gridTemplateColumns.split(" ").length : null,
      benMobDisplay: el("benefits-mobile") ? getComputedStyle(el("benefits-mobile")!).display : null,
      benDescDisplay: el("benefits-desktop") ? getComputedStyle(el("benefits-desktop")!).display : null,
      slides: document.querySelectorAll('[aria-roledescription="slide"]').length,
      // carousel peek: % of the next card visible (must be partial on both viewports)
      peek: (() => {
        const cards = [...document.querySelectorAll('[class*="hover:-translate-y"]')]
        const viewport = cards[0]?.closest('[class*="overflow-hidden"]')
        if (!viewport || cards.length < 2) return null
        const vr = viewport.getBoundingClientRect()
        const full = cards.filter((c) => c.getBoundingClientRect().right <= vr.right).length
        const next = cards[full]
        if (!next) return null
        const nr = next.getBoundingClientRect()
        return Math.round(((vr.right - nr.left) / nr.width) * 100)
      })(),
    }
  })
}

test("homepage layout matches Stitch (desktop + mobile)", async ({ page }) => {
  await page.goto("/")
  await page.getByTestId("hero-card").waitFor({ state: "attached", timeout: 20_000 })
  // wait for webfonts so button widths are final (fallback fonts are wider and
  // can momentarily wrap the CTA buttons, making this assertion flaky)
  await page.evaluate(() => document.fonts.ready)
  const m = await metrics(page)
  const isDesktop = m.vw >= 1024

  expect(m.heroCard, "hero card must render").toBeTruthy()

  if (isDesktop) {
    // Navbar = floating rounded pill (header fixed, radius ~rounded-full)
    expect(m.headerPos).toBe("fixed")
    expect(m.navRadius! > 15, "desktop navbar must be the floating rounded pill").toBe(true)
    // Hero card must clear the navbar by a comfortable margin (Stitch pt-32)
    expect(m.heroCard!.top - m.navBottom!, "card must not touch the navbar").toBeGreaterThanOrEqual(40)
    // CTA buttons: single-line, on one row (no internal text wrap)
    expect(m.btns.length).toBe(2)
    for (const b of m.btns) expect(b.h, "button label must not wrap").toBeLessThanOrEqual(60)
    expect(Math.abs(m.btns[0].top - m.btns[1].top)).toBeLessThan(4)
    // Desktop variants
    expect(m.benDescDisplay).toBe("flex")
    expect(m.benMobDisplay).toBe("none")
    // Hero card must share the content column's right edge (not the navbar's)
    if (m.heroRight && m.catRight) {
      expect(Math.abs(m.heroRight - m.catRight), "hero card must align with content, not the navbar").toBeLessThanOrEqual(4)
    }
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

test("product cards: no translate on hover, image zooms only (Stitch)", async ({ page }) => {
  await page.goto("/")
  await page.getByTestId("hero-card").waitFor({ state: "attached", timeout: 20_000 })
  const card = page.getByTestId("product-card").first()
  await card.scrollIntoViewIfNeeded()
  await card.hover()
  await page.waitForTimeout(700)
  const after = await card.evaluate((el) => {
    const img = el.querySelector("img")
    return { translate: getComputedStyle(el).translate, imgScale: img ? getComputedStyle(img).scale : null }
  })
  // Stitch: the card must NOT lift/translate on hover — only the image zooms
  expect(after.translate, "product card must not translate on hover").toBe("none")
  expect(after.imgScale, "image must zoom on hover").not.toBe("none")
  if (after.imgScale) expect(parseFloat(after.imgScale)).toBeGreaterThan(1)
})

test("carousel next snaps to a card boundary (no half card on the left)", async ({ page }) => {
  await page.goto("/")
  await page.getByTestId("hero-card").waitFor({ state: "attached", timeout: 20_000 })
  await page.getByTestId("product-card").first().scrollIntoViewIfNeeded()
  const nextBtn = page.getByRole("button", { name: "Producto siguiente" })
  await nextBtn.click()
  await page.waitForTimeout(800)
  const aligned = await page.evaluate(() => {
    const vp = document.querySelector('[data-slot="carousel-content"]')
    const vr = vp!.getBoundingClientRect()
    const cards = [...document.querySelectorAll('[data-testid="product-card"]')]
    const leftmost = cards.find((c) => c.getBoundingClientRect().right > vr.left)
    if (!leftmost) return false
    const r = leftmost.getBoundingClientRect()
    return Math.abs(r.left - vr.left) <= 2
  })
  expect(aligned, "leftmost card must align to the container left edge after next").toBe(true)
})
