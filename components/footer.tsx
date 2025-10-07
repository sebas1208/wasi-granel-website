import Link from "next/link"
import { Facebook, Instagram, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              JatunWasi
            </h3>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Tu tienda familiar de confianza para frutos secos, nueces y productos naturales de la más alta calidad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda"
                  className="text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                >
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/90">
                <Phone className="h-4 w-4" />
                <span>+34 123 456 789</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/90">
                <Mail className="h-4 w-4" />
                <span>info@jatunwasi.com</span>
              </li>
              <li className="flex items-center gap-3 mt-4">
                <a href="#" className="text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} JatunWasi. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
