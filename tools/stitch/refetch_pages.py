#!/usr/bin/env python3
"""Re-fetch the Wasi Granel Stitch *page* screens (HTML) fresh into
.scratch/stitch-fetch/screens/. URLs come from list_screens (public, no auth).

Run: python3 tools/stitch/refetch_pages.py
"""
import pathlib
import urllib.request

OUT = pathlib.Path(__file__).resolve().parents[2] / ".scratch" / "stitch-fetch" / "screens"
OUT.mkdir(parents=True, exist_ok=True)

SCREENS = {
    # name -> (display title, html download url)
    "wasi-granel-variante-2-cuadr-cula-escalable-de-categor-as__ed05a9f0.html": (
        "Homepage DESKTOP - Variante 2: Cuadricula Escalable de Categorias",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE3NWY4MTY2NTYwNWMyZmQ3OGE5MGE3MmY1EgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-inicio-m-vil-variante-2__0d748b50.html": (
        "Homepage MOBILE - Inicio Movil (Variante 2)",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE5MGFhYzYwMDYwMzkyYzliMzJmMzJkODg4EgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-tienda-y-cat-logo-interactivo-y-animado__7d45faa1.html": (
        "Tienda DESKTOP - Catalogo Interactivo",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE5MTBjYTU1MmIwMDMwM2UxNzA5MmVjNzc3EgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-con-carrito-lateral-interactivo__5b04fb21.html": (
        "Tienda DESKTOP - Con Carrito Lateral",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE1MDliNjFiYzIwNzc5YWU2ZmM2MjM5NTk4EgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-modal-detalle-de-producto-quick-view__805f63cd.html": (
        "Producto DESKTOP - Modal Quick View",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE1MTRkMWVjMzMwMzM4NWM5NjE4MzZmMzZkEgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-contacto-y-sucursales__71ee0d81.html": (
        "Contacto DESKTOP - Sucursales",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE5YjJkYTUzZDMwMWVlNDk5ZmJhMzMyOTc2EgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-contacto-m-vil__1bbe83e0.html": (
        "Contacto MOBILE",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE5ZGIyZTVhODkwNTIyYTI1ZTYwMmNhZDdmEgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-cat-logo-m-vil__5a0b1024.html": (
        "Catalogo MOBILE",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE5MTA2M2IwMzgwNzc5YWU2ZmM2MjM5NTk4EgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "wasi-granel-versi-n-interactiva-y-animada__7d0d31de.html": (
        "Homepage MOBILE - Version Interactiva y Animada",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzE5MTUwYWZiMDgwMjJkNGI4NmJhMmMxM2IyEgsSBxCFyYjgwwMYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDcwNjgzNzc0MDY3NTkzNDk4Nw&filename=&opi=89354086",
    ),
    "design-md__66637500.md": (
        "DESIGN.md",
        "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBKOARIhYXBwX2NvbXBhbmlvbl91c2VyX3VwbG9hZGVkX2ZpbGVzGmkKM3VzZXJfdXBsb2FkZWRfaHRtbF8wMDA2NTUwMmEyYmNiMzYzMDRlYWIxYzM3MzE0YTIzZhILEgcQhcmI4MMDGAGSASQKCnByb2plY3RfaWQSFkIUMTA3MDY4Mzc3NDA2NzU5MzQ5ODc&filename=&opi=96797242",
    ),
}

ok = 0
for name, (title, url) in SCREENS.items():
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        (OUT / name).write_bytes(data)
        print(f"OK   {len(data):>8} bytes  {name}   ({title})")
        ok += 1
    except Exception as e:  # noqa: BLE001
        print(f"FAIL {name}: {e}")

print(f"\n{ok}/{len(SCREENS)} screens refreshed -> {OUT}")
