"use client"

import Image from "next/image"
import { useState } from "react"

export default function UnderConstructionPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      // Call your local Next.js API route instead of Google directly
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
    }
  };

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex justify-center items-center px-6 h-18 max-w-7xl mx-auto">
          <div className="relative overflow-hidden flex items-center justify-center rounded-sm">
            <Image
              src="/logo.svg"
              alt="Wasi Granel Logo"
              loading="eager"
              width={120}
              height={40}
              className="h-15 w-auto relative z-0"
            />
            {/* Efecto de brillo */}
            <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 animate-shine pointer-events-none z-10"></div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[870px] flex items-center justify-center px-6 hero-pattern overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 opacity-60 transform -rotate-12 hidden lg:block">
            <span className="material-symbols-outlined text-5xl! text-primary">eco</span>
          </div>
          <div className="absolute bottom-20 right-10 opacity-60 transform rotate-12 hidden lg:block">
            <span className="material-symbols-outlined text-5xl! text-secondary">wheat</span>
          </div>
          <div className="max-w-4xl w-full text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-semibold mb-8">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                poker_chip
              </span>
              Tu tienda favorita, ¡ahora online!
            </div>
            <h1 className="relative overflow-hidden font-headline font-black text-5xl md:text-7xl text-on-background leading-tight mb-6 tracking-tight py-2">
              ¡Wasi Granel esta dando <span className="text-primary">un paso adelante!</span>
              {/* Efecto de brillo */}
              <span className="absolute top-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-shine pointer-events-none z-10"></span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-12">
              Muy pronto descubrirás una nueva experiencia para comprar a granel: más cercana, más clara y pensada para crecer contigo.
            </p>
            <div className="bg-white p-10 rounded-xl shadow-2xl shadow-surface-dim/30 border-2 border-primary/20 max-w-xl mx-auto relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
              <div className="relative z-10">
                <h2 className="font-headline font-black text-3xl text-on-background mb-4 leading-tight">
                  Sé parte de este <span className="text-primary">lanzamiento!</span>
                </h2>
                <p className="text-on-surface-variant mb-8 leading-relaxed">
                  Suscríbete para recibir un <span className="font-bold text-secondary text-lg">15% de descuento</span> en tu primer pedido.
                </p>
                <div className="flex flex-col gap-4">
                  <a href="#contacto" className="inline-flex items-center justify-center gap-2 bg-[#fcbf00] text-[#544738] font-black px-8 py-4 rounded-lg hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined">star</span>
                    Quiero mi descuento exclusivo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-24 bg-surface-container-low px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl relative group">
                <Image
                  src="/stock-image.png"
                  alt="Imagen de stock"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="font-headline font-bold text-2xl">Calidad que nutre. 100% Granel.</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="font-headline font-black text-4xl text-on-background mb-6">
                ¿Nuestra esencia? <br />
                Calidad y Cercanía.
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed mb-6">
                Seguimos ofreciéndote la mejor selección de granos, especias y frutos secos, ahora con la comodidad de pedir online.
              </p>
              <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
                Queremos acompañarte en esta nueva etapa, brindándote la variedad que buscas, comprando exactamente lo que necesitas a granel y al mejor precio.
              </p>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-primary font-black text-3xl">100%</span>
                  <span className="text-sm text-outline font-bold">A granel</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-secondary font-black text-3xl">Siempre</span>
                  <span className="text-sm text-outline font-bold">Cerca de ti</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sneak Peek Section - Bento Grid Style */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-headline font-black text-4xl text-on-background mb-4">Un vistazo al Wasi Granel</h2>
            <p className="text-on-surface-variant">Conoce algunos de nuestros productos mas populares.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product 1 */}
            <div className="group relative overflow-hidden rounded-lg bg-white border border-surface-variant shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="aspect-square overflow-hidden relative">
                <Image
                  src="/mix.png"
                  alt="Mix de Frutos Secos"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">
                  Crunch Saludable
                </span>
                <h3 className="font-headline font-bold text-xl mb-2 text-on-background">Mix de Frutos Secos</h3>
                <p className="text-sm text-on-surface-variant">
                  Una mezcla equilibrada de frutos secos mezclados a la perfección para un snack delicioso y nutritivo.
                </p>
              </div>
            </div>
            {/* Product 2 */}
            <div className="group relative overflow-hidden rounded-lg bg-white border border-surface-variant shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="aspect-square overflow-hidden relative">
                <Image
                  src="/almendras.png"
                  alt="Almendras"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">
                  Puro Bienestar
                </span>
                <h3 className="font-headline font-bold text-xl mb-2 text-on-background">Almendras</h3>
                <p className="text-sm text-on-surface-variant">
                  Almendras seleccionadas por su tamaño y calidad, tostadas a la perfección para un snack delicioso y nutritivo.
                </p>
              </div>
            </div>
            {/* Product 3 */}
            <div className="group relative overflow-hidden rounded-lg bg-white border border-surface-variant shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="aspect-square overflow-hidden relative">
                <Image
                  src="/chocolates.png"
                  alt="Chocolates de frutos secos"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">
                  Gusto Dulce
                </span>
                <h3 className="font-headline font-bold text-xl mb-2 text-on-background">Chocolates</h3>
                <p className="text-sm text-on-surface-variant">
                  Diferente variedad de chocolates con frutos secos en su interior que te encantarán.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Newsletter */}
        <section className="pb-24 px-6" id="contacto">
          <div className="max-w-4xl mx-auto bg-secondary rounded-xl p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              ></div>
            </div>
            <div className="relative z-10">
              <span
                className="material-symbols-outlined text-6xl mb-6 text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mail
              </span>
              <h2 className="font-headline font-black text-4xl mb-4">¡Tu Wasi, ahora más cerca!</h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
                Seguimos construyendo esta nueva etapa de Wasi Granel. <br />Déjanos tu correo y sé parte del lanzamiento.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
                <input
                  className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                  placeholder="Introduce tu correo electrónico"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  required
                />
                <button
                  className="bg-primary text-secondary font-bold px-8 py-4 rounded-lg hover:bg-amber-400 transition-colors active:scale-95 duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                >
                  {status === "loading" ? "Enviando..." : status === "success" ? "¡Suscrito!" : "Avísame"}
                </button>
              </form>
              {status === "success" && (
                <p className="mt-4 text-sm text-green-400 font-medium">¡Gracias por suscribirte! Te avisaremos pronto.</p>
              )}
              {status === "error" && (
                <p className="mt-4 text-sm text-red-400 font-medium">Hubo un error al suscribirte. Inténtalo de nuevo.</p>
              )}
              <p className="mt-6 text-sm text-white/50">Solo noticias saludables y del lanzamiento web.</p>
            </div>
          </div>
          <p></p>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Wasi Granel Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <div className="flex gap-8">

          </div>
          <div className="text-stone-500 dark:text-stone-400 text-sm font-body">
            © 2026 Wasi Granel. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
