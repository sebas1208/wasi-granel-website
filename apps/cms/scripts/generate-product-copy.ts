/**
 * Generate product marketing copy (shortDescription, description, benefits) with an LLM.
 *
 *   set -a; . ~/.hermes/.env; set +a
 *   pnpm --filter @wasi-granel/cms exec tsx scripts/generate-product-copy.ts \
 *     [--model google/gemini-2.5-flash] [--batch 10] [--concurrency 3] [--timeout 180] \
 *     [--limit N] [--out path] [--force] [--dry-run]
 *
 * Design notes:
 * - RESUMABLE + IDEMPOTENT: every batch is appended to the JSONL as soon as it returns, and
 *   products already present at the current prompt version (pv) are skipped. Re-running after
 *   an interruption continues where it stopped; `--force` regenerates everything.
 * - REUSES PRIOR WORK: a product whose stored draft has an older pv is regenerated, but its
 *   previous draft is passed to the model as BORRADOR PREVIO to improve on.
 * - Reads the catalog from the CMS REST API (no DB needed), batches products per call, retries
 *   each batch and keeps going if one fails.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROMPT_VERSION = 'v4'
const DEFAULT_MODEL = 'google/gemini-2.5-flash'

type Dict = Record<string, any>
type Doc = { slug: string; name: string; category?: string; price?: number; priceUnit?: string; description?: string }

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const next = process.argv[i + 1]
  return !next || next.startsWith('--') ? 'true' : next
}

const MODEL = arg('model', DEFAULT_MODEL)!
const BATCH = Number(arg('batch', '10'))
const LIMIT = Number(arg('limit', '0'))
/** Paths resolve against the REPO ROOT, not the cwd (`pnpm --filter` runs inside apps/cms). */
const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)))
const OUT_ARG = arg('out', '.scratch/storefront/copy/drafts.jsonl')!
const OUT = path.isAbsolute(OUT_ARG) ? OUT_ARG : path.join(REPO_ROOT, OUT_ARG)
const FORCE = process.argv.includes('--force')
const DRY = process.argv.includes('--dry-run')
const CONC = Math.max(1, Number(arg('concurrency', '3')))
const REQ_TIMEOUT_MS = Math.max(30, Number(arg('timeout', '180'))) * 1000
const CMS = (process.env.PAYLOAD_URL || 'https://payload.wasigranel.com').replace(/\/$/, '')
const KEY = process.env.OPENROUTER_API_KEY

const SYSTEM = `Eres copywriter de Wasi Granel, tienda ecuatoriana de frutos secos, semillas, granos, hierbas y deshidratados a granel (venta al peso). Escribes en espanol de Ecuador, con tono calido, apetitoso y concreto.

REGLAS
1. Usa SOLO la informacion del TEXTO FUENTE y del BORRADOR PREVIO. No inventes origen, certificaciones, procesos ni premios.
2. "benefits": exactamente 3 beneficios, maximo 80 caracteres cada uno.
   PERMITIDO, siempre como caracteristica del alimento: nutricion y bienestar general. Ejemplos validos: "buena fuente de vitamina E", "aporta fibra y energia", "grasas monoinsaturadas favorables para el corazon", "tradicionalmente usada para la digestion", "ayuda a la relajacion".
   PROHIBIDO, nunca, ni en benefits ni en description: decir que cura, trata, previene, combate o alivia enfermedades; nombrar enfermedades o patogenos (cancer, diabetes, ulceras, gastritis, parasitos, Helicobacter, hipertension, colesterol alto, artritis, asma); indicar dosis o pautas terapeuticas ("2 tazas al dia para..."); usar los verbos curar, tratar, prevenir, combatir, eliminar, desintoxicar, adelgazar, aliviar; frases como "eficaz contra", "antibacteriano", "antiparasitario", "antiinflamatorio".
3. "description": markdown de 900 a 1400 caracteres. Estructura: 2-3 frases de introduccion apetitosa; linea en blanco; 5-7 puntos, cada uno en su PROPIA linea empezando con "- "; y una frase final de uso o cierre. Sin encabezados con #. Puedes explicar como prepararlo o usarlo en la cocina con cantidades culinarias (ej: una cucharadita por taza), nunca con fines medicinales.
4. "shortDescription": maximo 110 caracteres, sin precio, sin punto final, con gancho de marketing y variando el inicio entre productos.
5. Si el TEXTO FUENTE trae una advertencia (embarazo, lactancia, moderacion, toxicidad), incluyela como ULTIMA linea de "description" empezando con "**Nota:**", en tono informativo y sin presentarla como indicacion medica.
6. Devuelve SOLO JSON valido, sin texto adicional ni bloques de codigo.`

