import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (import.meta.env.DEV) window.supabase = supabase;

// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: true, // simpan session di localStorage
//     autoRefreshToken: true, // refresh access token otomatis
//     detectSessionInUrl: true, // tangkap session dari URL callback
//     storageKey: "gn_auth_v1", // nama kunci storage yang stabil
//   },
// });

// if (import.meta.env.DEV) window.supabase = supabase;
