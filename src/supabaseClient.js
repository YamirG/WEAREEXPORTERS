import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eaxaxvnfllukoflzuxcq.supabase.co'; // reemplaza con tu URL real
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheGF4dm5mbGx1a29mbHp1eGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjIzODQsImV4cCI6MjA2OTMzODM4NH0.YP9lOmK3Jo2yHqtgZROrh4asidPyUc4UcV6GPtHcxDQ'; // reemplaza con tu clave
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('TU-PROYECTO') || supabaseAnonKey === 'TU-ANON-KEY') {
  // Aviso en consola si faltan credenciales
  // (no rompe la app, pero verás errores al intentar usar Supabase)
  console.warn('⚠️ Configura REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en tu .env');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
