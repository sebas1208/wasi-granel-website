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
  await page.evaluate(async () => {
    await document.fonts.ready
    // hero image drives the section height (card clearance) — wait for it so the
    // measurement isn't taken while the section is still short.
    const img = document.querySelector("main img") as HTMLImageElement | null
    if (img && !img.complete) await new Promise((r) => { img.onload = img.onerror = r })
  })
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
  await page.evaluate(async () => {
    await document.fonts.ready
    // hero image drives the section height (card clearance) — wait for it so the
    // measurement isn't taken while the section is still short.
    const img = document.querySelector("main img") as HTMLImageElement | null
    if (img && !img.complete) await new Promise((r) => { img.onload = img.onerror = r })
  })
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
  await page.evaluate(async () => {
    await document.fonts.ready
    // hero image drives the section height (card clearance) — wait for it so the
    // measurement isn't taken while the section is still short.
    const img = document.querySelector("main img") as HTMLImageElement | null
    if (img && !img.complete) await new Promise((r) => { img.onload = img.onerror = r })
  })
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
  expect(m.cards, "tienda must render product cards").toBeGreaterThan(0)
  expect(m.pag, "pagination must render").toBe(true)
  expect(m.pagText).toContain("de")
  expect(m.cols, "tienda grid column count").toBe(desktop ? 3 : 2)
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

  // The modal opens on the same first option (1 lb = the canonical unit) => $5.99
  await expect(dialog.getByTestId("modal-price")).toHaveText("$5.99")
  await expect(dialog.getByTestId("modal-canonical-rate")).toContainText("/ lb")
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

  // 600 g of almendra = 600 × (5.99 / 453.592) = $7.92
  await input.fill("600")
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
  await expect(dialog.getByText("/ 2 lb")).toBeVisible()

  // "Leer más" must not push the add-to-cart button out of view
  const leer = dialog.getByRole("button", { name: "Leer más" })
  if (await leer.isVisible()) {
    await leer.click()
    await expect(dialog.getByTestId("modal-add-to-cart"), "the CTA must stay in view").toBeInViewport()
  }

  await page.locator('[data-slot="dialog-close"]').first().click()
  await dialog.waitFor({ state: "hidden", timeout: 3_000 })
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
