import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function TiendaPage() {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-20 min-h-[40vh]">
        <h1 className="font-headline font-bold text-4xl text-foreground">Tienda</h1>
        <p className="text-muted-foreground text-lg mt-3">
          Nuestra tienda en línea está en camino. Muy pronto podrás comprar a granel desde aquí.
        </p>
      </main>
      <Footer />
    </>
  )
}
