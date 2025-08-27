// src/contexts/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Coba ambil sesi yang ada saat komponen pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Buat listener onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Jika loading belum false, set false setelah event pertama
      if (loading) setLoading(false);
    });

    // Cleanup listener saat komponen di-unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Cukup jalankan sekali

  const value = {
    session,
    user: session?.user || null,
    signOut: () => supabase.auth.signOut(),
  };

  // Tampilkan loading screen jika perlu, agar tidak ada "flicker"
  if (loading) {
    return <div>Memuat sesi...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Buat hook kustom agar mudah digunakan di komponen lain
export function useAuth() {
  return useContext(AuthContext);
}