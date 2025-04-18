'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, X, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Product, getFeaturedProducts } from "@/lib/products"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/use-translation"
import { useLanguage } from "@/lib/language-context"

// Fallback data when database is not connected
const fallbackFeaturedTies = [
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
]

export default function FeaturedTies() {
  const { t, translateDynamicContent } = useTranslation();
  const { language } = useLanguage();
  const [featuredTies, setFeaturedTies] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Function to open the quick view modal
  const openQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  // Function to close the quick view modal
  const closeQuickView = () => {
    setQuickViewOpen(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }

  // Function to create WhatsApp message with product details
  const createWhatsAppLink = (product: Product) => {
    // Use a default number if none is configured
    const number = whatsappNumber || "+218920385234";
    const message = `Hi, I'm interested in the ${product.name} tie priced at ${product.price}. Can you provide more information?`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  // Close quick view when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeQuickView();
    }
  }

  // Function to format price according to language
  const formatPrice = (price: string) => {
    // Remove any existing currency symbols
    const numericPrice = price.replace(/[^0-9.]/g, '');
    
    // Add appropriate currency symbol based on language
    return language === 'ar' ? `${numericPrice} ${t('currency')}` : `${t('currency')} ${numericPrice}`;
  }

  useEffect(() => {
    async function loadData() {
      try {
        // Load featured products
        const products = await getFeaturedProducts();
        if (products && products.length > 0) {
          setFeaturedTies(products);
        } else {
          setFeaturedTies(fallbackFeaturedTies as unknown as Product[]);
        }
        
        // Load WhatsApp number from site settings
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('*')
            .single();
          
          if (data && data.settings && data.settings.whatsapp_number) {
            setWhatsappNumber(data.settings.whatsapp_number);
          }
        } catch (error) {
          console.error("Error fetching WhatsApp number:", error);
        }
      } catch (error) {
        console.error("Error loading featured products:", error);
        setFeaturedTies(fallbackFeaturedTies as unknown as Product[]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Show a placeholder while loading
  if (isLoading) {
    return (
      <section className="bg-zinc-950 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">{t('featuredCollection')}</h2>
            <div className="w-24 h-1 bg-amber-800 mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative">
                <div className="relative h-[550px] overflow-hidden bg-zinc-800 animate-pulse"></div>
                <div className="mt-6 text-center">
                  <div className="h-6 bg-zinc-800 rounded animate-pulse w-2/3 mx-auto"></div>
                  <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4 mx-auto mt-2"></div>
                  <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/4 mx-auto mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-950 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">{t('featuredCollection')}</h2>
          <div className="w-24 h-1 bg-amber-800 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTies.map((tie) => (
            <div key={tie.id} className="group relative">
              <div className="relative h-[550px] overflow-hidden bg-zinc-900">
                <Image
                  src={tie.image_url || "/placeholder.svg"}
                  alt={tie.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  quality={95}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button 
                    className="bg-amber-900 hover:bg-amber-800 text-white rounded-none"
                    onClick={() => openQuickView(tie)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> {t('quickView')}
                  </Button>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-serif font-medium text-white">
                  {translateDynamicContent(tie.name)}
                </h3>
                <p className="text-gray-300 mt-2">
                  {translateDynamicContent(tie.description)}
                </p>
                <p className="text-amber-700 font-bold mt-3">{formatPrice(tie.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/products">
            <Button className="bg-transparent hover:bg-white/5 text-white border border-white rounded-none px-8 py-6">
              {t('viewAllProducts')}
            </Button>
          </Link>
        </div>
      </div>
      
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
    </section>
  );
}
