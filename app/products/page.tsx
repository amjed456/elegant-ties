'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { Eye, X, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getProducts, Product } from "@/lib/products"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/use-translation"
import { useLanguage } from "@/lib/language-context"

// Fallback data when database is not connected
const fallbackProducts = [
  {
    id: 1,
    name: "Midnight Silk",
    price: "$120",
    image_url: "/red.png",
    description: "Pure silk with subtle midnight blue pattern",
  },
  {
    id: 2,
    name: "Crimson Elegance",
    price: "$135",
    image_url: "/blue.png",
    description: "Deep red with intricate jacquard weave",
  },
  {
    id: 3,
    name: "Obsidian Shadow",
    price: "$145",
    image_url: "/brown.png",
    description: "Black silk with subtle texture and sheen",
  },
  {
    id: 4,
    name: "Royal Navy",
    price: "$125",
    image_url: "/blue2.png",
    description: "Premium navy blue with micro patterns",
  },
  {
    id: 5,
    name: "Amber Essence",
    price: "$130",
    image_url: "/orange.png", 
    description: "Warm amber tones with classic diagonal pattern",
  },
  {
    id: 6,
    name: "Plum Prestige",
    price: "$140",
    image_url: "/purple.png",
    description: "Rich plum color with subtle paisley design",
  },
]

export default function ProductsPage() {
  const { t, translateDynamicContent } = useTranslation();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState("") // Default to empty

  // Function to open the quick view modal
  const openQuickView = (product: Product) => {
    setSelectedProduct(product)
    setQuickViewOpen(true)
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden'
  }

  // Function to close the quick view modal
  const closeQuickView = () => {
    setQuickViewOpen(false)
    // Re-enable scrolling
    document.body.style.overflow = 'auto'
  }

  // Function to create WhatsApp message with product details
  const createWhatsAppLink = (product: Product) => {
    // Use a default number if none is configured
    const number = whatsappNumber || "+218920385234" 
    const message = `Hi, I'm interested in the ${product.name} tie priced at ${product.price}. Can you provide more information?`
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
  }

  // Function to format price according to language
  const formatPrice = (price: string) => {
    // Remove any existing currency symbols
    const numericPrice = price.replace(/[^0-9.]/g, '');
    
    // Add appropriate currency symbol based on language
    return language === 'ar' ? `${numericPrice} ${t('currency')}` : `${t('currency')} ${numericPrice}`;
  }

  // Fetch products and site settings on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Load products
        const loadedProducts = await getProducts()
        
        if (!loadedProducts || loadedProducts.length === 0) {
          setProducts(fallbackProducts as Product[])
        } else {
          setProducts(loadedProducts)
        }
        
        // Load WhatsApp number from site settings
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .single()
        
        if (data && data.settings && data.settings.whatsapp_number) {
          setWhatsappNumber(data.settings.whatsapp_number)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setProducts(fallbackProducts as Product[])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Close quick view when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeQuickView()
    }
  }

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen">
        <section className="bg-zinc-900 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white text-center">
              {t('loadingProducts')}
            </h1>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Products Hero */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white text-center">
            {t('completeCollection')}
          </h1>
          <div className="w-24 h-1 bg-amber-800 mx-auto mt-4 mb-6"></div>
          <p className="text-gray-300 text-center max-w-2xl mx-auto">
            {t('browseCollection')}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-zinc-950 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative h-[550px] overflow-hidden bg-zinc-900">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={95}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button 
                      className="bg-amber-900 hover:bg-amber-800 text-white rounded-none"
                      onClick={() => openQuickView(product)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> {t('quickView')}
                    </Button>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-serif font-medium text-white">
                    {translateDynamicContent(product.name)}
                  </h3>
                  <p className="text-gray-300 mt-2">
                    {translateDynamicContent(product.description)}
                  </p>
                  <p className="text-amber-700 font-bold mt-3">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewOpen && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-zinc-900 max-w-4xl w-full max-h-[90vh] overflow-auto p-6 relative rounded-lg">
            <button 
              className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-4 text-gray-400 hover:text-white`}
              onClick={closeQuickView}
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px]">
                <Image
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={95}
                />
              </div>
              
              <div className="w-full md:w-1/2">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                  {translateDynamicContent(selectedProduct.name)}
                </h2>
                <p className="text-amber-700 font-bold text-xl mb-6">
                  {formatPrice(selectedProduct.price)}
                </p>
                <div className="h-px bg-zinc-800 my-6"></div>
                <p className="text-gray-300 mb-6">
                  {translateDynamicContent(selectedProduct.description)}
                </p>
                <a 
                  href={createWhatsAppLink(selectedProduct)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none py-6 text-lg flex items-center justify-center">
                    <MessageCircle className="mr-2 h-5 w-5" /> {t('contactViaWhatsApp')}
                  </Button>
                </a>
                
                <div className="mt-8">
                  <h3 className="text-white font-medium mb-2">{t('productDetails')}</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• {t('silkMaterial')}</li>
                    <li>• {t('handcrafted')}</li>
                    <li>• {t('dimensions')}</li>
                    <li>• {t('cleaning')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
} 