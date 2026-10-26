import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config/env';

export const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
