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
  await page.waitForFunction(
    () => {
      const img = document.querySelector("main img") as HTMLImageElement | null
      return !!img && img.complete
    },
    { timeout: 15_000 },
  )
  // ROOT CAUSE of this test's long-standing intermittent "card must not touch the navbar" failure:
  // the homepage is STREAMED. The server sends its content inside `<div hidden id="S:n">` containers
  // and an inline script swaps it into place afterwards; until that runs the page is a
  // viewport-height shell. Elements inside those containers are already queryable and their images
  // already report `complete`, so every wait above passes while the layout is still collapsed —
  // measured as navBottom 0 / clearance 0. (Probed and confirmed: the failing runs had the correct
  // DOM present, h1 and all, with scrollHeight == viewport.)
  //
  // So wait for the elements this test actually measures to have a layout. This does not weaken the
  // assertion: if the hero genuinely collapses, this times out and the test still fails.
  await page.waitForFunction(
    () => {
      const nav = document.querySelector('[data-testid="nav-bar"]')
      const card = document.querySelector('[data-testid="hero-card"]')
      return (
        !!nav &&
        !!card &&
        nav.getBoundingClientRect().height > 0 &&
        card.getBoundingClientRect().height > 0
      )
    },
    { timeout: 15_000 },
  )
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
  // webfonts must be loaded first: fallback fonts are wider and shift card
  // widths, which made this measurement flaky.
  // Then the same streaming caveat the homepage test documents: the page arrives inside hidden
  // Suspense containers, so elements are queryable (and images report complete) while the layout is
  // still a collapsed shell. Wait for fonts, the image, and for the navbar to actually have a
  // layout before measuring anything.
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(
    () => {
      const img = document.querySelector("main img") as HTMLImageElement | null
      return !!img && img.complete
    },
    { timeout: 15_000 },
  )
  await page.waitForFunction(
    () => {
      const nav = document.querySelector('[data-testid="nav-bar"]')
      return !!nav && nav.getBoundingClientRect().height > 0
    },
    { timeout: 15_000 },
  )
  // ensure React has hydrated (embla wired) before driving the carousel, so the
  // click actually scrolls and measures against the settled layout
  await page.waitForFunction(
    () => {
      const c = document.querySelector('[data-testid="product-card"]')
      return !!c && Object.getOwnPropertyNames(c).some((k) => k.startsWith("__react"))
    },
    { timeout: 10_000 },
  )
  await page.getByTestId("product-card").first().scrollIntoViewIfNeeded()
  const nextBtn = page.getByRole("button", { name: "Producto siguiente" })
  await nextBtn.click()
  // poll until embla's scroll settles on a card boundary (instead of a fixed sleep)
  await page.waitForFunction(
    () => {
      const vp = document.querySelector('[data-slot="carousel-content"]')
      if (!vp) return false
      const vr = vp.getBoundingClientRect()
      const cards = [...document.querySelectorAll('[data-testid="product-card"]')]
      const leftmost = cards.find((c) => c.getBoundingClientRect().right > vr.left)
      if (!leftmost) return false
      return Math.abs(leftmost.getBoundingClientRect().left - vr.left) <= 2
    },
    { timeout: 5_000 },
  )
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

// ---------------------------------------------------------------------------
// /tienda (ticket 12) — desktop sidebar + 4-col grid / mobile stacked + 2-col,
// URL-driven filters (proves client hydration), and the custom weight modal
// step behavior (gr = 50g, kg/lb = 0.5 / halves).
// ---------------------------------------------------------------------------

