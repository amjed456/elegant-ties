'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getCollections } from "@/lib/products"
import { useTranslation } from "@/lib/use-translation"
import { useLanguage } from "@/lib/language-context"

// Fallback collections if database isn't connected
const fallbackCollections = [
  {
    id: "classic",
    name: "Basic Collection",
    description: "Timeless designs for the distinguished gentleman",
    image_url: "/blue2.png",
  },
  {
    id: "modern",
    name: "Standard Collection",
    description: "Contemporary styles with unique textures",
    image_url: "/brown2.png",
  },
  {
    id: "limited",
    name: "Premium Collection",
    description: "Exclusive designs with numbered pieces",
    image_url: "/orange.png",
  },
  {
    id: "seasonal",
    name: "Luxury Collection",
    description: "Curated ties for every occasion and season",
    image_url: "/purple.png",
  },
]

export default function CollectionsPage() {
  const { t, translateDynamicContent } = useTranslation();
  const { language } = useLanguage();
  const [collections, setCollections] = useState(fallbackCollections)
  const [isLoading, setIsLoading] = useState(true)

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
    async function loadCollections() {
      setIsLoading(true)
      try {
        const collectionsData = await getCollections();
        
        // If no collections found in the database or not connected, use fallback data
        if (!collectionsData || collectionsData.length === 0) {
          console.log("No collections in database, using fallbacks");
          setCollections(fallbackCollections);
        } else {
          // Ensure all collections have string IDs that match our predefined keys
          const processedCollections = collectionsData.map(collection => {
            // Make sure we have a string ID that matches one of our predefined keys if possible
            if (typeof collection.id === 'number') {
              // If database uses numeric IDs, map them to our predefined string IDs if possible
              // based on collection name
              const name = collection.name?.toLowerCase() || '';
              if (name.includes('basic')) return { ...collection, id: "classic" };
              if (name.includes('standard')) return { ...collection, id: "modern" };
              if (name.includes('premium')) return { ...collection, id: "limited" };
              if (name.includes('luxury')) return { ...collection, id: "seasonal" };
            }
            return collection;
          });
          
          console.log("Loaded collections:", processedCollections);
          setCollections(processedCollections);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        setCollections(fallbackCollections);
      } finally {
        setIsLoading(false)
      }
    }

    loadCollections();
  }, []);

  const handleCollectionClick = (collectionId: string) => {
    console.log(`Clicking collection: ${collectionId}`);
    // No need to return anything - just for debugging
  }

  if (isLoading) {
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
      {/* Collections Hero */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white text-center">
            {t('collectionsPageHeading')}
          </h1>
          <div className="w-24 h-1 bg-amber-800 mx-auto mt-4 mb-6"></div>
          <p className="text-gray-300 text-center max-w-2xl mx-auto">
            {t('collectionsPageDescription')}
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="bg-zinc-950 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="group block relative h-[400px] overflow-hidden rounded-md"
                onClick={() => handleCollectionClick(String(collection.id))}
              >
                <Image
                  src={collection.image_url || "/placeholder.svg"}
                  alt={getCollectionName(collection)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-serif font-bold text-white">{getCollectionName(collection)}</h3>
                  <p className="text-gray-300 mt-2">{getCollectionDescription(collection)}</p>
                  <div className="mt-4 flex items-center text-amber-700 font-medium group-hover:text-amber-500 transition-colors">
                    {t('exploreCollection')} <ArrowRight className={`${language === 'ar' ? 'mr-2' : 'ml-2'} h-5 w-5`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 