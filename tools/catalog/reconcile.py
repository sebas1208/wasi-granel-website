#!/usr/bin/env python3
"""Reconcile Dolibarr export + docx extraction into the canonical Wasi Granel catalog.

Purpose: produce the single source-of-truth catalog that ticket 09 loads into Payload.

- Dolibarr is the source of truth for PRODUCT STRUCTURE (names split by presentation
  into purchase options, price, ref, category).
- The docx extraction (ticket 04) provides DESCRIPTION + PHOTO enrichment, matched by name.
- Purchase options PRESERVE every way a product can be bought: weight tiers in grams
  (including "libra" = 454 g) and fixed units (cm3/ml/funda/porción/unidad/paquete) are
  kept as SEPARATE options; the customer chooses how to buy. Nothing is collapsed.

Outputs (to .scratch/storefront/canonical/):
    categories.json   canonical category list (slug + name + sortOrder)
    products.json     canonical products (contract shape from @wasi-granel/schema)
    products.csv      same, flattened for review
    report.md         taxonomy mapping, docx match stats, review items

Usage: python3 tools/catalog/reconcile.py
"""
import os, re, json, csv, unicodedata
from collections import OrderedDict, Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
DOL  = os.path.join(ROOT, ".scratch", "dolibarr-export", "productos.csv")
DOCX = os.path.join(ROOT, ".scratch", "storefront", "catalog-docx", "products.json")
OUT  = os.path.join(ROOT, ".scratch", "storefront", "canonical")
os.makedirs(OUT, exist_ok=True)

def norm(s):
    s = unicodedata.normalize("NFC", s or "")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", s.lower())).strip()

def slugify(s):
    s = unicodedata.normalize("NFD", s or "")
    s = re.sub(r"[\u0300-\u036f]", "", s)          # strip accents
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s

# Strip the presentation suffix (" - Libra", "  - 500 cm3", " – Porción") to get clean name.
# Use \w (unicode) so accented suffixes like "Porción" are matched and stripped.
SUF = re.compile(r"\s*[-–—]\s*([\w %./\'-]+?)\s*$")
def _price(v):
    return None if v in (None, "", "NULL") else float(v)

def split_row(nombre, precio):
    n = nombre.strip()
    m = SUF.search(n)
    if m:
        clean = n[:m.start()].strip()
        suffix = m.group(1).strip()
    else:
        clean, suffix = n, ""
    return clean, suffix, _price(precio)

GR = re.compile(r"^(\d+)\s*gr$", re.I)
def purchase_option(suffix, price):
    """Map a Dolibarr presentation suffix to a contract purchase option (kind: weight|unit).
    Preserves each distinct way to buy; lbs and grams stay separate weight tiers."""
    s = suffix.strip()
    if not s:
        # No presentation on the row — sold by unit (per owner decision).
        return [], {"kind": "unit", "price": price, "label": "unidad"}
    if s.lower() in ("libra", "lb"):
        return [], {"kind": "weight", "weightGrams": 454, "price": price}
    m = GR.match(s)
    if m:
        return [], {"kind": "weight", "weightGrams": int(m.group(1)), "price": price}
    # fixed-volume bottle or generic fixed unit/pack -> unit option
    return [], {"kind": "unit", "price": price, "label": s}