test("tienda layout: desktop sidebar + 3-col grid, mobile drawer + 2-col", async ({ page }) => {
  await page.goto("/tienda")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
  // /tienda has no hero image (and no <main>), so only the webfonts matter for this measurement.
  await page.evaluate(() => document.fonts.ready)
  const m = await page.evaluate(() => {
    const grid = document.querySelector('[data-testid="tienda-grid"]')
    const sidebar = document.querySelector('[data-testid="filter-sidebar"]')
    const pag = document.querySelector('[data-testid="pagination"]')
    const cards = [...document.querySelectorAll('[data-testid="catalog-card"]')]
    let cols = 0
    if (cards.length) {
      const top = cards[0].getBoundingClientRect().top
      cols = cards.filter((c) => Math.abs(c.getBoundingClientRect().top - top) < 8).length
    }
    const sr = sidebar?.getBoundingClientRect()
    const gr = grid?.getBoundingClientRect()
    return {
      vw: window.innerWidth,
      cols,
      cards: cards.length,
      pag: !!pag,
      pagText: pag ? pag.textContent || "" : "",
      toolbar: !!document.querySelector('[data-testid="tienda-toolbar"]'),
      sidebarW: sr ? Math.round(sr.width) : 0,
      sidebarLeft: sr ? Math.round(sr.left) : 0,
      sidebarBottom: sr ? Math.round(sr.bottom) : 0,
      gridLeft: gr ? Math.round(gr.left) : 0,
      gridTop: gr ? Math.round(gr.top) : 0,
    }
  })
  const desktop = m.vw >= 1024
  const cols = m.vw >= 1024 ? 3 : m.vw >= 450 ? 2 : 1
  expect(m.cards, "tienda must render product cards").toBeGreaterThan(0)
  expect(m.pag, "pagination must render").toBe(true)
  expect(m.pagText).toContain("de")
  expect(m.cols, "tienda grid column count").toBe(cols)
  if (desktop) {
    // Desktop: sidebar (lg:col-span-3) sits beside the 3-col grid, to its LEFT
    expect(m.sidebarW, "desktop filter sidebar must render").toBeGreaterThanOrEqual(200)
    expect(m.sidebarW).toBeLessThan(360)
    expect(m.sidebarLeft).toBeLessThan(m.gridLeft)
    expect(m.toolbar, "toolbar must render").toBe(true)
  } else {
    // Mobile: desktop sidebar hidden — filters open via the toolbar drawer
    expect(m.sidebarW, "mobile must hide the desktop sidebar").toBeLessThan(10)
    expect(m.toolbar, "toolbar (Filtros drawer trigger) must render on mobile").toBe(true)
  }
})

test("stacked toolbar (below lg): search and filter rows share the same edges", async ({ page }) => {
  // Two regressions lived here. (1) Tablet (768–1023) got the single-row layout, crushing the
  // search to 173px at 768 while a 264px void opened near 1023. (2) Below 768 the search group
  // kept max-w-md inside an items-center toolbar, so the search row was CENTRED while the filter
  // row spanned full width — at 762px that is a 112px left-edge mismatch. Both are covered here.
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "runs once, from the desktop project")

  await page.goto("/tienda")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })

  for (const w of [390, 640, 762, 768, 834, 1023]) {
    await page.setViewportSize({ width: w, height: 900 })
    await page.waitForTimeout(500)
    const m = await page.evaluate(() => {
      const tb = document.querySelector('[data-testid="tienda-toolbar"]') as HTMLElement
      const input = document.querySelector(
        'input[aria-label="Buscar productos en el catálogo"]',
      ) as HTMLElement
      const filtros = [...tb.querySelectorAll("button")].find((b) =>
        /Filtros/.test(b.textContent || ""),
      ) as HTMLElement
      const sort = tb.querySelector("#sort-select") as HTMLElement
      const r = (e: HTMLElement) => e.getBoundingClientRect()
      const cs = getComputedStyle(tb)
      return {
        vw: window.innerWidth,
        searchW: Math.round(r(input).width),
        searchLeft: Math.round(r(input).left),
        searchTop: Math.round(r(input).top),
        filtrosLeft: Math.round(r(filtros).left),
        filtrosTop: Math.round(r(filtros).top),
        sortRight: Math.round(r(sort).right),
        sortTop: Math.round(r(sort).top),
        innerLeft: Math.round(r(tb).left + parseFloat(cs.paddingLeft)),
        innerRight: Math.round(r(tb).right - parseFloat(cs.paddingRight)),
        overflow: tb.scrollWidth - tb.clientWidth,
      }
    })
    const at = `${m.vw}px`
    expect(m.searchW, `search must not be crushed at ${at}`).toBeGreaterThanOrEqual(240)
    expect(m.overflow, `no horizontal overflow at ${at}`).toBeLessThanOrEqual(1)
    // THE invariant: the search row and the filter row must start at the same x
    expect(Math.abs(m.searchLeft - m.filtrosLeft), `search must align with the filter row at ${at}`).toBeLessThanOrEqual(1)
    expect(Math.abs(m.filtrosLeft - m.innerLeft), `Filtros must sit on the toolbar's left edge at ${at}`).toBeLessThanOrEqual(2)
    // the filter controls share one row, stacked BELOW the search row
    expect(Math.abs(m.filtrosTop - m.sortTop), `Filtros and sort share a row at ${at}`).toBeLessThanOrEqual(4)
    expect(m.filtrosTop, `the filter row sits below the search at ${at}`).toBeGreaterThan(m.searchTop + 10)
    expect(Math.abs(m.sortRight - m.innerRight), `sort aligns to the right edge at ${at}`).toBeLessThanOrEqual(2)
  }
})

