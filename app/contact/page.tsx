'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Facebook, Instagram, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { TikTokIcon } from '@/components/tiktok-icon'
import { useTranslation } from '@/lib/use-translation'

interface SiteSettings {
  whatsapp_number: string;
  facebook_url: string;
  instagram_url: string;
  phone_number: string;
  tiktok_url: string;
  [key: string]: any;
}

export default function ContactPage() {
  const { t } = useTranslation();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    whatsapp_number: '',
    facebook_url: '',
    instagram_url: '',
    phone_number: '',
    tiktok_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Function to open contact modal
  const openContactModal = () => {
    setContactModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Function to close contact modal
  const closeContactModal = () => {
    setContactModalOpen(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeContactModal();
    }
  };

  // Function to create WhatsApp chat link
  const createWhatsAppLink = () => {
    // Use a default number if none is configured
    const number = siteSettings.whatsapp_number || "12345678900";
    const message = `Hi, I'm interested in your products. Can you provide more information?`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        // Load site settings
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error loading site settings:", error);
          return;
        }
        
        if (data && data.settings) {
          setSiteSettings(data.settings as SiteSettings);
        }
      } catch (error) {
        console.error("Error loading site settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();

    // Auto-open the contact modal when the page loads
    openContactModal();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">{t('contactHeading')}</h1>
          <div className="w-24 h-1 bg-amber-800 mx-auto mt-4"></div>
          <p className="text-gray-300 mt-6 max-w-2xl mx-auto">
            {t('contactDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* WhatsApp */}
          <div className="bg-zinc-900 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-600 mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{t('whatsApp')}</h3>
            <p className="text-gray-300 mb-4">{t('whatsAppDesc')}</p>
            <a 
              href={createWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                {t('chatNow')}
              </Button>
            </a>
          </div>

          {/* Phone */}
          <div className="bg-zinc-900 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-800 mb-4">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{t('phone')}</h3>
            <p className="text-gray-300 mb-4">{t('phoneDesc')}</p>
            {siteSettings.phone_number ? (
              <a 
                href={`tel:${siteSettings.phone_number}`} 
                className="block w-full"
              >
                <Button className="w-full bg-amber-800 hover:bg-amber-700 text-white">
                  {siteSettings.phone_number}
                </Button>
              </a>
            ) : (
              <Button disabled className="w-full bg-zinc-700 text-white opacity-70 cursor-not-allowed">
                {t('phoneNotAvailable')}
              </Button>
            )}
          </div>

          {/* Facebook */}
          <div className="bg-zinc-900 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4">
              <Facebook className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{t('facebook')}</h3>
            <p className="text-gray-300 mb-4">{t('facebookDesc')}</p>
            {siteSettings.facebook_url ? (
              <a 
                href={siteSettings.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {t('visitPage')}
                </Button>
              </a>
            ) : (
              <Button disabled className="w-full bg-zinc-700 text-white opacity-70 cursor-not-allowed">
                {t('comingSoon')}
              </Button>
            )}
          </div>

          {/* Instagram */}
          <div className="bg-zinc-900 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-pink-600 mb-4">
              <Instagram className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{t('instagram')}</h3>
            <p className="text-gray-300 mb-4">{t('instagramDesc')}</p>
            {siteSettings.instagram_url ? (
              <a 
                href={siteSettings.instagram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                  {t('visitProfile')}
                </Button>
              </a>
            ) : (
              <Button disabled className="w-full bg-zinc-700 text-white opacity-70 cursor-not-allowed">
                {t('comingSoon')}
              </Button>
            )}
          </div>

          {/* TikTok */}
          <div className="bg-zinc-900 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-black mb-4">
              <TikTokIcon className="h-8 w-8 text-white" size={32} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{t('tiktok')}</h3>
            <p className="text-gray-300 mb-4">{t('tiktokDesc')}</p>
            {siteSettings.tiktok_url ? (
              <a 
                href={siteSettings.tiktok_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-black hover:bg-zinc-800 text-white">
                  {t('visitTiktok')}
                </Button>
              </a>
            ) : (
              <Button disabled className="w-full bg-zinc-700 text-white opacity-70 cursor-not-allowed">
                {t('comingSoon')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-zinc-900 max-w-lg w-full p-6 rounded-lg">
            <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center">
              {t('contactHeading')}
            </h2>
            
            <div className="space-y-6">
              {/* WhatsApp Button */}
              <a 
                href={createWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg flex items-center justify-center">
                  <MessageCircle className="mr-2 h-5 w-5" /> {t('contactViaWhatsApp')}
                </Button>
              </a>
              
              {/* Phone Number */}
              {siteSettings.phone_number && (
                <a 
                  href={`tel:${siteSettings.phone_number}`}
                  className="block w-full"
                >
                  <Button className="w-full bg-amber-800 hover:bg-amber-700 text-white py-6 text-lg flex items-center justify-center">
                    <Phone className="mr-2 h-5 w-5" /> {siteSettings.phone_number}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 