# Canonical taxonomy: the 8 Stitch categories + extensions the data actually needs.
# (Assignments are decisions -> adjust this dict and regenerate; documented in report.md)
STITCH = [
    {"slug": "frutos-secos",            "name": "Frutos Secos",           "sortOrder": 1},
    {"slug": "semillas-granos",         "name": "Semillas & Granos",      "sortOrder": 2},
    {"slug": "frutas-deshidratadas",    "name": "Frutas Deshidratadas",   "sortOrder": 3},
    {"slug": "cacao-chocolates",        "name": "Cacao & Chocolates",     "sortOrder": 4},
    {"slug": "harinas-cereales",        "name": "Harinas & Cereales",     "sortOrder": 5},
    {"slug": "especias-hierbas",        "name": "Especias & Hierbas",     "sortOrder": 6},
    {"slug": "legumbres-menestras",     "name": "Legumbres & Menestras",  "sortOrder": 7},
    {"slug": "despensa-endulzantes",    "name": "Despensa & Endulzantes", "sortOrder": 8},
    {"slug": "aceites-aceitunas",       "name": "Aceites & Aceitunas",    "sortOrder": 9},
    {"slug": "infusiones-tes",          "name": "Infusiones & Tés",       "sortOrder": 10},
    {"slug": "ajies-ajos",              "name": "Ajíes & Ajos",           "sortOrder": 11},
    {"slug": "endulzantes",             "name": "Endulzantes",            "sortOrder": 12},
    {"slug": "otros",                   "name": "Otros",                  "sortOrder": 13},
]

# Dolibarr category -> canonical slug. First key match wins; '' = unassigned/flag.
DOL_TO_CAT = {
    "1. Frutos Secos y Semillas":       "frutos-secos",
    "2. Frutas Deshidratadas":          "frutas-deshidratadas",
    "3. Chocolates y Dulces":           "cacao-chocolates",
    "4. Especias y Condimentos":        "especias-hierbas",
    "5. Hojas, Flores e Infusiones":    "infusiones-tes",
    "6. Harinas y Cereales":            "harinas-cereales",
    "7. Aceites y Aceitunas":           "aceites-aceitunas",
    "8. Ajíes y Ajos":                  "ajies-ajos",
    "9. Miel y Café":                   "endulzantes",
    "Otros":                            "",          # triage needed
    "0. Favoritos":                     "",          # not a real category
    "TPV":                              "",          # parent
}
CAT_BY_SLUG = {c["slug"]: c for c in STITCH}

# docx section -> canonical slug. Used as a FALLBACK when Dolibarr filed the product
# under "Otros" (no Dolibarr category) but the docx marketing catalog says which section it's in.
DOCX_CAT_TO_CANON = {
    "ACEITES": "aceites-aceitunas",
    "SEMILLAS Y CEREALES": "semillas-granos",
    "SEMILLAS": "semillas-granos",
    "CONDIMENTOS Y ESPECIAS": "especias-hierbas",
    "FRUTOS SECOS": "frutos-secos",
    "FRUTOS DESHIDRATADOS": "frutas-deshidratadas",
    "HIERBAS MEDICINALES": "especias-hierbas",
    "HARINAS": "harinas-cereales",
    "REPOSTERÍA": "cacao-chocolates",
    "SALES Y COMPUESTOS": "especias-hierbas",
    "SNACK TRADICONALES": "cacao-chocolates",
    "CONFITES": "cacao-chocolates",
}

# Explicit assignments for products Dolibarr filed under "Otros" that clearly fit a
# category (keyed by normalized clean name). Anything still unmatched defaults to "otros".
EXTRA_ASSIGN = {
    # dehydrated fruits
    "frutos amarillos deshidratados mix": "frutas-deshidratadas",
    "frutos deshidratatados babano": "frutas-deshidratadas",
    "frutos deshidratatados fresa": "frutas-deshidratadas",
    "frutos deshidratatados manazana roja": "frutas-deshidratadas",
    "frutos deshidratatados manzana verde": "frutas-deshidratadas",
    "frutos deshidratatados mora": "frutas-deshidratadas",
    "frutos rojos deshidratados mix": "frutas-deshidratadas",
    "manzana deshidratada": "frutas-deshidratadas",
    # herbs / condiments / sauces / vanilla
    "estragon": "especias-hierbas",
    "finas hierbas": "especias-hierbas",
    "hierbas finas": "especias-hierbas",
    "guayuza": "especias-hierbas",
    "hondashi concentrado de pescado": "especias-hierbas",
    "magui polvo": "especias-hierbas",
    "vaina de vainilla": "especias-hierbas",
    "vinagre de manzana": "especias-hierbas",
    "teriyaki": "especias-hierbas",
    # grains / sesame pastes
    "quinoa negra": "semillas-granos",
    "quinoa pop": "semillas-granos",
    "quinoa roja": "semillas-granos",
    "thaini 200 gr integral": "semillas-granos",
    "thaini 300 gr": "semillas-granos",
    # nuts / cereals / legumes
    "mix frutos secos sal": "frutos-secos",
    "salvado de tigo": "harinas-cereales",
    "sopa ramen 120gr": "harinas-cereales",
    "habas de sal": "legumbres-menestras",
    # NOTE: Alginato, Bicarbonato, Cloruro de Calcio, Champiñones -> Otros (no good fit)
}