test("list view: desktop-only, card laid out horizontally", async ({ page }) => {
  await page.goto("/tienda?categoria=frutos-secos")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
  const vw = page.viewportSize()?.width ?? 0
  const toggle = page.getByRole("button", { name: "Ver en lista" })

  if (vw < 1024) {
    // The list layout needs ~190px image + ~170px actions side by side, which cannot fit a mobile
    // card (it crushed the body to ~48px and pushed the row off-screen).
    await expect(toggle, "no list view on mobile (Catálogo Móvil has none)").toBeHidden()
    return
  }

  await toggle.click()
  const m = await page.evaluate(() => {
    const grid = document.querySelector("#product-grid") as HTMLElement
    const card = document.querySelector('[data-testid="catalog-card"]') as HTMLElement
    const img = card.firstElementChild?.firstElementChild as HTMLElement
    const footer = card.lastElementChild as HTMLElement
    const b = card.getBoundingClientRect()
    const i = img.getBoundingClientRect()
    const f = footer.getBoundingClientRect()
    return {
      listClass: grid.classList.contains("is-list-view"),
      imageW: Math.round(i.width),
      horizontal: i.width < b.width / 2,
      footerOnRight: f.left >= i.right - 1,
      overflow: card.scrollWidth - card.clientWidth,
      bodyW: Math.round((card.firstElementChild?.children[1] as HTMLElement).getBoundingClientRect().width),
    }
  })
  expect(m.listClass, "the grid must switch to the list class").toBe(true)
  expect(m.imageW, "list view uses the 190px image").toBeGreaterThanOrEqual(180)
  expect(m.horizontal, "the card must be laid out horizontally").toBe(true)
  expect(m.footerOnRight, "the price/actions column must sit to the right").toBe(true)
  expect(m.bodyW, "the body must keep real width (not crushed)").toBeGreaterThan(200)
  expect(m.overflow, "no horizontal overflow").toBeLessThanOrEqual(1)
})

test("tienda filter: clicking a category updates the URL (client interactivity)", async ({ page }) => {
  await page.goto("/tienda")
  const vp = page.viewportSize()
  const isDesktop = (vp?.width ?? 0) >= 1024
  if (isDesktop) {
    await page.getByTestId("filter-sidebar").waitFor({ timeout: 20_000 })
    await page.getByTestId("filter-sidebar").getByRole("button", { name: /Frutos Secos/ }).click()
  } else {
    // Mobile: open the filter drawer from the toolbar, then pick the category
    await page.getByTestId("tienda-toolbar").waitFor({ timeout: 20_000 })
    await page.getByTestId("tienda-toolbar").getByRole("button", { name: /Filtros/ }).click()
    await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5_000 })
    await page.getByRole("dialog").getByTestId("filter-sidebar").getByRole("button", { name: /Frutos Secos/ }).click()
  }
  await page.waitForURL(/categoria=frutos-secos/, { timeout: 5_000 })
  expect(page.url()).toContain("categoria=frutos-secos")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
})

