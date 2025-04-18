import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Handle server-side rendering and missing environment variables
let supabase: ReturnType<typeof createClient<Database>> | null = null;

// Only initialize the client if we're in the browser or if environment variables are available
if (typeof window !== 'undefined' || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
}

// Provide a dummy client for build time
if (!supabase) {
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      insert: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      update: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      delete: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      eq: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      single: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      order: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      limit: () => ({ data: null, error: new Error('Supabase client not initialized') }),
    }),
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: new Error('Supabase client not initialized') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: null, unsubscribe: () => {} })
    }
  } as any;
}

export { supabase }; 