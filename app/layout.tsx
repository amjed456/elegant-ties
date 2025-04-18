import "./globals.css"
import { Inter } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import { Providers } from "@/components/providers"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { ReactNode } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

export const metadata = {
  title: "Elegant Ties | Luxury Neckwear",
  description: "Discover our exclusive collection of handcrafted luxury neck ties.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}