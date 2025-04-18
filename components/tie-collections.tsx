'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getCollections } from "@/lib/products"
import { useTranslation } from "@/lib/use-translation"
import { useLanguage } from "@/lib/language-context"

// Define an extended collection type with url_id
interface ExtendedCollection {
  id: string | number;
  name: string;
  description: string;
  image_url: string;
  url_id?: string;
  [key: string]: any;
}

// Fallback collections if database isn't connected
const fallbackCollections: ExtendedCollection[] = [
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

export default function TieCollections() {
  const { t, translateDynamicContent } = useTranslation();
  const { language } = useLanguage();
  const [collections, setCollections] = useState<ExtendedCollection[]>(fallbackCollections)
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
      try {
        const collectionsData = await getCollections()
        
        if (collectionsData && collectionsData.length > 0) {
          // Create a mapping to normalize collection IDs for URLs
          // This ensures our collection URLs match what the collection detail page expects
          const normalizedCollections = collectionsData.map(collection => {
            // Map numeric collection IDs to string IDs for URL consistency
            let urlId = String(collection.id);
            
            // Map known database IDs to URL string IDs
            if (collection.id === 1 || collection.name?.toLowerCase().includes('basic')) {
              urlId = "classic";
            } else if (collection.id === 2 || collection.name?.toLowerCase().includes('standard')) {
              urlId = "modern";
            } else if (collection.id === 3 || collection.name?.toLowerCase().includes('premium')) {
              urlId = "limited";
            } else if (collection.id === 4 || collection.name?.toLowerCase().includes('luxury')) {
              urlId = "seasonal";
            }
            
            // Add a URL ID for routing, but keep the original ID for database operations
            return {
              ...collection,
              url_id: urlId
            } as ExtendedCollection;
          });
          
          
          setCollections(normalizedCollections);
        } else {
          console.log("No collections found in database, using fallbacks");
          // Add url_id to fallbacks too
          const fallbacksWithUrlIds = fallbackCollections.map(collection => ({
            ...collection,
            url_id: String(collection.id)
          }));
          setCollections(fallbacksWithUrlIds);
        }
      } catch (error) {
        console.error("Error loading collections:", error)
        // Add url_id to fallbacks too
        const fallbacksWithUrlIds = fallbackCollections.map(collection => ({
          ...collection,
          url_id: String(collection.id)
        }));
        setCollections(fallbacksWithUrlIds);
      } finally {
        setIsLoading(false)
      }
    }

    loadCollections()
  }, [])

  const handleCollectionClick = (collectionId: string) => {
    console.log(`Clicking collection: ${collectionId}`);
    // No need to return anything - just for debugging
  }

  if (isLoading) {
    return (
      <section className="bg-zinc-900 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">{t('ourCollections')}</h2>
            <div className="w-24 h-1 bg-amber-800 mx-auto mt-4"></div>
            <p className="text-gray-300 mt-6">{t('loadingCollections')}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-zinc-900 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">{t('ourCollections')}</h2>
          <div className="w-24 h-1 bg-amber-800 mx-auto mt-4"></div>
          <p className="text-gray-300 mt-6 max-w-2xl mx-auto">
            {t('exploreCollections')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.url_id || collection.id}`}
              className="group block relative h-[500px] overflow-hidden"
              onClick={() => handleCollectionClick(String(collection.id))}
            >
              <Image
                src={collection.image_url || "/placeholder.svg"}
                alt={getCollectionName(collection)}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-serif font-bold text-white">{getCollectionName(collection)}</h3>
                <p className="text-gray-300 mt-2">{getCollectionDescription(collection)}</p>
                <div className="mt-4 flex items-center text-amber-700 font-medium group-hover:text-amber-500 transition-colors">
                  {t('exploreCollection')} <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
