// // src/components/Navbar.jsx
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [scrolled, setScrolled] = useState(false); // NEW

//   // solidkan navbar saat discroll dikit
//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 8);
//     onScroll();
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       setUser(user);
//       if (user?.email) {
//         const { data } = await supabase
//           .from("users")
//           .select("role")
//           .eq("email", user.email)
//           .maybeSingle();
//         setIsAdmin(data?.role === "admin");
//       } else {
//         setIsAdmin(false);
//       }
//     };
//     init();

//     const { data: sub } = supabase.auth.onAuthStateChange(
//       async (_e, session) => {
//         const u = session?.user ?? null;
//         setUser(u);
//         if (u?.email) {
//           const { data } = await supabase
//             .from("users")
//             .select("role")
//             .eq("email", u.email)
//             .maybeSingle();
//           setIsAdmin(data?.role === "admin");
//         } else {
//           setIsAdmin(false);
//         }
//       }
//     );
//     return () => sub.subscription.unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     const { error } = await supabase.auth.signOut({ scope: "local" });
//     if (error) {
//       console.error("signOut error:", error);
//       alert(error.message);
//       return;
//     }
//     await supabase.auth.getSession();
//     try {
//       localStorage.removeItem(supabase.storageKey);
//     } catch {}
//     navigate("/", { replace: true });
//     setTimeout(() => window.location.reload(), 100);
//   };

//   const isHome = location.pathname === "/";

//   return (
//     <nav
//       className={`fixed top-0 inset-x-0 z-50 transition-all border-b
//       ${
//         isHome && !scrolled
//           ? "bg-white/10 backdrop-blur-md border-white/20"
//           : "bg-white/90 backdrop-blur-md border-white/40 shadow"
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
//         <Link to="/" className="flex items-center gap-2">
//           <span className="text-2xl">🎹</span>
//           <span className="font-display text-lg tracking-wide">
//             <span className="font-bold">Guru</span>Nada
//           </span>
//         </Link>

//         {/* Desktop */}
//         <div className="hidden md:flex items-center gap-6">
//           <Link to="/" className="hover:text-brand-gold">
//             Home
//           </Link>
//           <Link to="/#features" className="hover:text-brand-gold">
//             Fitur
//           </Link>
//           <Link to="/pricing" className="hover:text-brand-gold">
//             Pricing
//           </Link>
//           <Link to="/#schedule" className="hover:text-brand-gold">
//             Jadwal
//           </Link>
//           <Link to="/#testimonials" className="hover:text-brand-gold">
//             Testimoni
//           </Link>

//           {isAdmin && (
//             <Link to="/admin" className="hover:text-brand-gold">
//               Admin
//             </Link>
//           )}

//           {user ? (
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 rounded-full border border-brand-gold text-brand-dark hover:bg-brand-gold hover:text-white transition"
//             >
//               Logout
//             </button>
//           ) : (
//             <Link
//               to="/auth"
//               className="px-4 py-2 rounded-full bg-brand-gold text-white hover:opacity-90 shadow-luxe"
//             >
//               Masuk / Daftar
//             </Link>
//           )}
//         </div>

//         {/* Mobile toggle */}
//         <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
//           ☰
//         </button>
//       </div>

//       {/* Mobile menu */}
//       {menuOpen && (
//         <div className="md:hidden bg-white/95 backdrop-blur-xs px-4 py-3 space-y-2 border-t">
//           <Link to="/" onClick={() => setMenuOpen(false)}>
//             Home
//           </Link>
//           <Link to="/#features" onClick={() => setMenuOpen(false)}>
//             Fitur
//           </Link>
//           <Link to="/pricing" onClick={() => setMenuOpen(false)}>
//             Pricing
//           </Link>
//           <Link to="/#schedule" onClick={() => setMenuOpen(false)}>
//             Jadwal
//           </Link>
//           <Link to="/#testimonials" onClick={() => setMenuOpen(false)}>
//             Testimoni
//           </Link>
//           {isAdmin && (
//             <Link to="/admin" onClick={() => setMenuOpen(false)}>
//               Admin
//             </Link>
//           )}
//           {user ? (
//             <button
//               onClick={() => {
//                 handleLogout();
//                 setMenuOpen(false);
//               }}
//             >
//               Logout
//             </button>
//           ) : (
//             <Link to="/auth" onClick={() => setMenuOpen(false)}>
//               Masuk / Daftar
//             </Link>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// }

// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false); // NEW

  // solidkan navbar saat discroll dikit
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user?.email) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("email", user.email)
          .maybeSingle();
        setIsAdmin(data?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_e, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u?.email) {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("email", u.email)
            .maybeSingle();
          setIsAdmin(data?.role === "admin");
        } else {
          setIsAdmin(false);
        }
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // di Navbar.jsx, ganti isi handleLogout
  const handleLogout = async () => {
    // arahkan ke halaman /logout agar prosedur logout yang baru dijalankan
    navigate("/logout");
  };

  const isHome = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all border-b
      ${
        isHome && !scrolled
          ? "bg-white/10 backdrop-blur-md border-white/20"
          : "bg-white/90 backdrop-blur-md border-white/40 shadow"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎹</span>
          <span className="font-display text-lg tracking-wide">
            <span className="font-bold">Guru</span>Nada
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-brand-gold">
            Home
          </Link>
          <Link to="/#features" className="hover:text-brand-gold">
            Fitur
          </Link>
          <Link to="/pricing" className="hover:text-brand-gold">
            Pricing
          </Link>
          <Link to="/#schedule" className="hover:text-brand-gold">
            Jadwal
          </Link>
          <Link to="/#testimonials" className="hover:text-brand-gold">
            Testimoni
          </Link>

          {isAdmin && (
            <Link to="/admin" className="hover:text-brand-gold">
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-brand-gold text-brand-dark hover:bg-brand-gold hover:text-white transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-full bg-brand-gold text-white hover:opacity-90 shadow-luxe"
            >
              Masuk / Daftar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xs px-4 py-3 space-y-2 border-t">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/#features" onClick={() => setMenuOpen(false)}>
            Fitur
          </Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)}>
            Pricing
          </Link>
          <Link to="/#schedule" onClick={() => setMenuOpen(false)}>
            Jadwal
          </Link>
          <Link to="/#testimonials" onClick={() => setMenuOpen(false)}>
            Testimoni
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                navigate("/logout"); // 🔽 arahkan ke /logout juga untuk mobile
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              Masuk / Daftar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