function log(...a: unknown[]) { console.log(new Date().toISOString().slice(11, 19), ...a) }

/** Wording that must never reach the storefront: disease, pathogen, treatment or dosing claims. */
const BANNED: RegExp[] = [
  /\bcur(a|ar|an|arse)\b/i, /\btrata(r|miento|mientos)\b/i, /\bprevien(e|en)\b/i, /\bprevenci[oó]n\b/i,
  /\bcombat(e|en|ir|iendo)\b/i, /\balivi(a|ar|an)\b/i, /\belimin(a|ar|an)\b/i,
  /\bdesintoxic\w*/i, /\badelgaz\w*/i, /\beficaz contra\b/i,
  /\bantibacterian\w*/i, /\bantiparasitari\w*/i, /\bantiinflamatori\w*/i, /\bantibi[oó]tic\w*/i,
  /\b(c[aá]ncer|diabetes|hipertensi[oó]n|[uú]lcera\w*|gastritis|par[aá]sit\w*|helicobacter|artritis|asma|colesterol alto)\b/i,
  /\b(dosis|2 a 3 tazas|tazas al d[ií]a|cucharadas al d[ií]a|al d[ií]a para)\b/i,
]

function checkCompliance(rows: Dict[]): Map<string, string[]> {
  const bad = new Map<string, string[]>()
  for (const r of rows) {
    const text = `${r.shortDescription ?? ''}\n${r.description ?? ''}\n${(r.benefits ?? []).join('\n')}`
    const hits = [...new Set(BANNED.flatMap((re) => (text.match(re) ?? []).map((m) => m.toLowerCase())))]
    if (hits.length) bad.set(r.slug, hits)
  }
  return bad
}

const MAX_SHORT = 110
const MIN_DESC = 900

/** Trim a short description to the limit — the model overshoots, and a blind cut leaves dangling
 *  fragments ("...como snack o en"). Prefer cutting at punctuation, then drop trailing connectors. */
const CONNECTORS = new Set(['y', 'o', 'e', 'u', 'para', 'en', 'con', 'de', 'del', 'la', 'el', 'los', 'las',
  'un', 'una', 'tu', 'tus', 'su', 'sus', 'que', 'como', 'muy', 'mas', 'más', 'sin', 'al', 'a', 'por', 'es', 'son', 'se', 'mi', 'lo'])
function trimShort(s: string): string {
  let t = (s ?? '').trim().replace(/[.,;:]+$/, '')
  if (t.length > MAX_SHORT) {
    const window = t.slice(0, MAX_SHORT + 1)
    const punct = Math.max(window.lastIndexOf(', '), window.lastIndexOf('. '))
    if (punct > 60) t = t.slice(0, punct)
    else {
      const cut = window.lastIndexOf(' ')
      t = cut > 40 ? t.slice(0, cut) : t.slice(0, MAX_SHORT)
    }
  }
  // Always drop a trailing connector: a short description must not end in "y" / "o" / "para" / "en".
  const words = t.split(' ')
  while (words.length && CONNECTORS.has(words[words.length - 1].toLowerCase().replace(/[.,;:]/g, ''))) words.pop()
  return words.join(' ').replace(/[\s,;:.-]+$/, '')
}

function enforceLimits(rows: Dict[]): Dict[] {
  return rows.map((r) => ({ ...r, shortDescription: trimShort(r.shortDescription) }))
}

/** One expansion pass for descriptions below the target length. */
async function expandDescriptions(rows: Dict[]): Promise<Dict[] | null> {
  const payload = rows.map((r) => ({ slug: r.slug, name: r.name, description: r.description }))
  const user = `Estas descripciones son demasiado cortas. Amplialas a 900-1400 caracteres manteniendo EXACTAMENTE los mismos datos (no inventes nada), el tono atractivo y las reglas de salud (nada de enfermedades, patogenos, tratamientos ni dosis), con intro, 5-7 puntos "- " en lineas propias y una frase final de uso. Devuelve SOLO JSON {"items":[{"slug","description"}]} con los mismos slugs.\n\nDESCRIPCIONES A AMPLIAR:\n${JSON.stringify(payload)}`
  return chat(user, payload.length)
}

