const env = import.meta.env;

const config = {
  backend: env.VITE_BACKEND || "auto",
  supabaseUrl: env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL",
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY",
  storageBucket: "media"
};

export default config;
