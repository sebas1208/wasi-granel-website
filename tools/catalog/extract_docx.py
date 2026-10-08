#!/usr/bin/env python3
"""Extract products, categories, and images from the Wasi Granel catalog .docx.

Best-effort extractor for a messy prose marketing catalog. Outputs a JSON manifest,
per-product descriptions, extracted images, and a coverage report that flags
everything not confidently captured so a human (or ticket 06, reconcile) can act.

Usage:
    python3 tools/catalog/extract_docx.py [SRC_DOCX] [OUT_DIR]
Defaults: source = "~/Documents/Projects/Wasi Granel/Información para catálogo.docx"
          out     = .scratch/storefront/catalog-docx/

Segmentation model: only SHORT NAME lines start a product. Image-bearing rows and
long-text rows attach to the current (or upcoming) product by name — so floating
images and descriptions don't create duplicate products. Names that repeat
consecutively (image-block then bare name line) are merged.

Only stdlib, runs on any python3.
"""
import sys, os, re, json, csv, zipfile, unicodedata
import xml.etree.ElementTree as ET

SRC = (sys.argv[1] if len(sys.argv) > 1 else
       os.path.expanduser("~/Documents/Projects/Wasi Granel/Información para catálogo.docx"))
OUT = (sys.argv[2] if len(sys.argv) > 2 else
       os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..",
                    ".scratch", "storefront", "catalog-docx"))

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

def parse_rows():
    z = zipfile.ZipFile(SRC)
    root = ET.fromstring(z.read("word/document.xml"))
    rels = {}
    for m in re.finditer(r'Id="(rId\d+)"[^>]*Target="([^"]+)"',
                         z.read("word/_rels/document.xml.rels").decode("utf-8", "ignore")):
        rels[m.group(1)] = m.group(2)
    rows = []
    for p in root.iter(W + "p"):
        sel = p.find(".//" + W + "pStyle")
        style = sel.get(W + "val") if sel is not None else ""
        text = "".join(t.text or "" for t in p.findall(".//" + W + "t")).strip()
        imgs = [rels.get(b.get(R + "embed"), "?") for b in p.findall(".//" + A + "blip")]
        rows.append({"style": style, "imgs": imgs, "text": text})
    return z, rows

def norm(s):
    s = unicodedata.normalize("NFC", s or "")
    return re.sub(r"\s+", " ", s).strip().upper()

CATEGORY_SECTIONS = [
    "ACEITES", "SEMILLAS Y CEREALES", "SEMILLAS", "CONDIMENTOS Y ESPECIAS",
    "FRUTOS SECOS", "FRUTOS DESHIDRATADOS", "HIERBAS MEDICINALES", "HARINAS",
    "REPOSTERÍA", "SALES Y COMPUESTOS", "SNACK TRADICONALES", "CONFITES",
    "REFERENCIAS",
]
CATEGORY_SET = {norm(c) for c in CATEGORY_SECTIONS}
END_SECTIONS = {"REFERENCIAS"}
NAME_LIST_SECTIONS = {norm(c) for c in
                      ["HARINAS", "REPOSTERÍA", "SALES Y COMPUESTOS", "SNACK TRADICONALES", "CONFITES"]}

