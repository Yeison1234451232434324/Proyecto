const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Cliente público (respeta RLS) — para auth
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Cliente admin (bypasea RLS) — para operaciones del backend
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

module.exports = supabase;
module.exports.supabaseAdmin = supabaseAdmin;
