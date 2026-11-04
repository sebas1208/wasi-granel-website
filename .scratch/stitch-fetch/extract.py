#!/usr/bin/env python3
"""Print visible text + key attributes (labels, options, placeholders, values) per screen."""
import re, sys, os
from html.parser import HTMLParser

DIR = "/Users/savalos/Code/Wasi Granel/wasi-granel/.scratch/stitch-fetch/checkout"
FILES = ["checkout-desktop.html", "checkout-mobile.html", "confirmacion-desktop.html",
         "confirmacion-mobile.html", "pago-mobile.html", "pago-desktop.html"]

SKIP = {"script", "style", "svg", "path", "noscript"}

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0
        self.stack = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag in SKIP:
            self.skip += 1
            return
        if tag in ("input", "select", "textarea", "option", "button", "label", "a"):
            info = {k: v for k, v in d.items() if k in ("type","name","id","placeholder","value","checked","required","aria-label","href","for","class")}
            if tag == "option" or tag == "input" or tag == "textarea" or "button" in tag:
                self.out.append(f"\n<{tag} {info}>")
        if tag in ("h1","h2","h3","h4","p","li","td","th","div","span","section","footer"):
            pass
    def handle_endtag(self, tag):
        if tag in SKIP and self.skip:
            self.skip -= 1
    def handle_data(self, data):
        if self.skip:
            return
        t = " ".join(data.split())
        if t:
            self.out.append(t)

for f in FILES:
    p = os.path.join(DIR, f)
    src = open(p, encoding="utf-8").read()
    print("=" * 30, f, "=" * 30)
    pr = P(); pr.feed(src)
    text = " ".join(pr.out)
    # collapse repeated separators
    text = re.sub(r"\s+", " ", text)
    print(text)
    print()