test("quick view: canonical rate, refreshed design blocks, and exact-amount maths", async ({ page }) => {
  await page.goto("/tienda?categoria=frutos-secos")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })

  const card = page
    .locator('[data-testid="catalog-card"]')
    .filter({ has: page.getByRole("heading", { name: "Almendras", exact: true }) })
    .first()
  await expect(card, "the Almendras card must render").toBeVisible()

  // The FIRST sell option (the canonical unit) is selected by default, so a card never shows a
  // price without a chosen option — and the option label carries the unit.
  const chips = card.getByRole("group", { name: "Opciones de compra" }).getByRole("button")
  await expect(chips.first(), "the first option must be 1 lb (canonical unit)").toHaveText("1 lb")
  await expect(chips.first(), "the first option must be selected by default").toHaveAttribute("aria-pressed", "true")
  await expect(card.getByTestId("card-price")).toContainText("$5.99")

  await card.click()
  const dialog = page.getByRole("dialog")
  await dialog.waitFor({ state: "visible", timeout: 5_000 })

  // The modal opens on the same first option (1 lb = the canonical unit) => $5.99, and the TOP
  // price is the canonical rate (never changes); the current selection price sits under it.
  await expect(dialog.getByTestId("modal-canonical-price")).toHaveText("$5.99")
  await expect(dialog.getByTestId("modal-selection-label")).toHaveText("1 lb")
  await expect(dialog.getByTestId("modal-price")).toHaveText("$5.99")
  await expect(dialog.getByText("Beneficios Clave")).toBeVisible()
  await expect(dialog.getByText("Envíos 24h")).toBeVisible()
  await expect(dialog.getByTestId("modal-gram-selector")).toBeVisible()
  await expect(dialog.getByTestId("modal-add-to-cart")).toBeVisible()

  // ... and the blocks the user dropped
  await expect(dialog.getByText(/Empaque/i)).toHaveCount(0)
  await expect(dialog.getByText(/Origen/i)).toHaveCount(0)
  await expect(dialog.getByText(/4\.9/)).toHaveCount(0)

  // REGRESSION: Almendras carries no weight-kind option, yet it must be buyable at ANY weight.
  const input = dialog.locator("#custom-amount")
  await expect(input, "weight-priced products must offer the exact-amount row").toBeVisible()
  expect(await input.getAttribute("step"), "gr step = 50").toBe("50")

  // 600 g of almendra = 600 × (5.99 / 453.592) = $7.92 — and the price is shown NEXT TO the input
  await input.fill("600")
  await expect(dialog.getByTestId("modal-live-amount")).toHaveText("600 g = $7.92")
  await dialog.getByRole("button", { name: "Aplicar" }).click()
  await expect(dialog.getByTestId("modal-price")).toHaveText("$7.92")

  // 50 g floor: we never sell 1 g
  await input.fill("20")
  await dialog.getByRole("button", { name: "Aplicar" }).click()
  await expect(dialog.getByTestId("modal-amount-error")).toContainText("Mínimo 50 g")

  // Exact MONEY is allowed too: "$10 de almendras"
  await dialog.locator('select[aria-label="Unidad del gramaje exacto"]').selectOption("$")
  await input.fill("10")
  await dialog.getByRole("button", { name: "Aplicar" }).click()
  await expect(dialog.getByTestId("modal-price")).toHaveText("$10.00")

  // Quantity multiplies the selection
  await dialog.getByRole("button", { name: "Añadir una unidad" }).click()
  await expect(dialog.getByTestId("modal-qty")).toHaveText("2")
  await expect(dialog.getByTestId("modal-price")).toHaveText("$20.00")

  // The CTA really adds the selection (exact $10 × 2) to the cart and closes the modal
  await dialog.getByTestId("modal-add-to-cart").click()
  await dialog.waitFor({ state: "hidden", timeout: 3_000 })
  await expect(page.getByTestId("cart-toast")).toContainText("Almendras")
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem("wg-cart") || "[]"))
  expect(cart.at(-1), "the $10 × 2 selection must be in the cart").toMatchObject({
    name: "Almendras",
    kind: "money",
    amount: 10,
    qty: 2,
    unitPrice: 10,
  })

  // Reopen and close with the design's X (regression: the card's onClick used to re-open it)
  await card.click()
  await dialog.waitFor({ state: "visible", timeout: 3_000 })

  // An exact amount in lb must echo the customer's own unit ("2 lb"), never its gram conversion
  await dialog.locator('select[aria-label="Unidad del gramaje exacto"]').selectOption("lb")
  await dialog.locator("#custom-amount").fill("2")
  await dialog.getByRole("button", { name: "Aplicar" }).click()
  await expect(dialog.getByTestId("modal-price")).toHaveText("$11.98")
  await expect(dialog.getByTestId("modal-selection-label")).toHaveText("2 lb")
  // ...and the canonical price at the top is untouched by the selection
  await expect(dialog.getByTestId("modal-canonical-price")).toHaveText("$5.99")

  // "Leer más" must not push the add-to-cart button out of view
  const leer = dialog.getByRole("button", { name: "Leer más" })
  if (await leer.isVisible()) {
    await leer.click()
    await expect(dialog.getByTestId("modal-add-to-cart"), "the CTA must stay in view").toBeInViewport()
  }

  await page.locator('[data-slot="dialog-close"]').first().click()
  await dialog.waitFor({ state: "hidden", timeout: 3_000 })
})

