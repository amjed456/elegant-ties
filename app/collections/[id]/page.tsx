'use client'

import { useState, useEffect } from "react"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProducts, getCollections, Product } from "@/lib/products"
import { notFound, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/use-translation"
import { useLanguage } from "@/lib/language-context"

// Collection type mapping for fallbacks
const collectionTypes = {
  "classic": {
    id: "classic", 
    name: "Basic Collection",
    description: "Timeless designs for the distinguished gentleman. Our Basic Collection features essential ties that form the foundation of any gentleman's wardrobe.",
    image_url: "/blue2.png",
  },
  "modern": {
    id: "modern",
    name: "Standard Collection",
    description: "Contemporary styles with unique textures. The Standard Collection offers sophisticated ties with modern patterns and premium materials.",
    image_url: "/brown2.png",
  },
  "limited": {
    id: "limited",
    name: "Premium Collection",
    description: "Exclusive designs with numbered pieces. Our Premium Collection features limited-edition ties created with exceptional craftsmanship and luxurious materials.",
    image_url: "/orange.png",
  },
  "seasonal": {
    id: "seasonal",
    name: "Luxury Collection",
    description: "Curated ties for every occasion and season. The Luxury Collection represents our finest offerings, with extraordinary attention to detail and rare fabrics.",
    image_url: "/purple.png",
  },
  // Add numeric ID mappings
  "1": {
    id: "classic",
    name: "Basic Collection",
    description: "Timeless designs for the distinguished gentleman. Our Basic Collection features essential ties that form the foundation of any gentleman's wardrobe.",
    image_url: "/blue2.png",
  },
  "2": {
    id: "modern",
    name: "Standard Collection",
    description: "Contemporary styles with unique textures. The Standard Collection offers sophisticated ties with modern patterns and premium materials.",
    image_url: "/brown2.png",
  },
  "3": {
    id: "limited",
    name: "Premium Collection",
    description: "Exclusive designs with numbered pieces. Our Premium Collection features limited-edition ties created with exceptional craftsmanship and luxurious materials.",
    image_url: "/orange.png",
  },
  "4": {
    id: "seasonal",
    name: "Luxury Collection",
    description: "Curated ties for every occasion and season. The Luxury Collection represents our finest offerings, with extraordinary attention to detail and rare fabrics.",
    image_url: "/purple.png",
  }
}

// Fallback products for each collection
const fallbackProducts = {
  "classic": [
    {
      id: 1,
      name: "Classic Navy",
      price: "$89",
      image_url: "/blue.png",
      description: "A timeless navy tie suitable for any formal occasion",
    },
    {
      id: 2,
      name: "Classic Burgundy",
      price: "$89",
      image_url: "/red.png",
      description: "Rich burgundy with subtle pattern for elegant style",
    },
  ],
  "modern": [
    {
      id: 3,
      name: "Modern Stripe",
      price: "$95",
      image_url: "/blue2.png",
      description: "Contemporary striped design for the modern gentleman",
    },
    {
      id: 4,
      name: "Modern Geo",
      price: "$95",
      image_url: "/brown.png",
      description: "Geometric patterns with a contemporary twist",
    },
  ],
  "limited": [
    {
      id: 5,
      name: "Amber Limited",
      price: "$125",
      image_url: "/orange.png",
      description: "Limited edition amber tie with exclusive pattern",
    },
    {
      id: 6,
      name: "Obsidian Limited",
      price: "$125",
      image_url: "/brown2.png",
      description: "Limited run obsidian black tie with premium finish",
    },
  ],
  "seasonal": [
    {
      id: 7,
      name: "Royal Luxury",
      price: "$150",
      image_url: "/purple.png",
      description: "Luxurious royal purple tie with intricate detailing",
    },
    {
      id: 8,
      name: "Emerald Luxury",
      price: "$150",
      image_url: "/blue2.png",
      description: "Premium emerald tie crafted from the finest silk",
    },
  ],
  // Add numeric ID mappings for products too
  "1": [
    {
      id: 1,
      name: "Classic Navy",
      price: "$89",
      image_url: "/blue.png",
      description: "A timeless navy tie suitable for any formal occasion",
    },
    {
      id: 2,
      name: "Classic Burgundy",
      price: "$89",
      image_url: "/red.png",
      description: "Rich burgundy with subtle pattern for elegant style",
    },
  ],
  "2": [
    {
      id: 3,
      name: "Modern Stripe",
      price: "$95",
      image_url: "/blue2.png",
      description: "Contemporary striped design for the modern gentleman",
    },
    {
      id: 4,
      name: "Modern Geo",
      price: "$95",
      image_url: "/brown.png",
      description: "Geometric patterns with a contemporary twist",
    },
  ],
  "3": [
    {
      id: 5,
      name: "Amber Limited",
      price: "$125",
      image_url: "/orange.png",
      description: "Limited edition amber tie with exclusive pattern",
    },
    {
      id: 6,
      name: "Obsidian Limited",
      price: "$125",
      image_url: "/brown2.png",
      description: "Limited run obsidian black tie with premium finish",
    },
  ],
  "4": [
    {
      id: 7,
      name: "Royal Luxury",
      price: "$150",
      image_url: "/purple.png",
      description: "Luxurious royal purple tie with intricate detailing",
    },
    {
      id: 8,
      name: "Emerald Luxury",
      price: "$150",
      image_url: "/blue2.png",
      description: "Premium emerald tie crafted from the finest silk",
    },
  ]
}

export default function CollectionPage() {
  const { t, translateDynamicContent } = useTranslation();
  const { language } = useLanguage();
  // Use the useParams hook instead of directly accessing params
  const params = useParams()
  const collectionId = params.id as string
  
  const [collection, setCollection] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  
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

  // Close quick view when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeQuickView()
    }
  }

  // Function to format price according to language
  const formatPrice = (price: string) => {
    // Remove any existing currency symbols
    const numericPrice = price.replace(/[^0-9.]/g, '');
    
    // Add appropriate currency symbol based on language
    return language === 'ar' ? `${numericPrice} ${t('currency')}` : `${t('currency')} ${numericPrice}`;
  }
  
  // Function to get collection name translation
  const getCollectionName = (collection: any) => {
    // Map collection IDs to translation keys
    const collectionTranslationMap: Record<string, string> = {
      "classic": "classicCollection",
      "modern": "standardCollection",
      "limited": "premiumCollection",
      "seasonal": "luxuryCollection",
      "1": "classicCollection",
      "2": "standardCollection",
      "3": "premiumCollection",
      "4": "luxuryCollection"
    };
    
    const id = String(collection.id);
    
    // If we have a direct translation for this collection ID, use that
    if (id in collectionTranslationMap) {
      return t(collectionTranslationMap[id]);
    }
    
    // Otherwise try to dynamically translate the name
    return translateDynamicContent(collection.name);
  }

  // Function to get collection description translation
  const getCollectionDescription = (collection: any) => {
    return translateDynamicContent(collection.description);
  }
  
  useEffect(() => {
    // Debug the collectionId we're trying to access
    console.log(`Collection page loaded with ID: ${collectionId} (${typeof collectionId})`);
    
    // Verify the collection ID exists in our predefined types
    if (!collectionTypes[collectionId as keyof typeof collectionTypes]) {
      // For debugging
      console.error(`Collection ID "${collectionId}" not found in predefined collections`);
      console.log("Available collections:", Object.keys(collectionTypes));
      notFound();
    }
    
    async function loadData() {
      setIsLoading(true)
      try {
        // First try to load collection and products from database
        const [collectionData, productsData] = await Promise.all([
          getCollections(),
          getProducts()
        ])
        
        console.log("Loaded collections:", collectionData);
        console.log("Loaded products:", productsData);
        
        // Process collection data
        if (collectionData && collectionData.length > 0) {
          // Map string collection IDs to database IDs for consistent lookup
          const collectionIdMap: Record<string, number> = {
            "classic": 1,  // Basic Collection
            "modern": 2,   // Standard Collection
            "limited": 3,  // Premium Collection
            "seasonal": 4  // Luxury Collection
          };
          
          // First try direct match by ID
          let foundCollection = collectionData.find(c => String(c.id) === collectionId);
          
          // If not found directly, try mapping from string ID to numeric ID
          if (!foundCollection && collectionIdMap[collectionId]) {
            foundCollection = collectionData.find(c => c.id === collectionIdMap[collectionId]);
            console.log(`Mapped "${collectionId}" to DB ID: ${collectionIdMap[collectionId]}`);
          }
          
          // If still not found, try matching by name
          if (!foundCollection) {
            const nameMap: Record<string, string> = {
              "classic": "Basic",
              "modern": "Standard",
              "limited": "Premium",
              "seasonal": "Luxury"
            };
            
            const searchTerm = nameMap[collectionId] || "";
            foundCollection = collectionData.find(c => 
              c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            console.log(`Matched by name "${searchTerm}":`, foundCollection);
          }
          
          if (foundCollection) {
            console.log("Found collection in database:", foundCollection);
            setCollection(foundCollection);
            
            // Filter products that belong to this collection - use the database ID from foundCollection
            const collectionProducts = productsData.filter(p => 
              String(p.collection_id) === String(foundCollection.id)
            );
            
            console.log("Filtered products for collection:", collectionProducts);
            
            if (collectionProducts.length > 0) {
              setProducts(collectionProducts);
            } else {
              // If no products found for this collection, use fallbacks
              console.log("No products found for this collection, using fallbacks");
              setProducts(fallbackProducts[collectionId as keyof typeof fallbackProducts] as unknown as Product[] || []);
            }
          } else {
            // Collection ID not found in database, use fallbacks
            console.log("Collection not found in database, using fallbacks");
            setCollection(collectionTypes[collectionId as keyof typeof collectionTypes]);
            setProducts(fallbackProducts[collectionId as keyof typeof fallbackProducts] as unknown as Product[] || []);
          }
        } else {
          // If no collections from database, use fallback
          console.log("No collections in database, using fallbacks");
          setCollection(collectionTypes[collectionId as keyof typeof collectionTypes]);
          setProducts(fallbackProducts[collectionId as keyof typeof fallbackProducts] as unknown as Product[] || []);
        }
        
        // Load WhatsApp number from site settings
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('*')
            .single()
          
          if (data && data.settings && data.settings.whatsapp_number) {
            setWhatsappNumber(data.settings.whatsapp_number)
          }
        } catch (error) {
          console.error("Error fetching WhatsApp number:", error)
        }
      } catch (error) {
        console.error("Error loading collection data:", error)
        // Use fallbacks on error
        setCollection(collectionTypes[collectionId as keyof typeof collectionTypes])
        setProducts(fallbackProducts[collectionId as keyof typeof fallbackProducts] as unknown as Product[] || [])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [collectionId])
  
  if (isLoading || !collection) {
    return (
      <main className="flex flex-col min-h-screen">
        <section className="bg-zinc-900 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white text-center">
              {t('loadingCollections')}
            </h1>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Collection Hero */}
      <section 
        className="relative bg-zinc-900 py-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.7)), url(${collection.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/collections" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('backToCollections')}
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white">
            {getCollectionName(collection)}
          </h1>
          <div className="w-24 h-1 bg-amber-800 mt-4 mb-6"></div>
          <p className="text-gray-300 max-w-2xl">
            {getCollectionDescription(collection)}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-zinc-950 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-12">
            {t('collectionProducts')}
          </h2>
          
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
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No products found in this collection.</p>
              <Link href="/products">
                <Button className="mt-4 bg-amber-900 hover:bg-amber-800 text-white">
                  View All Products
                </Button>
              </Link>
            </div>
          )}
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