# All-caps / title-case short lines that are NOT product names (sub-labels / benefit
# bullets inside a product's description). Treat as description content, not products.
SUBLABEL = re.compile(
    r"^(ORIGEN Y CARACTERÍSTICA|ORIGEN Y CARACTERISTICA|USOS CULINARIOS|USOS Y BENEFICIOS|"
    r"BENEFICIOS?|PROPIEDADES|INFORMACIÓN PRINCIPAL|INFORMACION PRINCIPAL|"
    r"AUMENTA EL RENDIMIENTO|AMIGO DEL CORAZÓN|FORTALECE LOS HUESOS|MÁS FIBRA QUE EN OTROS CEREALES|"
    r"MAS FIBRA QUE EN OTROS CEREALES|RICO EN MINERALES|ANTIOXIDANTES|ACHAQUES|CONTROL DE PESO|"
    r"GASES E HINCHAZÓN|REGULAR EL AZÚCAR|ALIVIA SÍNTOMAS|AYUDA A COMBATIR|EFECTOS ANTIBACTERIANOS|"
    r"EN RESUMEN|AMBOS TIPOS|LA PRINCIPAL DIFERENCIA|PRUEBA LA|LOS DIFERENTES|POTENCIA TU|"
    r"ENERGÍA NATURAL|ENERGIA NATURAL|EQUILIBRIO HORMONAL|IMPULSA TU LIBIDO|BIENESTAR MENTAL|"
    r"REFUERZA TU|INTEGRA LA|FAVORECE A LA|SACIA EL HAMBRE|BAJA LOS NIVELES|AYUDA A CONTROLAR|"
    r"POSEE UN ALTO|ESTIMULA LA MENTE|FORTALECER|REFERENCIAS|PARAGUAY|IDEAL EN DIETAS|"
    r"REDUCE EL COLESTEROL|AYUDA A ELIMINAR|REDUCCIÓN DEL|REDUCCION DEL|EFECTOS POSITIVOS|IDEAL PARA)"
)

def looks_like_name(t):
    if not t:
        return False
    words = t.split()
    if not (1 <= len(words) <= 8) or len(t) > 60:
        return False
    letters = [c for c in t if c.isalpha()]
    if not letters:
        return False
    up = sum(1 for c in letters if c.isupper()) / len(letters)
    if up < 0.75:
        return False
    if re.match(r"^\d+\.", t):
        return False
    if t.endswith((".", ",", ":")) and up < 0.99:
        return False
    if SUBLABEL.match(norm(t)):
        return False
    return True

def looks_like_list_name(t):
    if not t or len(t) > 60 or len(t.split()) > 8:
        return False
    nt = norm(t)
    if nt in CATEGORY_SET:
        return False
    if re.match(r"^(WWW|HTTP|HTTPS)", t.lower()):
        return False
    nt_clean = nt.rstrip(".:")
    if SUBLABEL.match(nt) or SUBLABEL.match(nt_clean):
        return False
    return True

