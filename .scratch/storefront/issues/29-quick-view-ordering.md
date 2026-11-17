# 29: Quick View ordering — defined options with multipliers, no free weight

**Status:** ready-for-agent — decided by the owner 2026-11-17; not started.

**What to build:** the ordering control in the product Quick View. Today it accepts an **arbitrary weight**;
the owner wants that removed.

**Decided by the owner 2026-11-17** (it surfaced while planning checkout, ticket 23):

- **The free weight input goes.** A customer picks from the product's **defined options**, not a weight they
  invent.
- **Multipliers (quantity) apply to EVERY option kind** — 1 lb / 2 lb / 3 lb, $5 / $10, and several Porciones.
- **The dollar amount is offered on weight-priced products only.** You cannot buy *"a dollar of a unit"* —
  `unit` options (Porción, Funda, Unidad) have quantity but no dollar field.
- The 50 g minimum (`MIN_GRAMS`) stops being a customer-facing rule, because arbitrary weights — and so
  arbitrary weights below it — are no longer expressible. **Confirm** whether any minimum still applies to
  multiples (e.g. a single ½ lb option is 227 g, comfortably above it).

**What the data gives us** (`.scratch/storefront/canonical/products.json`, 278 products):

| shape | count | contents |
| --- | --- | --- |
| `{kind, label, price}` | 264 | `unit` options — Porción ×146, Funda ×57, Unidad ×3, Paquete ×1 |
| `{kind, price, weightGrams}` | 159 | `weight` options — a gram value and a price, **no label** |

There is also a `money` kind already present in the data (Quinoa Roja has one), which is the dollar option.

**The open question is answered:** the 50 g rule (`MIN_GRAMS`) stops being customer-facing entirely, because
arbitrary weights — the only way to get below it — become unexpressible. The implementer should still assert
that no *defined* option in the canonical catalog prices below 227 g (½ lb), since a defined option is what
would replace it.

**The label problem is already solved:** weight options carry no display label, so the UI derives it from
`weightGrams` — `formatInUnit()` in `apps/web/lib/payload.ts` exists for exactly that.

**The CMS side is already done:** ticket 23's migration `20261117_161338` added `money` to
`enum_orders_items_kind`, and the write path validates `weight` → grams > 0, `money` → amount > 0,
`unit` → neither. So this ticket needs **no** schema change — it is UI and pricing logic only.

**Where the order record stands:** a cart line already carries `optionLabel`, a multiplier (`qty`) and/or an
amount, so **`Orders` needs no structural change** for this beyond that enum value.

## Plan

Everything needed already exists in `apps/web/lib/payload.ts`; this is mostly one component and its
consequences.

**Files**
- `apps/web/components/tienda/weight-modal.tsx` — the ordering control and the whole of the work. It holds the
  free-amount input (`#custom-amount`), the gram pills (`modal-gram-selector`), the unit quantity (`#unit-qty`)
  and four `MIN_GRAMS` gates (lines ~121, 158, 169, 401) that all come out.
- `apps/web/lib/payload.ts` — helpers only, no removals: `productOptions`, `weightOptions` / `moneyOptions` /
  `unitOptions`, `optionPrice`, `optionLabel`, `formatInUnit`, `formatGrams`, `minMoney`, `gramsForMoney`.
  `MIN_GRAMS` itself stays (the pricing floor maths uses it) even though it stops being a customer-facing rule.
- `apps/web/lib/cart.ts` — no shape change: a line already carries `optionLabel`, `qty` and `amount`.

**Steps**
1. The control renders the product's **defined options** only. Each option row takes a multiplier, for every
   kind — more Porciones, more 1 lb bags, more $5 units.
2. The dollar field appears **only for weight-priced products** — never for `unit` options, which take a
   quantity and nothing else.
3. Delete the free weight input and its validation, and all four `MIN_GRAMS` error paths.
4. Weight options get their label from `formatInUnit(grams)`; `formatGrams` covers the gram display.

**The gate will need updating, and this is the part to get right.** `e2e/layout.spec.ts` currently protects
the behaviour this ticket removes:
- line ~413 asserts a product with **no weight-kind option** "must be buyable at ANY weight", and fills
  `#custom-amount` — the exact thing being deleted.
- line ~463 asserts the error text `Mínimo 50 g`.
- line ~605 matches a cart line on `label: "1 lb"` with an `amount` — the shape changes.
These assertions must be **updated to the new truth with a comment naming the owner's decision**, exactly as
the checkout button's `toBeDisabled` assertion was when ticket 23 made it functional. Deleting the test or
loosening it to always-pass is not acceptable; the ordering control must still be asserted, on its new rules.

**Absorbs a ticket-24 item:** the dead `grams` / `suffix` locals in `weight-modal.tsx` (~lines 77, 89) are in
the file being rewritten, so they go with it. Worth striking from ticket 24 rather than leaving a stale entry.

**Verification:** the Quick View is client-interactive, so browser-verify both viewports per `AGENTS.md`, plus
`check:layout` green, `tsc` and `lint` clean.

## Acceptance
- [ ] The Quick View offers only the product's defined options, each with a multiplier.
- [ ] A dollar amount is offered for weight-priced products and **not** for unit-priced ones.
- [ ] No free-text or arbitrary-weight input remains anywhere in the ordering path.
- [ ] Weight options display a derived label (e.g. 454 → "1 lb").
- [ ] `check:layout` green at desktop 1280 and mobile 390; `tsc` and `lint` clean.