/** Compliance gate: rewrite once, then drop whatever still violates (it is never written). */
async function gate(rows: Dict[], tag: string): Promise<{ rows: Dict[]; repaired: boolean; dropped: number }> {
  let bad = checkCompliance(rows)
  if (!bad.size) return { rows, repaired: false, dropped: 0 }
  log(`${tag}: compliance hits on ${bad.size} item(s) (${[...bad.keys()].join(', ')}) -> rewrite pass`)
  try {
    const fixed = await repairBatch(rows, bad)
    if (fixed?.length) {
      const byslug = new Map(fixed.map((f) => [f.slug, f]))
      rows = rows.map((r) => {
        const f = byslug.get(r.slug)
        if (!f) return r
        return {
          ...r,
          shortDescription: (f.shortDescription ?? r.shortDescription).trim(),
          description: (f.description ?? r.description).trim(),
          benefits: (Array.isArray(f.benefits) ? f.benefits : r.benefits).slice(0, 3).map((b: string) => String(b).trim()),
        }
      })
    }
  } catch (e) { log(`${tag} rewrite failed: ${(e as Error).message}`) }
  bad = checkCompliance(rows)
  if (bad.size) {
    log(`${tag}: dropping ${bad.size} still-non-compliant item(s): ${[...bad.keys()].join(', ')}`)
    return { rows: rows.filter((r) => !bad.has(r.slug)), repaired: true, dropped: bad.size }
  }
  return { rows, repaired: true, dropped: 0 }
}

async function fetchDocs(): Promise<Doc[]> {
  const url = `${CMS}/api/products?limit=500&depth=1&sort=name`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`catalog fetch failed: ${res.status}`)
  const json: Dict = await res.json()
  return (json.docs as Dict[]).map((p) => ({
    slug: p.slug,
    name: p.name,
    category: (p.category && typeof p.category === 'object' ? p.category.name : undefined) ?? undefined,
    price: p.price ?? undefined,
    priceUnit: p.priceUnit ?? undefined,
    description: (p.description ?? '').toString(),
  }))
}

function readDrafts(): Map<string, Dict> {
  const m = new Map<string, Dict>()
  if (!fs.existsSync(OUT)) return m
  for (const line of fs.readFileSync(OUT, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t) continue
    try { const o = JSON.parse(t); if (o?.slug) m.set(o.slug, o) } catch { /* ignore bad line */ }
  }
  return m
}

function parseJsonLoose(text: string): Dict | null {
  const tryParse = (s: string) => { try { return JSON.parse(s) } catch { return null } }
  let out = tryParse(text)
  if (out) return out
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) { out = tryParse(fence[1]); if (out) return out }
  const first = text.indexOf('{'), last = text.lastIndexOf('}')
  if (first !== -1 && last > first) return tryParse(text.slice(first, last + 1))
  return null
}

