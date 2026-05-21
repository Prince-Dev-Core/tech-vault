const { createClient } = require('@supabase/supabase-js');

// These variables must be defined in your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('⚡ Supabase client initialized');
module.exports = supabase;