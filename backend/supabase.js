const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Prefer Service Role Key (Admin) -> Fallback to Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

console.log('Supabase Config Check:');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key. Check .env file.');
    // process.exit(1); // Removing exit to see if it allows keeping process alive or printing more info
    throw new Error('Missing Supabase Credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
