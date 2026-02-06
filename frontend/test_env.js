
import { supabase } from './src/utils/supabase';

console.log('Supabase instance:', supabase);
console.log('Env check:', import.meta.env.VITE_SUPABASE_URL);
