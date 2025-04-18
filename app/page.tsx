'use client'

import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import FeaturedTies from "@/components/featured-ties"
import TieCollections from "@/components/tie-collections"
import { useTranslation } from "@/lib/use-translation"

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[95vh] w-full bg-zinc-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/hero2.jpg"
            alt={t('elegantNeckTie')}
            fill
            style={{ objectFit: "cover", objectPosition: "right center" }}
            className="opacity-80"
            sizes="100vw"
            quality={95}
            priority
          />
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        
        {/* Content Container */}
        <div className="container mx-auto px-4 md:px-6 relative z-20 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl">
              {t('heroSubtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/collections">
                <Button className="bg-amber-900 hover:bg-amber-800 text-white rounded-none px-8 py-6">
                  {t('shopCollection')} <ShoppingBag className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedTies />

      {/* Collections */}
      <TieCollections />

      {/* How to Wear the Tie Section (formerly Craftsmanship) */}
      <section className="bg-zinc-900 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                {t('howToWearTitle')}
              </h2>
              <p className="text-gray-300 mb-6">
                {t('howToWearDescription1')}
              </p>
              <p className="text-gray-300">
                {t('howToWearDescription2')}
              </p>
            </div>
            <div className="relative h-[500px] w-full bg-zinc-800 rounded-md overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                controls
                poster="/video-thumbnail.jpg"
              >
                <source src="/tie-tutorial.mp4" type="video/mp4" />
                {t('videoNotSupported')}
              </video>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