test("product deep link: ?producto= opens the Quick View and stays shareable", async ({ page }) => {
  // The Quick View is reachable by URL so a product can be shared — but it is NOT a product detail
  // page: the catalog renders behind it and the modal is one page-level dialog, not one per card.
  await page.goto("/tienda")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })

  // Derive the slug and name from a real card so this test does not depend on catalog data.
  const first = page.getByTestId("catalog-card").first()
  const slug = await first.getAttribute("data-slug")
  const name = (await first.getByRole("heading").first().textContent())?.trim()
  expect(slug, "cards must expose data-slug for deep linking").toBeTruthy()
  expect(name).toBeTruthy()

  // 1. a shared URL opens that product's Quick View on load
  await page.goto(`/tienda?producto=${slug}`)
  const dialog = page.getByRole("dialog")
  await dialog.waitFor({ state: "visible", timeout: 20_000 })
  await expect(dialog.getByRole("heading").first()).toHaveText(name!)

  // 2. the link previews as the PRODUCT, not the generic catalog title
  await expect(page).toHaveTitle(`${name} — Wasi Granel`)
  const meta = await page.evaluate(() => ({
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? null,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
  }))
  expect(meta.ogTitle, "shared link must carry the product name").toBe(`${name} — Wasi Granel`)
  expect(meta.canonical, "canonical must be the clean product URL").toContain(`/tienda?producto=${slug}`)
  // og:image only when the product actually has a photo (ticket 22 fills the remaining gaps)
  if (meta.ogImage) expect(meta.ogImage).toMatch(/^https?:\/\//)

  // 3. an unknown slug degrades to the plain catalog — no modal, no crash
  await page.goto("/tienda?producto=slug-que-no-existe")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
  await expect(page.getByRole("dialog")).toHaveCount(0)

  // 4. opening from a card writes the param and keeps the active filters
  await page.goto("/tienda?categoria=frutos-secos")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
  const clickedSlug = await page.getByTestId("catalog-card").first().getAttribute("data-slug")
  await page.getByTestId("catalog-card").first().click()
  await dialog.waitFor({ state: "visible", timeout: 5_000 })
  await expect(page).toHaveURL(/categoria=frutos-secos/)
  await expect(page).toHaveURL(new RegExp(`producto=${clickedSlug}`))

  // 5. Back closes it (we pushed the entry ourselves), Forward reopens it
  await page.goBack()
  await dialog.waitFor({ state: "hidden", timeout: 5_000 })
  await expect(page).not.toHaveURL(/producto=/)
  await page.goForward()
  await dialog.waitFor({ state: "visible", timeout: 5_000 })

  // 6. keyboard parity: Enter on a focused card opens the Quick View
  await page.keyboard.press("Escape")
  await dialog.waitFor({ state: "hidden", timeout: 5_000 })
  await page.waitForTimeout(500)
  const second = page.getByTestId("catalog-card").nth(1)
  const secondSlug = await second.getAttribute("data-slug")
  await second.focus()
  await page.keyboard.press("Enter")
  await dialog.waitFor({ state: "visible", timeout: 5_000 })
  await expect(page).toHaveURL(new RegExp(`producto=${secondSlug}`))

  // 7. ONE dialog serves the whole grid — a 12-card page used to mount 12 of them
  await page.keyboard.press("Escape")
  await dialog.waitFor({ state: "hidden", timeout: 5_000 })
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)
})

test("card Agregar adds to the cart and does NOT open the Quick View", async ({ page }) => {
  await page.goto("/tienda?categoria=frutos-secos")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
  const card = page
    .locator('[data-testid="catalog-card"]')
    .filter({ has: page.getByRole("heading", { name: "Almendras", exact: true }) })
    .first()
  const chips = card.getByRole("group", { name: "Opciones de compra" }).getByRole("button")

  await card.getByRole("button", { name: "Agregar Almendras" }).click()

  // Toast confirms the add, with the selected option
  const toast = page.getByTestId("cart-toast")
  await expect(toast).toBeVisible({ timeout: 3_000 })
  await expect(toast).toContainText("Almendras")
  await expect(toast).toContainText("1 lb")

  // The Quick View must NOT have opened
  await expect(page.getByRole("dialog")).toHaveCount(0)

  // ...and the line is really in the cart (the selected option, qty 1)
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem("wg-cart") || "[]"))
  expect(cart.length, "one cart line").toBe(1)
  expect(cart[0]).toMatchObject({ name: "Almendras", label: "1 lb", kind: "weight", qty: 1, unitPrice: 5.99 })

  // The customise control must be icon-only and sit on the SAME line as the chips
  const customize = card.getByRole("button", { name: "Personalizar Almendras" })
  const box = await customize.boundingBox()
  const chipBox = await chips.first().boundingBox()
  expect(box!.width, "customise button must be icon-only (fits the row)").toBeLessThanOrEqual(30)
  expect(Math.abs(box!.height - chipBox!.height), "same height as the chips").toBeLessThanOrEqual(2)
  expect(Math.abs(box!.y - chipBox!.y), "customise must sit on the chips' line").toBeLessThanOrEqual(2)
})

