import { supabase } from './supabase'
import { Database } from './database.types'

export type Product = Database['public']['Tables']['products']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type SiteContent = Database['public']['Tables']['site_content']['Row']

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data || []
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
  
  return data || []
}

export async function getCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching collections:', error)
    return []
  }
  
  return data || []
}

export async function getHeroContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('key', 'hero')
    .single()
  
  if (error) {
    console.error('Error fetching hero content:', error)
    return null
  }
  
  return data || null
}

export async function getAboutContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('key', 'about')
    .single()
  
  if (error) {
    console.error('Error fetching about content:', error)
    return null
  }
  
  return data || null
} 