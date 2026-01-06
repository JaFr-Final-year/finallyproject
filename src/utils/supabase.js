import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that the required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing! Check your .env file.');
}

/**
 * Supabase client instance for interacting with the database and authentication services.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