test("cart: navbar drawer, live lines, and the agreed exclusions", async ({ page }) => {
  await page.goto("/tienda?categoria=frutos-secos")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })

  const card = page.getByTestId("catalog-card").first()
  const name = (await card.getByRole("heading").first().textContent())?.trim()
  expect(name).toBeTruthy()

  // nothing in the cart yet -> no badge
  await expect(page.getByTestId("cart-counter")).toHaveCount(0)

  // the REAL add-to-cart path from ticket 12 populates the cart (not seeded data)
  await card.getByRole("button", { name: new RegExp(`Agregar ${name}`) }).click()
  await expect(page.getByTestId("cart-toast")).toBeVisible({ timeout: 5_000 })
  await expect(page.getByTestId("cart-counter")).toHaveText("1")

  // open from the navbar
  await page.getByTestId("nav-cart-btn").click()
  const drawer = page.getByTestId("cart-drawer")
  await drawer.waitFor({ state: "visible", timeout: 5_000 })

  await expect(drawer.getByTestId("cart-line")).toHaveCount(1)
  await expect(drawer.getByTestId("cart-line").first().getByRole("heading")).toHaveText(name!)
  await expect(drawer.getByTestId("cart-line-option").first()).toHaveText("1 lb")
  await expect(drawer.getByTestId("cart-line-qty").first()).toHaveText("1")
  await expect(drawer.getByTestId("cart-count-text")).toHaveText("1 producto seleccionado")

  // AGREED EXCLUSIONS (user decisions, ticket 14): no packaging, no tax line, no free-shipping bar
  const text = (await drawer.textContent()) || ""
  expect(text, "packaging must not appear").not.toMatch(/Envases Retornables|Frasco de Vidrio|dep[óo]sito/i)
  expect(text, "no tax line").not.toMatch(/Impuestos/i)
  expect(text, "free-shipping bar is gated off").not.toMatch(/Env[íi]o Gratis/i)
  // checkout belongs to ticket 23 — present in the mockup's shape, but not functional
  await expect(drawer.getByTestId("cart-checkout")).toBeDisabled()

  // stepper is live, and so is the navbar badge
  await drawer.getByRole("button", { name: new RegExp(`Añadir una unidad de ${name}`) }).click()
  await expect(drawer.getByTestId("cart-line-qty").first()).toHaveText("2")
  await expect(page.getByTestId("cart-counter")).toHaveText("2")
  await drawer.getByRole("button", { name: new RegExp(`Quitar una unidad de ${name}`) }).click()
  await expect(drawer.getByTestId("cart-line-qty").first()).toHaveText("1")

  // Escape closes; reopening keeps the state
  await page.keyboard.press("Escape")
  await drawer.waitFor({ state: "hidden", timeout: 5_000 })
  await page.getByTestId("nav-cart-btn").click()
  await drawer.waitFor({ state: "visible", timeout: 5_000 })
  await expect(drawer.getByTestId("cart-line")).toHaveCount(1)

  // removing the last line shows the empty state and clears the badge
  await drawer.getByRole("button", { name: new RegExp(`Eliminar ${name}`) }).click()
  await expect(drawer.getByTestId("cart-empty")).toBeVisible({ timeout: 5_000 })
  await expect(page.getByTestId("cart-counter")).toHaveCount(0)

  // the cart is mounted at the root, so it is available off the catalog too
  await page.keyboard.press("Escape")
  await drawer.waitFor({ state: "hidden", timeout: 5_000 })
  await page.goto("/")
  await page.waitForTimeout(500)
  await page.getByTestId("nav-cart-btn").click()
  await expect(page.getByTestId("cart-drawer")).toBeVisible({ timeout: 5_000 })
})

