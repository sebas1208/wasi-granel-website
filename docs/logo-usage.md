# Logo usage

The Wasi Granel brand mark is a single source of truth: `apps/web/public/logo.svg`
(the official vector mark — yellow `#FCBF00` on transparent, ~2.11:1).

## Pick a rendering mode

**Static file** — use directly when you need an `<img>`/`<Image>` or the favicon:

```tsx
<Image src="/logo.svg" alt="Wasi Granel" width={120} height={40} className="h-8 w-auto" />
```

The favicon/app-icon is `app/icon.svg` (onyx isotipo), not this file.

**Runtime color — the `.wasi-logo` utility (recommended for UI).**
Renders the same mark but fills it with `currentColor`, so the Tailwind `text-*`
class sets the color at runtime — no per-color static files needed:

```tsx
<span className="wasi-logo h-8 text-primary" role="img" aria-label="Wasi Granel" /> {/* yellow */}
<span className="wasi-logo h-8 text-white" role="img" aria-label="Wasi Granel" />   {/* white (footer/dark) */}
<span className="wasi-logo h-8 text-secondary" role="img" aria-label="Wasi Granel" /> {/* café */}
```

Set `height` (`h-6`, `h-8`, …); **width follows from the intrinsic aspect ratio**.
`aria-label` keeps it accessible; `role="img"` marks the decorative SVG-as-mask.

## Where each goes (contrast rules, brand manual §3.3)

| Surface | Colour |
|---|---|
| Cream / white background (navbar) | yellow (`text-primary`) |
| Brown / dark (footer, CTA band) | white (`text-white`) |
| Sand / neutral `#C1B1A3` | café or warm gray (`text-secondary` / `text-neutral-medium`) |
| Black / monochrome | white or yellow |

Overrides the old plan of shipping separate `logo.svg` / `logo-white.svg` /
`isotipo.svg` static copies — the mask gives every variant from one source.