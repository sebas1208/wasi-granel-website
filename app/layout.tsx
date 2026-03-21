import type React from "react"
import type { Metadata } from "next"
import { Fredoka } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const zalandoSans = localFont({
  src: [
    {
      path: "./fonts/ZalandoSans-Variable.ttf",
      style: "normal",
    },
    {
      path: "./fonts/ZalandoSans-Italic-Variable.ttf",
      style: "italic",
    },
  ],
  variable: "--font-zalando",
})

export const metadata: Metadata = {
  title: "Wasi Granel - Tueste en Progreso",
  description: "El mejor crujiente de la naturaleza, tostado a la perfección en lotes pequeños.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${zalandoSans.variable} ${fredoka.variable} antialiased font-body tracking-tight`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