test("contacto: renders the real store data and none of the mockup's inventions", async ({ page }) => {
  await page.goto("/contacto")
  await page.getByTestId("sucursal-tabs").waitFor({ timeout: 20_000 })
  const body = (await page.textContent("body")) || ""

  // The Stitch mockup invented every customer-facing fact on this page — both phone numbers, both
  // street addresses, the hours, a Quito branch that does not exist, the store features and the
  // "200+ references" claim. One of those invented numbers was also live in the footer. None may
  // appear. See lib/store-info.ts and ticket 15.
  const forbidden: [string, RegExp][] = [
    ["the mockup's invented phone", /9\s?8765\s?4321/],
    ["the mockup's second invented phone", /9\s?9123\s?4567/],
    ["the old stub's phone", /986\s?016\s?764/],
    ["the old contact address", /hola@wasigranel\.com/],
    ["the old brand (Jatunwasi)", /Jatunwasi/i],
    ["a Quito branch that does not exist", /Wasi Granel Quito|La Floresta|Guipúzcoa/i],
    ["the footer's old 'Riobamba · Quito'", /Riobamba · Quito/],
    ["invented store features", /Taras automáticas|Bicimensajería|Barra de Cremas/i],
    ["the invented scale claim", /200 referencias/i],
    // not invented, but superseded: the owner first said 9:00, then confirmed the store's Google
    // listing's 8:00. Guarded so the earlier value cannot quietly come back.
    ["the superseded 9:00 opening", /Lunes a Sábado: 9:00/],
  ]
  for (const [what, re] of forbidden) {
    expect(body, `${what} must not appear`).not.toMatch(re)
  }

  // ...and the real data must be there (the Sucursal address is asserted after its tab is opened,
  // since the panel shows one store at a time)
  expect(body, "Matriz address").toMatch(/Guayaquil y Benalcázar 1815/i)
  expect(body, "the real opening hours").toMatch(/Lunes a Sábado: 8:00 – 19:00/i)
  expect(body, "the store email").toMatch(/info@wasigranel\.com/)
  expect(body, "nationwide courier").toMatch(/Servientrega/)

  // "casas" read oddly for two shop premises (owner). They are "locales" now, and the badge count is
  // derived from the data instead of hardcoded, so adding a third store cannot leave it stale.
  expect(body, "the two premises").toMatch(/Dos locales en Riobamba/i)
  await expect(page.getByTestId("hero-locales-badge")).toHaveText("2 Locales")
  expect(body, "no 'casas' for the premises").not.toMatch(/\d+ Casas|Dos casas/i)

  // The panel is TABBED (as the mockup has it), so one store renders at a time — check both by
  // switching tabs. Each carries its OWN number, linked to WhatsApp.
  const card = page.getByTestId("sucursal-card")
  await expect(card).toHaveAttribute("data-sucursal", "matriz")
  await expect(card.getByTestId("sucursal-phone")).toHaveText("099 087 6620")
  await expect(card.getByTestId("sucursal-phone")).toHaveAttribute("href", /wa\.me\/593990876620/)
  await expect(card.getByTestId("sucursal-address")).toContainText("Guayaquil y Benalcázar 1815")

  await page.getByRole("tab", { name: /Sucursal/ }).click()
  await expect(card).toHaveAttribute("data-sucursal", "sucursal")
  await expect(card.getByTestId("sucursal-phone")).toHaveText("099 147 5809")
  await expect(card.getByTestId("sucursal-phone")).toHaveAttribute("href", /wa\.me\/593991475809/)
  await expect(card.getByTestId("sucursal-address")).toContainText("Juan Montalvo y Av. José Veloz")

  // the footer, which was wrong on every page of the site until now
  await expect(page.getByTestId("footer-phone")).toHaveText("099 087 6620")
  await expect(page.getByTestId("footer-email")).toHaveText("info@wasigranel.com")

  // The hero CTA opens WhatsApp for real (it used to jump to an on-page anchor)
  await expect(page.getByTestId("hero-whatsapp")).toHaveAttribute("href", /wa\.me\/593990876620/)

  // The maps are the stores' REAL Google listings — the mockup's map was an illustration with
  // invented streets, so a stylized SVG must not be back.
  //
  // And they must be resolved by CID: that is what makes the embed return the actual business.
  // Neither other form works — a coordinate pin (`q=lat,lng`) draws a pin with NO store info
  // ("now it is not showing in both" — the owner), and a name/address query lets Google pick a
  // different business entirely (the Matriz query landed on a supermarket a block away).
  // (the assertions above left the panel on Sucursal, so select Matriz explicitly)
  await page.getByRole("tab", { name: /Matriz/ }).click()
  await expect(page.getByTestId("store-map")).toHaveAttribute(
    "src",
    /google\.com\/maps\?cid=3890135433661531628/,
  )
  await expect(page.getByTestId("sucursal-directions")).toHaveAttribute(
    "href",
    "https://maps.app.goo.gl/YN79ofZo9A6BeANu6",
  )
  await page.getByRole("tab", { name: /Sucursal/ }).click()
  await expect(page.getByTestId("store-map")).toHaveAttribute(
    "src",
    /google\.com\/maps\?cid=7633805034067010969/,
  )
  await expect(page.getByTestId("sucursal-directions")).toHaveAttribute(
    "href",
    "https://maps.app.goo.gl/dhzgsJtQoUTa9kPA6",
  )
})

test("contacto: the form validates and never fakes a successful send", async ({ page }) => {
  await page.goto("/contacto")
  await page.getByTestId("contact-form").waitFor({ timeout: 20_000 })

  // an empty submit surfaces every validation error...
  await page.getByTestId("contact-submit").click()
  await expect(page.getByTestId("error-name")).toBeVisible()
  await expect(page.getByTestId("error-phone")).toBeVisible()
  await expect(page.getByTestId("error-email")).toBeVisible()
  await expect(page.getByTestId("error-message")).toBeVisible()
  await expect(page.getByTestId("error-consent")).toBeVisible()
  // ...and must NOT claim the message arrived (the mockup shows "¡Mensaje recibido con éxito!")
  expect((await page.textContent("body")) || "", "must not claim the message was received").not.toMatch(
    /recibido con éxito/i,
  )

  // a valid submit lands in the honest "not connected yet" state — the receiver is ticket 25
  // (field ids are the mockup's own)
  await page.fill("#full-name", "Camila Morales")
  await page.fill("#contact-phone", "0999999999")
  await page.fill("#contact-email", "camila@example.com")
  await page.fill("#contact-message", "Quisiera consultar por almendras al por mayor.")
  await page.check("#privacy-policy")
  await page.getByTestId("contact-submit").click()
  await expect(page.getByTestId("contact-not-wired")).toBeVisible()
  await expect(page.getByTestId("contact-not-wired")).toContainText("todavía no está conectado")

  // the consent checkbox opens the privacy statement (a modal, not a page — user decision)
  await page.getByTestId("privacy-trigger").click()
  await expect(page.getByTestId("privacy-modal")).toBeVisible()

  // "Sucursal de Interés" was removed at the owner's request
  await page.keyboard.press("Escape")
  await expect(page.locator("#location-select")).toHaveCount(0)
  await expect(page.getByTestId("contact-form")).not.toContainText("Sucursal de Interés")
})

