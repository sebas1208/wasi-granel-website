import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhGBbTXEZPYGAn95_yCKHlPDEnm13Wq1pTj8ta5wy7CZEz-LVWTOavOyLq-leqEgtpKn7z2tG_9M8OVdCEYIMwYagFQKbIoMNzsD3FTFiPIcxNg0MaR6R153uVkD2V0_JewOqYNQ7BjpMOyXxecz73yQ--H1PdH5aoPjAx31CZb0aBAnIqNoBRscLFG6bPxOxrsmUlw-mryUwWAKG6ERljeJBiWCjGpHlce5XF6kr9856tXQNNp_4Ib7YuO8MN9x5M83UMgQdIkFjScofCwUKYivwUGtN96PDXwraPb&lib=MXMFpTI3n5QLB6u1bJIk0UUzTPsmGIWEC"

const categories = ["Todos", "Nueces", "Almendras", "Frutos Secos", "Semillas", "Mezclas", "Especiales"]

const products = [
  {
    id: 1,
    name: "Almendras Crudas",
    category: "Almendras",
    price: "8.50",
    unit: "kg",
    image: "/raw-almonds-in-bowl.jpg",
    description: "Almendras naturales sin tostar",
  },
  {
    id: 2,
    name: "Nueces de California",
    category: "Nueces",
    price: "12.00",
    unit: "kg",
    image: "/california-walnuts.jpg",
    description: "Nueces premium de California",
  },
  {
    id: 3,
    name: "Pasas Sultanas",
    category: "Frutos Secos",
    price: "6.50",
    unit: "kg",
    image: "/golden-raisins.png",
    description: "Pasas doradas sin semilla",
  },
  {
    id: 4,
    name: "Pistachos Tostados",
    category: "Frutos Secos",
    price: "15.00",
    unit: "kg",
    image: "/roasted-pistachios.jpg",
    description: "Pistachos tostados con sal",
  },
  {
    id: 5,
    name: "Semillas de Girasol",
    category: "Semillas",
    price: "4.50",
    unit: "kg",
    image: "/sunflower-seeds.jpg",
    description: "Semillas peladas y tostadas",
  },
  {
    id: 6,
    name: "Mezcla Energética",
    category: "Mezclas",
    price: "10.00",
    unit: "kg",
    image: "/trail-mix-nuts.jpg",
    description: "Mix de frutos secos y semillas",
  },
  {
    id: 7,
    name: "Avellanas Tostadas",
    category: "Frutos Secos",
    price: "11.50",
    unit: "kg",
    image: "/roasted-hazelnuts.jpg",
    description: "Avellanas tostadas sin piel",
  },
  {
    id: 8,
    name: "Anacardos Premium",
    category: "Frutos Secos",
    price: "14.00",
    unit: "kg",
    image: "/cashew-nuts.jpg",
    description: "Anacardos enteros de primera",
  },
  {
    id: 9,
    name: "Dátiles Medjool",
    category: "Especiales",
    price: "9.50",
    unit: "kg",
    image: "/medjool-dates.jpg",
    description: "Dátiles grandes y jugosos",
  },
  {
    id: 10,
    name: "Almendras Garrapiñadas",
    category: "Especiales",
    price: "10.50",
    unit: "kg",
    image: "/candied-almonds.jpg",
    description: "Almendras con caramelo crujiente",
  },
  {
    id: 11,
    name: "Semillas de Calabaza",
    category: "Semillas",
    price: "5.50",
    unit: "kg",
    image: "/roasted-pumpkin-seeds.png",
    description: "Pepitas tostadas con sal",
  },
  {
    id: 12,
    name: "Mezcla Mediterránea",
    category: "Mezclas",
    price: "11.00",
    unit: "kg",
    image: "/mediterranean-nut-mix.jpg",
    description: "Selección de frutos mediterráneos",
  },
]

export default function TiendaPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const filteredProducts =
    selectedCategory === "Todos" ? products : products.filter((p) => p.category === selectedCategory)

  useEffect(() => {
    console.log('Hello There!')
    fetch(url).then(resp => resp.json()).then(products => console.log(products))
  }, []);

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
                Nuestra Tienda
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Explora nuestra selección de productos naturales de la más alta calidad
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap ${selectedCategory === category ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                    }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">€{product.price}</span>
                        <span className="text-sm text-muted-foreground ml-1">/{product.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2
                className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                ¿Necesitas Ayuda?
              </h2>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                Visítanos en nuestra tienda para recibir asesoramiento personalizado y descubrir todos nuestros
                productos. También puedes contactarnos para pedidos especiales o consultas.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href="/contacto">Contáctanos</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