async function chat(user: string, maxItems: number): Promise<Dict[]> {
  if (!KEY) throw new Error('OPENROUTER_API_KEY is not set')
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    // A hung/terminated request must fail FAST so the retry loop isn't stuck for 10+ minutes.
    signal: AbortSignal.timeout(REQ_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
      temperature: 0.7,
      max_tokens: Math.min(16000, 2600 * maxItems),
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const body: Dict = await res.json()
  const content = body?.choices?.[0]?.message?.content ?? ''
  const parsed = parseJsonLoose(content)
  const arr: Dict[] = parsed?.items ?? parsed?.productos ?? (Array.isArray(parsed) ? parsed : [])
  if (!arr.length) throw new Error('no items in model response')
  return arr
}

function promptFor(items: Dict[]) {
  const payload = items.map((d) => ({
    slug: d.slug, name: d.name, category: d.category, price: d.price, priceUnit: d.priceUnit,
    fuente: (d.description || '').slice(0, 4000),
    ...(d.prior ? { borradorPrevio: d.prior } : {}),
  }))
  return `Genera el copy para estos ${items.length} productos. Devuelve SOLO JSON con la forma ` +
    `{"items":[{"slug":"...","shortDescription":"...","description":"...","benefits":["...","...","..."]}]} ` +
    `en el MISMO orden, con todos los productos.\n\nPRODUCTOS:\n${JSON.stringify(payload)}`
}

async function callModel(items: Dict[]): Promise<Dict[]> {
  return chat(promptFor(items), items.length)
}

/** One rewrite pass for copy that tripped the compliance gate. */
async function repairBatch(rows: Dict[], bad: Map<string, string[]>): Promise<Dict[] | null> {
  const payload = rows.filter((r) => bad.has(r.slug)).map((r) => ({
    slug: r.slug, problemasDetectados: bad.get(r.slug),
    shortDescription: r.shortDescription, description: r.description, benefits: r.benefits,
  }))
  const user = `Estos textos de producto violan las reglas de salud. Reescribelos eliminando TODA afirmacion sobre enfermedades, patogenos, tratamientos o dosis (y las palabras marcadas en problemasDetectados), manteniendo el tono atractivo y la estructura: description de 900 a 1400 caracteres con intro, 5-7 puntos "- " en lineas propias y cierre; shortDescription <=110 caracteres; 3 benefits <=80. No cambies los slugs. Devuelve SOLO JSON {"items":[{"slug","shortDescription","description","benefits"}]}.\n\nTEXTOS A CORREGIR:\n${JSON.stringify(payload)}`
  return chat(user, payload.length)
}

async function main() {
  log(`model=${MODEL} batch=${BATCH} out=${OUT} cms=${CMS} pv=${PROMPT_VERSION}`)
  const docs = await fetchDocs()
  log(`catalog: ${docs.length} products`)
  const drafts = readDrafts()
  log(`resume: ${drafts.size} drafts on disk`)

  let todo = docs.filter((d) => FORCE || drafts.get(d.slug)?.pv !== PROMPT_VERSION)
  if (LIMIT > 0) todo = todo.slice(0, LIMIT)
  log(`to generate: ${todo.length}`)

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  const append = (rows: Dict[]) =>
    fs.appendFileSync(OUT, rows.map((r) => JSON.stringify(r)).join('\n') + '\n')

  // Work list, then keep CONC batches in flight. Each batch appends as soon as it lands, so an
  // interrupt loses at most one batch; the resume logic picks the rest up on the next run.
  const chunks: Doc[][] = []
  for (let i = 0; i < todo.length; i += BATCH) chunks.push(todo.slice(i, i + BATCH))
  let next = 0, done = 0, failed = 0, repaired = 0, blocked = 0, expanded = 0
  const started = Date.now()

  const runChunk = async (idx: number) => {
    const chunk = chunks[idx].map((d) => ({ ...d, prior: drafts.get(d.slug)?.description }))
    let rows: Dict[] | null = null
    for (let attempt = 1; attempt <= 3 && !rows; attempt++) {
      try {
        const items = await callModel(chunk)
        rows = items.map((it) => {
          const src = chunk.find((c) => c.slug === it.slug) ?? chunk[0]
          return {
            slug: it.slug ?? src.slug, name: src.name, pv: PROMPT_VERSION, model: MODEL,
            generatedAt: new Date().toISOString(),
            shortDescription: (it.shortDescription ?? '').trim(),
            description: (it.description ?? '').trim(),
            benefits: (Array.isArray(it.benefits) ? it.benefits : []).slice(0, 3).map((b: string) => String(b).trim()),
          }
        })
      } catch (e) {
        log(`batch ${idx + 1} attempt ${attempt} failed: ${(e as Error).message}`)
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt))
      }
    }
    if (!rows) { failed++; log(`batch ${idx + 1} SKIPPED after 3 attempts`); return }
    if (DRY) { log(`[dry-run] batch ${idx + 1} would write: ${rows.map((r) => r.slug).join(', ')}`); return }

    // Order matters: compliance -> hard limits + expansion -> compliance AGAIN (the expansion call
    // can reintroduce banned wording) -> write. Nothing unvetted reaches the drafts file.
    let g = await gate(rows, `batch ${idx + 1}`)
    rows = g.rows; if (g.repaired) repaired++; blocked += g.dropped

    rows = enforceLimits(rows)
    const shortOnes = rows.filter((r) => (r.description ?? '').length < MIN_DESC)
    if (shortOnes.length) {
      try {
        const longer = await expandDescriptions(shortOnes)
        if (longer?.length) {
          const byslug = new Map(longer.map((f) => [f.slug, f]))
          rows = rows.map((r) => {
            const f = byslug.get(r.slug)
            return f?.description ? { ...r, description: String(f.description).trim() } : r
          })
          expanded += longer.length
        }
      } catch (e) { log(`batch ${idx + 1} expand failed: ${(e as Error).message}`) }
      rows = enforceLimits(rows)
    }
    g = await gate(rows, `batch ${idx + 1} (post-expand)`)
    rows = g.rows; if (g.repaired) repaired++; blocked += g.dropped
    rows = enforceLimits(rows)   // the gate's rewrite can lengthen shortDescription — trim last
    if (!rows.length) { log(`batch ${idx + 1}: nothing left to write`); return }

    append(rows)
    done += rows.length
    log(`batch ${idx + 1}/${chunks.length} (+${rows.length}, written this run: ${done}, failed: ${failed}, ` +
      `repaired: ${repaired}, blocked: ${blocked}, expanded: ${expanded}, ${((Date.now() - started) / 60000).toFixed(1)} min elapsed)`)
  }

  await Promise.all(
    Array.from({ length: Math.min(CONC, chunks.length) }, async () => {
      for (;;) { const idx = next++; if (idx >= chunks.length) return; await runChunk(idx) }
    }),
  )
  log(`done. written this run: ${done}, skipped batches: ${failed}, rewritten: ${repaired}, blocked items: ${blocked}, expanded: ${expanded}. drafts file: ${OUT}`)
}

main().catch((e) => { console.error('FATAL', e); process.exit(1) })
