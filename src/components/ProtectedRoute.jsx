// // src/components/ProtectedRoute.jsx
// import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";

// export default function ProtectedRoute({ children }) {
//   const [ready, setReady] = useState(false);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!cancelled) {
//         setUser(session?.user ?? null);
//         setReady(true);
//       }
//     })();

//     const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
//       setUser(session?.user ?? null);
//       setReady(true);
//     });

//     return () => {
//       cancelled = true;
//       sub.subscription?.unsubscribe();
//     };
//   }, []);

//   if (!ready) return <div className="p-6">Loading…</div>;
//   if (!user) return <Navigate to="/auth" replace />;
//   return children;
// }

// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // 1) Hydrate session sekali
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });

    // 2) Dengarkan perubahan login/logout
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  if (!ready) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
