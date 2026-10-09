import Link from "next/link"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-primary text-primary-foreground pt-14 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <span aria-hidden className="wasi-logo text-primary-foreground h-9 block" />
            <p className="text-sm text-primary-foreground leading-relaxed mt-3">
              Frutos secos, semillas, especias y productos naturales a granel — dinamismo, orden y equilibrio cotidiano.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-headline uppercase tracking-wider font-bold text-xs text-primary-foreground mb-4">
              Navegación
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/" className="text-sm font-semibold text-primary-foreground hover:underline">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="text-sm font-semibold text-primary-foreground hover:underline">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm font-semibold text-primary-foreground hover:underline">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-headline uppercase tracking-wider font-bold text-xs text-primary-foreground mb-4">
              Legal
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="#" className="text-sm font-semibold text-primary-foreground hover:underline">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm font-semibold text-primary-foreground hover:underline">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm font-semibold text-primary-foreground hover:underline">
                  Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Ubicación */}
          <div>
            <h4 className="font-headline uppercase tracking-wider font-bold text-xs text-primary-foreground mb-4">
              Ubicación
            </h4>
            <p className="text-sm text-primary-foreground leading-relaxed mb-2">
              Riobamba · Quito
              <br />
              Ecuador
            </p>
            <p className="text-sm text-primary-foreground leading-relaxed">
              hola@wasigranel.com
              <br />
              +593 9 8765 4321
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-center text-xs text-primary-foreground">
          <p>&copy; {year} Wasi Granel. Dinamismo, orden y equilibrio cotidiano.</p>
        </div>
      </div>
    </footer>
  )
}