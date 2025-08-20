import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const nav = useNavigate();
  useEffect(() => {
    (async () => {
      // Setelah klik email, token di URL aktifkan session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("users").upsert(
          { id: user.id, email: user.email, name: user.user_metadata?.name ?? null },
          { onConflict: "id" }  // penting: pakai id (PK/FK)
        );
      }
      // Non auto-login
      await supabase.auth.signOut();
      nav("/login?verified=1", { replace: true });
    })();
  }, [nav]);

  return <p>Memverifikasi akun…</p>;
}
