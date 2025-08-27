// // src/pages/Logout.jsx
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";

// export default function Logout() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       // Putus sesi di TAB ini (tidak menyentuh database)
//       const { error } = await supabase.auth.signOut({ scope: "local" });
//       if (error) console.error("signOut error:", error);

//       // Sinkronkan cache session SDK
//       await supabase.auth.getSession();

//       // Bersihkan token lokal (extra safety)
//       try { localStorage.removeItem(supabase.storageKey); } catch {}

//       // Kembali ke beranda + reload ringan agar UI pasti reset
//       navigate("/", { replace: true });
//       setTimeout(() => window.location.reload(), 100);
//     })();
//   }, [navigate]);

//   return <div className="p-6">Logging out…</div>;
// }

// src/pages/Logout.jsx
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";

// export default function Logout() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     let finished = false;

//     const clearLocalTokens = () => {
//       try {
//         // hapus semua kunci auth Supabase di tab ini
//         Object.keys(localStorage).forEach((k) => {
//           if (k.startsWith("sb-")) localStorage.removeItem(k);
//         });
//         sessionStorage.clear();
//       } catch {}
//     };

//     const finish = () => {
//       if (finished) return;
//       finished = true;
//       // kembali ke beranda tanpa me-reload /logout (hindari nyangkut)
//       window.location.replace("/");
//     };

//     (async () => {
//       // 1) Logout GLOBAL (cabut refresh token untuk semua device/tab)
//       //    Pakai timeout sebagai fallback kalau jaringan lambat.
//       const globalSignOut = supabase.auth.signOut({ scope: "global" });
//       const timeout = new Promise((res) => setTimeout(res, 1200));
//       try {
//         await Promise.race([globalSignOut, timeout]);
//       } catch {
//         // abaikan error network — kita tetap lanjut bersih-bersih lokal
//       }

//       // 2) Bersihkan token lokal untuk memastikan tidak rehydrate
//       clearLocalTokens();

//       // 3) Sinkronkan state in-memory SDK (biar session jadi null)
//       try {
//         await supabase.auth.getSession();
//       } catch {}

//       // 4) Selesai
//       finish();
//     })();

//     return () => {
//       finished = true;
//     };
//   }, [navigate]);

//   return <div className="p-6">Logging out…</div>;
// }

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
