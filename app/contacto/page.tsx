"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactoPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert("¡Gracias por tu mensaje! Te contactaremos pronto.")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1
                className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Contáctanos
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Estamos aquí para ayudarte. Visítanos o escríbenos
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Contact Information */}
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-serif font-bold text-primary mb-6"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Información de Contacto
                  </h2>
                </div>

                <Card className="bg-card border-border">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Dirección</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Calle Principal 123
                          <br />
                          28001 Madrid, España
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Teléfono</h3>
                        <p className="text-sm text-muted-foreground">+34 123 456 789</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Email</h3>
                        <p className="text-sm text-muted-foreground">info@jatunwasi.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Horario</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Lunes - Viernes: 9:00 - 20:00</p>
                          <p>Sábados: 10:00 - 14:00</p>
                          <p>Domingos: Cerrado</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div>
                <h2
                  className="text-2xl md:text-3xl font-serif font-bold text-primary mb-6"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Envíanos un Mensaje
                </h2>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                          Nombre *
                        </label>
                        <Input id="name" required placeholder="Tu nombre" className="bg-background" />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                          Email *
                        </label>
                        <Input id="email" type="email" required placeholder="tu@email.com" className="bg-background" />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2 text-foreground">
                          Teléfono
                        </label>
                        <Input id="phone" type="tel" placeholder="+34 123 456 789" className="bg-background" />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                          Mensaje *
                        </label>
                        <Textarea
                          id="message"
                          required
                          rows={5}
                          placeholder="¿En qué podemos ayudarte?"
                          className="bg-background resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="lg"
                      >
                        Enviar Mensaje
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2
              className="text-2xl md:text-3xl font-serif font-bold text-primary mb-8 text-center"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Cómo Llegar
            </h2>

            <div className="max-w-5xl mx-auto">
              <Card className="bg-card border-border overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.4254634607!2d-3.7037902!3d40.4167754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e5e1e1e1f%3A0x1e1e1e1e1e1e1e1e!2sMadrid%2C%20Spain!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de JatunWasi"
                  />
                </div>
              </Card>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Estamos ubicados en el corazón de Madrid, con fácil acceso en transporte público.
                  <br />
                  Metro: Línea 1 - Estación Sol (5 minutos a pie)
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