test("unit-priced product: plain numeric quantity, no weight pills", async ({ page }) => {
  await page.goto("/tienda?q=Manzanilla")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
  const card = page
    .locator('[data-testid="catalog-card"]')
    .filter({ has: page.getByRole("heading", { name: /Manzanilla/ }) })
    .first()
  await card.click()
  const dialog = page.getByRole("dialog")
  await dialog.waitFor({ state: "visible", timeout: 5_000 })

  await expect(dialog.locator("#unit-qty"), "unit products ask for a quantity").toBeVisible()
  await expect(dialog.getByTestId("modal-gram-selector"), "unit products get no weight pills").toHaveCount(0)

  const price = dialog.getByTestId("modal-price")
  await expect(price).toHaveText("$1.25")
  await dialog.locator("#unit-qty").fill("3")
  await expect(price).toHaveText("$3.75")

  await page.keyboard.press("Escape")
  await dialog.waitFor({ state: "hidden", timeout: 3_000 })
})

test("price sort applies (canonical price field)", async ({ page }) => {
  await page.goto("/tienda?sort=precio-asc")
  await page.getByTestId("catalog-card").first().waitFor({ timeout: 20_000 })
  const prices = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="catalog-card"] .item-price')].map((el) =>
      parseFloat((el.textContent || "").replace(/[^0-9.]/g, "")),
    ),
  )
  expect(prices.length).toBeGreaterThan(0)
  const sorted = [...prices].sort((a, b) => a - b)
  expect(prices, "precio-asc must order canonical prices ascending").toEqual(sorted)
})

test("tienda loading state: real banner shows immediately and does not shift", async ({ page }) => {
  // Delay the /tienda navigation response so the route's loading state is observable
  await page.route(/\/tienda(\?|$)/, async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.continue()
  })
  await page.goto("/")
  await page.getByTestId("hero-card").waitFor({ timeout: 20_000 })

  // Trigger the client-side navigation programmatically (no mouse hover): hovering would
  // fire Next's prefetch, which sometimes resolves before the loading state can render.
  await page.evaluate(() => {
    const a = document.querySelector('a[href="/tienda"]') as HTMLAnchorElement | null
    a?.click()
  })

  await page.getByTestId("catalog-skeleton").waitFor({ state: "visible", timeout: 10_000 })
  // let the loading state actually paint before measuring
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))),
  )

  const during = await page.evaluate(() => {
    const banner = document.querySelector('[data-testid="shop-banner"]')
    const h1 = banner?.querySelector("h1")
    const r = banner?.getBoundingClientRect()
    return {
      title: h1?.textContent?.trim() ?? "",
      h: r ? Math.round(r.height) : -1,
      vw: window.innerWidth,
      scrollbar: window.innerWidth - document.documentElement.clientWidth,
    }
  })

  await page.getByTestId("catalog-card").first().waitFor({ timeout: 30_000 })
  await page.getByTestId("catalog-skeleton").waitFor({ state: "detached", timeout: 30_000 })
  const after = await page.evaluate(() => {
    const banner = document.querySelector('[data-testid="shop-banner"]')
    const r = banner?.getBoundingClientRect()
    return {
      h: r ? Math.round(r.height) : -1,
      vw: window.innerWidth,
      scrollbar: window.innerWidth - document.documentElement.clientWidth,
    }
  })

  // the real title is in the loading state (not a skeleton) ...
  expect(during.title, "title must render during loading, not a skeleton").toContain("Despensa Consciente")
  // ... and the banner occupies the same height before and after load (no vertical shift)
  expect(
    after.h,
    `banner height must not change after load (during=${during.h} vw=${during.vw} sb=${during.scrollbar} | after=${after.h} vw=${after.vw} sb=${after.scrollbar})`,
  ).toBe(during.h)
})
