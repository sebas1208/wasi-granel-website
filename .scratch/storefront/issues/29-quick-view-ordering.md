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

**The label problem is already solved:** weight options carry no display label, so the UI derives it from
`weightGrams` — `formatInUnit()` in `apps/web/lib/payload.ts` exists for exactly that.

**Expected consequence for the CMS:** if a dollar option becomes selectable, `Orders.items[].kind` is an enum
of `('weight', 'unit')` and has **no `money` value**. That needs a migration — see the grill on ticket 23,
where the recommendation is to add it now so one migration covers both.

**Where the order record stands:** a cart line already carries `optionLabel`, a multiplier (`qty`) and/or an
amount, so **`Orders` needs no structural change** for this beyond that enum value.

## Acceptance
- [ ] The Quick View offers only the product's defined options, each with a multiplier.
- [ ] A dollar amount is offered for weight-priced products and **not** for unit-priced ones.
- [ ] No free-text or arbitrary-weight input remains anywhere in the ordering path.
- [ ] Weight options display a derived label (e.g. 454 → "1 lb").
- [ ] `check:layout` green at desktop 1280 and mobile 390; `tsc` and `lint` clean.
