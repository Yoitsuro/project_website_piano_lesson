// // src/components/AdminRoute.jsx
// import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";

// export default function AdminRoute({ children }) {
//   const [allowed, setAllowed] = useState(null);

//   useEffect(() => {
//     (async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         setAllowed(false);
//         return;
//       }

//       // Cek role via email (utama), fallback via id
//       let role = null;
//       if (user.email) {
//         const { data } = await supabase
//           .from("users")
//           .select("role")
//           .eq("email", user.email)
//           .maybeSingle();
//         role = data?.role ?? null;
//       }
//       if (!role) {
//         const { data } = await supabase
//           .from("users")
//           .select("role")
//           .eq("id", user.id)
//           .maybeSingle();
//         role = data?.role ?? null;
//       }

//       setAllowed(role === "admin");
//     })();
//   }, []);

//   if (allowed === null) return <div className="p-6">Loading...</div>;
//   if (!allowed) return <Navigate to="/" replace />;
//   return children;
// }

// src/components/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    const resolve = async () => {
      // hydrate session
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      if (!active) return;

      if (!u) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      // cek role via email (utama), fallback id
      let role = null;
      if (u.email) {
        const { data: row } = await supabase
          .from("users")
          .select("role")
          .eq("email", u.email)
          .maybeSingle();
        role = row?.role ?? null;
      }
      if (!role) {
        const { data: row } = await supabase
          .from("users")
          .select("role")
          .eq("id", u.id)
          .maybeSingle();
        role = row?.role ?? null;
      }

      if (!active) return;
      setAllowed(role === "admin");
      setLoading(false);
    };

    // pertama kali
    resolve();

    // dengarkan perubahan auth
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      resolve();
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!allowed) return <Navigate to="/" replace />;
  return children;
}