def main():
    rows = list(csv.DictReader(open(DOL, encoding="utf-8")))

    # --- group Dolibarr rows by clean name (presentation rows merge into one product) ---
    groups = OrderedDict()
    for r in rows:
        clean, suffix, price = split_row(r["nombre"], r["precio_iva"])
        ckey = norm(clean) or clean.strip()
        groups.setdefault(ckey, {"clean": clean, "rows": []})["rows"].append((r, suffix, price))

    docx = json.load(open(DOCX, encoding="utf-8"))
    docx_idx_normalized = {}               # norm(docx name) -> docx prod
    for p in docx:
        key = norm(p["name"])
        docx_idx_normalized.setdefault(key, []).append(p)

    products, cat_used = [], {}
    no_suffix_review = []
    docx_unmatched, matched_exact, matched_sub, multi_match = [], 0, 0, 0

    for ckey, g in groups.items():
        clean = g["clean"]
        first = g["rows"][0][0]
        # category: prefer a real (non-blank) mapping of the row's Dolibarr category
        cats = [r["categorias"].split(";")[0] if r["categorias"] else "" for r, _, _ in g["rows"]]
        chosen = ""
        for c in cats:
            if DOL_TO_CAT.get(c):
                chosen = DOL_TO_CAT[c]; break
        if not chosen:
            # fall back to first row that has a mapping, else unassigned
            for c in cats:
                if c and DOL_TO_CAT.get(c): chosen = DOL_TO_CAT[c]; break
        

        # purchase options: one per row (PRESERVE distinct ways to buy)
        opts, notes, exploded = [], [], []
        row_review = []
        for r, suffix, price in g["rows"]:
            warn, opt = purchase_option(suffix, price)
            opts.append(opt)
            if warn:
                row_review.append((clean, suffix, first["ref"]))
            for w in warn:
                notes.append(w)
        if row_review:
            no_suffix_review.extend(row_review)

        # docx enrichment by normalized name (exact, else good substring)
        desc = first.get("descripcion") or ""
        images = []
        mkey = norm(clean)
        cand = None
        if mkey in docx_idx_normalized:
            cand = docx_idx_normalized[mkey][0]; matched_exact += 1
        else:
            # substring match both ways (e.g. docx "ACEITE DE COCO" ~ dol "aceite de coco extra virgen")
            hits = [p for k, ps in docx_idx_normalized.items()
                    for p in ps if (k and (k in norm(clean) or norm(clean) in k))]
            if len(hits) == 1:
                cand = hits[0]; matched_sub += 1
            elif len(hits) > 1:
                cand = hits[0]; multi_match += 1; notes.append(f"docx name matched {len(hits)} products; used first")
        if cand:
            if cand.get("description"):
                desc = cand["description"]
            images = cand.get("images", [])
        else:
            docx_unmatched.append(clean)

        # Docx-category fallback: classify "Otros" products from their docx section.
        if not chosen and cand:
            dcat = norm(cand.get("category") or "")
            fb = next((v for k, v in DOCX_CAT_TO_CANON.items() if norm(k) == dcat), None)
            if fb:
                chosen = fb
                notes.append(f"category via docx section '{cand.get('category')}'")

        # Explicit extra assignment, else the "Otros" catch-all (as last resort).
        if not chosen:
            ek = norm(clean)
            hit = next((v for k, v in EXTRA_ASSIGN.items() if norm(k) in ek), None)
            if hit:
                chosen = hit
                notes.append("category via manual extra-assign")
            else:
                chosen = "otros"
                notes.append("defaulted to Otros (no confident category)")
        cat_used[chosen] = cat_used.get(chosen, 0) + 1

        products.append({
            "slug": slugify(clean),
            "name": clean,
            "description": desc,
            "categorySlug": chosen or None,
            "images": images,                      # local file names from docx extractor
            "origin": None,
            "inStock": True,                       # all en_venta=1
            "ref": first.get("ref"),
            "taxRate": (float(first.get("iva_pct") or 0) / 100) or None,
            "purchaseOptions": opts,
            "_source": {"docxDoc": bool(cand), "notes": notes},
        })

    # slug uniqueness
    slugs = {}
    for p in products:
        s = p["slug"] or "producto"
        base = s
        i = 1
        while s in slugs and slugs[s] != p["name"]:
            s = f"{base}-{i}"; i += 1
        p["slug"] = s; slugs[s] = p["name"]

    # categories actually used (canonical + unassigned)
    used = [c for slug in cat_used if slug in CAT_BY_SLUG]
    categories = [c for c in STITCH if c["slug"] in cat_used]

    # ----- write outputs -----
    with open(os.path.join(OUT, "products.json"), "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT, "products.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["slug", "name", "categorySlug", "ref", "n_options", "n_images", "has_docx", "notes"])
        for p in products:
            w.writerow([p["slug"], p["name"], p["categorySlug"], p["ref"],
                        len(p["purchaseOptions"]), len(p["images"]),
                        "yes" if p["_source"]["docxDoc"] else "",
                        "; ".join(p["_source"]["notes"])])

    # ----- report -----
    L = ["# Canonical catalog — reconcile report (ticket 06)", "",
         f"Dolibarr rows: **{len(rows)}**  →  canonical products: **{len(products)}**",
         f"docx enrichment: exact name **{matched_exact}**, substring **{matched_sub}**, "
         f"multi-hit **{multi_match}**, unmatched **{len(docx_unmatched)}**", "",
         "## Category taxonomy (used)", ""]
    for c in STITCH:
        n = cat_used.get(c["slug"], 0)
        if n:
            L.append(f"- `{c['slug']}` ({c['name']}) — {n} products")
    L += ["", "## Needs owner review", ""]
    others = [p for p in products if p["categorySlug"] == "otros"]
    L.append(f"### In **Otros** (no confident fit, catch-all) — {len(others)}")
    for p in sorted(others, key=lambda x: x["name"]):
        L.append(f"- {p['name']} (ref {p['ref']})")
    none_price = [p for p in products if any(o.get("price") is None for o in p["purchaseOptions"])]
    if none_price:
        L.append("")
        L.append(f"### Products with a missing price — {len(none_price)}")
        for p in none_price:
            L.append(f"- {p['name']} (ref {p['ref']})")
    L.append("")
    L.append(f"### docx products not matched to any Dolibarr product — {len(docx_unmatched)}")
    L.append("(the docx is a ~198-product marketing subset; unmatched are docx-only — Dolibarr stays the structural source of truth)")
    with open(os.path.join(OUT, "report.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")

    print(f"RECONCILED {len(products)} products -> {OUT}")
    print(f"  categories used: {len(categories)} | Otros: {cat_used.get('otros', 0)}")
    print(f"  docx match: exact {matched_exact}, sub {matched_sub}, multi {multi_match}, unmatched {len(docx_unmatched)}")
    print(f"  products missing a price: {len([p for p in products if any(o.get('price') is None for o in p['purchaseOptions'])])}")

if __name__ == "__main__":
    main()