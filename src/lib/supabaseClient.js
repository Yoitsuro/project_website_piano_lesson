// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Awal dari trik kita: Buat custom storage adapter
const customStorageAdapter = {
  getItem: (key) => {
    // Cek apakah 'rememberMe' di localStorage diset ke 'true'
    // Jika ya, gunakan localStorage. Jika tidak, gunakan sessionStorage.
    const remember = window.localStorage.getItem("rememberMe") === "true";
    const storage = remember ? window.localStorage : window.sessionStorage;
    return storage.getItem(key);
  },
  setItem: (key, value) => {
    // Logika yang sama saat menyimpan item
    const remember = window.localStorage.getItem("rememberMe") === "true";
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem(key, value);
  },
  removeItem: (key) => {
    // Logika yang sama saat menghapus item
    const remember = window.localStorage.getItem("rememberMe") === "true";
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.removeItem(key);
  },
};

// Gunakan adapter kita di dalam createClient
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // persistSession sekarang dikontrol oleh adapter kita
    storage: customStorageAdapter,
    autoRefreshToken: true, // Sebaiknya true untuk sesi yang lebih lama
    detectSessionInUrl: true,
  },
});
