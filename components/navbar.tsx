"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"
import LanguageSwitcher from "./language-switcher"
import { useTranslation } from "@/lib/use-translation"
import { useLanguage } from "@/lib/language-context"

export default function Navbar() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  return (
    <header className="bg-black/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-zinc-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-zinc-950 border-zinc-800">
              <SheetTitle className="text-white sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 mt-10">
                <Link href="/" className="text-lg font-medium text-white hover:text-amber-700 transition-colors">
                  {t('home')}
                </Link>
                <Link
                  href="/collections"
                  className="text-lg font-medium text-white hover:text-amber-700 transition-colors"
                >
                  {t('collections')}
                </Link>
                <Link
                  href="/products"
                  className="text-lg font-medium text-white hover:text-amber-700 transition-colors"
                >
                  {t('products')}
                </Link>
                <Link href="/contact" className="text-lg font-medium text-white hover:text-amber-700 transition-colors">
                  {t('contact')}
                </Link>
                <LanguageSwitcher />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="Elegant Ties Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <span className="font-serif text-2xl font-bold text-white">{t('brandName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${language === 'ar' ? 'space-x-0 rtl:space-x-reverse space-x-12' : 'space-x-8'}`}>
            <Link href="/collections" className="text-sm font-medium text-white hover:text-amber-700 transition-colors px-1">
              {t('collections')}
            </Link>
            <Link href="/products" className="text-sm font-medium text-white hover:text-amber-700 transition-colors px-1">
              {t('products')}
            </Link>
            <Link href="/contact" className="text-sm font-medium text-white hover:text-amber-700 transition-colors px-1">
              {t('contact')}
            </Link>
          </nav>

          {/* Empty div to maintain layout balance */}
          <div className="w-10">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