def main():
    z, rows = parse_rows()
    os.makedirs(os.path.join(OUT, "images"), exist_ok=True)

    with open(os.path.join(OUT, "rows.tsv"), "w", encoding="utf-8") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerow(["idx", "style", "imgs", "text"])
        for i, r in enumerate(rows):
            w.writerow([i, r["style"], ",".join(r["imgs"]) or "", r["text"]])

    products = []
    cur_cat = "SIN CATEGORÍA"
    cur = None            # current open product
    pending = {"imgs": [], "text": ""}   # image/desc that appeared before a name line

    def flush_pending_into(prod):
        prod["images"][0:0] = pending["imgs"]
        if pending["text"]:
            prod["description"] = pending["text"] + " " + prod["description"]
        pending["imgs"] = []; pending["text"] = ""

    def close_cur():
        nonlocal cur
        if cur:
            products.append(cur)
            cur = None

    for i, r in enumerate(rows):
        t, nt, has_img = r["text"], norm(r["text"]), bool(r["imgs"])

        if nt in CATEGORY_SET:
            close_cur(); pending = {"imgs": [], "text": ""}
            cur_cat = nt
            continue
        if cur_cat in END_SECTIONS:
            continue

        is_list = cur_cat in NAME_LIST_SECTIONS
        is_name = looks_like_name(t) if not is_list else looks_like_list_name(t)

        if is_name:
            # start or merge a product
            if cur is not None and norm(cur["name"]) == nt and norm(cur["name"]):
                # same name repeats a few rows later (bare name line) -> already have it
                pass
            else:
                close_cur()
                cur = {"name": t, "category": cur_cat, "sourceIndex": i,
                       "description": "", "images": [], "note": ""}
            if has_img:
                cur["images"].extend(r["imgs"])
            if cur is not None:
                flush_pending_into(cur)
            continue

        # content row (description + optional image)
        if cur is not None:
            if r["style"].lower().startswith("heading"):
                cur["description"] += "\n## " + t + "\n" if t else ""
            elif t:
                cur["description"] += t + " "
            if has_img:
                cur["images"].extend(r["imgs"])
        else:
            # no product yet -> buffer for the next name
            if has_img:
                pending["imgs"].extend(r["imgs"])
            if t:
                pending["text"] += t + " "

    close_cur()
    if pending["imgs"] or pending["text"]:
        products.append({"name": "", "category": cur_cat, "sourceIndex": len(rows),
                         "description": pending["text"].strip(), "images": pending["imgs"],
                         "note": "orphan image/description before next section"})

    # mark name-only list entries
    for pr in products:
        if not pr["description"] and pr["category"] in NAME_LIST_SECTIONS and not pr["images"]:
            pr["note"] = "name-only list entry (no description/image in docx)"
        if not pr["name"]:
            pr["note"] = (pr.get("note", "") + " name not captured").strip()

    # extract images
    seen = {}
    for pr in products:
        files = []
        for tgt in pr["images"]:
            if tgt in seen:
                files.append(seen[tgt]); continue
            data = None
            for cand in ("word/" + tgt, tgt, "media/" + tgt):
                try:
                    data = z.read(cand); break
                except KeyError:
                    pass
            if data is None:
                continue
            dest = os.path.join(OUT, "images", f"{pr['sourceIndex']:04d}__{os.path.basename(tgt)}")
            with open(dest, "wb") as f:
                f.write(data)
            files.append(os.path.basename(dest)); seen[tgt] = os.path.basename(dest)
        pr["images"] = files
        pr["description"] = re.sub(r"\s+", " ", pr["description"]).strip()

    with open(os.path.join(OUT, "products.json"), "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT, "products.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["name", "category", "sourceIndex", "n_desc_chars", "n_images", "note"])
        for pr in sorted(products, key=lambda p: p["sourceIndex"]):
            w.writerow([pr["name"], pr["category"], pr["sourceIndex"],
                        len(pr["description"]), len(pr["images"]), pr.get("note", "")])

    # coverage report
    by_cat = {}
    for pr in products:
        by_cat.setdefault(pr["category"], []).append(pr)
    L = ["# Catalog .docx extraction — coverage report", "",
         f"Source: `{os.path.basename(SRC)}`  |  products detected: **{len(products)}**  |  "
         f"unique images extracted: **{len(seen)}**", "", "## Per category", ""]
    for cat in CATEGORY_SECTIONS:
        prs = by_cat.get(cat)
        if prs:
            L.append(f"- **{cat}**: {len(prs)} (images: {sum(1 for p in prs if p['images'])}, "
                     f"descriptions: {sum(1 for p in prs if len(p['description'])>20)})")
    unnamed = [p for p in products if not p["name"]]
    bare = [p for p in products if not p["description"] and not p["images"]]
    flagged = [p for p in products if p.get("note")]
    L += ["", f"## Flagged / needs review: **{len(flagged)}**", ""]
    for p in flagged:
        L.append(f"- {p['name'] or '(unnamed)'} [{p['category']}] ({p['sourceIndex']}) — {p['note']}")
    L += ["", f"## Unnamed (image/desc with no name): {len(unnamed)}",
          f"## Bare names (no description, no image): {len(bare)} — mostly the sparse tail; verify against Dolibarr."]
    with open(os.path.join(OUT, "coverage.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")

    print(f"EXTRACTED {len(products)} products, {len(seen)} unique images -> {OUT}")
    for cat in CATEGORY_SECTIONS:
        if by_cat.get(cat):
            n = len(by_cat[cat]); ni = sum(1 for p in by_cat[cat] if p["images"])
            print(f"  {cat}: {n} (imgs {ni})")
    if by_cat.get("SIN CATEGORÍA"):
        print(f"  (pre-section): {len(by_cat['SIN CATEGORÍA'])}")
    print(f"  unnamed: {len(unnamed)}  flagged: {len(flagged)}")

if __name__ == "__main__":
    main()