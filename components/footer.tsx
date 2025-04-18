'use client'

import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { useTranslation } from "@/lib/use-translation"
import { useLanguage } from "@/lib/language-context"

export default function Footer() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-800">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">{t('brandName')}</h3>
            <p className="text-gray-400 mb-4">{t('craftingLuxury')}</p>
            <div className={`flex ${language === 'ar' ? 'space-x-0 space-x-reverse space-x-6' : 'space-x-4'}`}>
              <Link href="https://www.facebook.com/share/16NDq1Rk94/?mibextid=wwXIfr" className="text-gray-400 hover:text-amber-700 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://www.instagram.com/easy__tie?igsh=dmZhYzlncnFoYm11&utm_source=qr" className="text-gray-400 hover:text-amber-700 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-4">{t('shop')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/collections/classic" className="text-gray-400 hover:text-amber-700 transition-colors">
                  {t('classicCollection')}
                </Link>
              </li>
              <li>
                <Link href="/collections/modern" className="text-gray-400 hover:text-amber-700 transition-colors">
                  {t('standardCollection')}
                </Link>
              </li>
              <li>
                <Link href="/collections/limited" className="text-gray-400 hover:text-amber-700 transition-colors">
                  {t('premiumCollection')}
                </Link>
              </li>
              <li>
                <Link href="/collections/seasonal" className="text-gray-400 hover:text-amber-700 transition-colors">
                  {t('luxuryCollection')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-amber-700 transition-colors">
                  {t('allProducts')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-4">{t('company')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-amber-700 transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>{t('copyright').replace('{year}', currentYear.toString())}</p>
        </div>
      </div>
    </footer>
  )
}
