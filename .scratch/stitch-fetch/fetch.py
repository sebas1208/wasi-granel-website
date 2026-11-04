#!/usr/bin/env python3
import base64, json, os, subprocess, sys

PID = "10706837740675934987"
BASE = "/Users/savalos/Code/Wasi Granel/wasi-granel/.scratch/stitch-fetch"
OUT = os.path.join(BASE, "checkout")
RAW = os.path.join(BASE, "raw")
os.makedirs(OUT, exist_ok=True)
os.makedirs(RAW, exist_ok=True)

KEY = ""
for line in open(os.path.expanduser("~/.hermes/.env")):
    if line.startswith("STITCH_API_KEY="):
        KEY = line.split("=", 1)[1].strip()
        break
assert KEY, "no key"

MAP = [
    ("checkout-desktop", "c8703f28117743bb8466d45b28e58fa9"),
    ("checkout-mobile", "5fc81184c83c458e8d55a1cc43691c9e"),
    ("confirmacion-desktop", "7844a1cb914d4e2fb1bb94c781dc466b"),
    ("confirmacion-mobile", "4d62da793ef44d449c2ff05ff996a751"),
    ("pago-mobile", "ff9d06a8851a41bd9dcf2f248ad4af03"),
    ("pago-desktop", "dd62ed63daea41d8b332f0317f07bffc"),
]

def call(name, tag):
    """Run CLI with stdout redirected to a real file (avoids pipe truncation)."""
    rawp = os.path.join(RAW, tag + ".json")
    errp = os.path.join(RAW, tag + ".err")
    with open(rawp, "wb") as fo, open(errp, "wb") as fe:
        r = subprocess.run(
            ["npx", "-y", "@_davideast/stitch-mcp", "tool", "download_file", "-d", json.dumps({"name": name})],
            stdout=fo, stderr=fe, env={**os.environ, "STITCH_API_KEY": KEY}, timeout=600)
    if r.returncode != 0:
        raise SystemExit(f"fail {name} rc={r.returncode} :: {open(errp).read()[:500]}")
    with open(rawp, "r", encoding="utf-8") as f:
        return json.load(f), rawp

for base, sid in MAP:
    for kind, suffix in (("html", ".html"), ("screenshot", ".png")):
        res = f"projects/{PID}/screens/{sid}/fileEntries/{kind}"
        tag = f"{base}-{kind}"
        try:
            data, rawp = call(res, tag)
        except SystemExit as e:
            print("FAIL", tag, e); continue
        except Exception as e:
            print("PARSE_FAIL", tag, repr(e)[:200]); continue
        if "html" in data:
            p = os.path.join(OUT, base + suffix)
            open(p, "w", encoding="utf-8").write(data["html"])
            print("HTML", os.path.basename(p), os.path.getsize(p))
        elif "image" in data:
            p = os.path.join(OUT, base + "-shot.png")
            b = base64.b64decode(data["image"])
            open(p, "wb").write(b)
            print("IMG ", os.path.basename(p), os.path.getsize(p), data.get("image_metadata"))
        else:
            print("UNEXPECTED", tag, list(data.keys()))
