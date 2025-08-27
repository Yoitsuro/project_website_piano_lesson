// src/pages/Logout.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Logout() {
  const navigate = useNavigate();
  const ran = useRef(false); // cegah double-run di dev (StrictMode)

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const clearLocalTokens = () => {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith("sb-") && k.endsWith("-auth-token")) {
            localStorage.removeItem(k);
          }
        }
        for (const k of Object.keys(sessionStorage)) {
          if (k.startsWith("sb-") && k.endsWith("-auth-token")) {
            sessionStorage.removeItem(k);
          }
        }
      } catch {}
    };

    (async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("signOut error:", error);
      } catch (e) {
        console.error("signOut threw:", e);
      } finally {
        clearLocalTokens();
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate]);

  return <div className="p-6">Logging out…</div>;
}
