import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Heart, Award, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-secondary py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1
                className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 text-balance"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Bienvenidos a JatunWasi
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed text-pretty">
                Tradición familiar en frutos secos y productos naturales desde hace más de tres décadas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/tienda">Explorar Productos</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contacto">Contáctanos</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl md:text-4xl font-serif font-bold text-primary mb-8 text-center"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Nuestra Historia
              </h2>

              <div className="prose prose-lg max-w-none">
                <Card className="bg-card border-border">
                  <CardContent className="p-8 md:p-12">
                    <div className="space-y-6 text-foreground/90 leading-relaxed">
                      <p className="text-lg">
                        JatunWasi nació en 1990 como un pequeño negocio familiar con una gran pasión: ofrecer los
                        mejores frutos secos y productos naturales a nuestra comunidad. El nombre "JatunWasi", que
                        significa "casa grande" en quechua, refleja nuestra filosofía de acoger a cada cliente como
                        parte de nuestra familia.
                      </p>

                      <p>
                        Durante más de 30 años, hemos mantenido nuestro compromiso con la calidad, seleccionando
                        cuidadosamente cada producto de proveedores locales y nacionales que comparten nuestros valores
                        de sostenibilidad y excelencia.
                      </p>

                      <p>
                        Lo que comenzó como una pequeña tienda de barrio ha crecido gracias a la confianza de nuestros
                        clientes, pero nunca hemos perdido ese toque personal y familiar que nos caracteriza. Cada nuez,
                        cada fruto seco, cada producto que ofrecemos es seleccionado con el mismo cuidado y dedicación
                        que el primer día.
                      </p>

                      <p className="font-medium text-primary">
                        Hoy, JatunWasi es más que una tienda: es un lugar donde la tradición se encuentra con la
                        calidad, y donde cada visita es como volver a casa.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2
              className="text-3xl md:text-4xl font-serif font-bold text-primary mb-12 text-center"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Nuestros Valores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Natural</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Productos 100% naturales sin aditivos artificiales
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Calidad</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Selección rigurosa de los mejores productos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Familiar</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Atención personalizada y cercana</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Variedad</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Amplio catálogo de productos selectos</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2
                className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Visítanos Hoy
              </h2>
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                Descubre nuestra selección de frutos secos, nueces y productos naturales. Te esperamos con los brazos
                abiertos.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/contacto">Cómo Llegar</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
