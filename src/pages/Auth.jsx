// // src/pages/Auth.jsx
// // helper: pastikan baris di public.users ada & sync dengan auth.uid()
// async function ensureUserRow(supabase, { id, email }, name) {
//   const payload = { id, email };
//   if (name && name.trim()) payload.name = name.trim();

//   const { error } = await supabase
//     .from("users")
//     .upsert(payload, { onConflict: "email" }); // jika email sudah ada, update

//   if (error) {
//     console.error("upsert users error:", error);
//   }
// }

// import React, { useState, useEffect } from "react";
// import { supabase } from "../lib/supabaseClient";
// import { useNavigate, useLocation } from "react-router-dom";

// export default function Auth() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [loading, setLoading] = useState(false);
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [notice, setNotice] = useState("");
//   const [emailSent, setEmailSent] = useState(false);

//   // Jika sudah login, lempar ke beranda
//   useEffect(() => {
//     (async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (user) navigate("/");
//     })();
//   }, [navigate]);

//   // Setelah klik link verifikasi -> tampilkan notifikasi
//   useEffect(() => {
//     const q = new URLSearchParams(location.search);
//     if (q.get("confirmed") === "1") {
//       supabase.auth.getSession().then(({ data: { session } }) => {
//         if (session) navigate("/");
//         else setNotice("Email kamu sudah terverifikasi. Silakan login.");
//       });
//     }
//   }, [location.search, navigate]);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((s) => ({ ...s, [name]: value }));
//   };

//   // Pastikan baris user ada di table `users` (sinkron ID/email) setelah LOGIN
//   const ensureUserRow = async () => {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     if (!user?.email || !user?.id) return;

//     try {
//       const { data: existing } = await supabase
//         .from("users")
//         .select("id, role")
//         .eq("email", user.email)
//         .maybeSingle();

//       if (!existing) {
//         await supabase
//           .from("users")
//           .insert([{ id: user.id, email: user.email, role: "user" }]);
//       } else if (existing.id !== user.id) {
//         await supabase
//           .from("users")
//           .update({ id: user.id })
//           .eq("email", user.email);
//       }
//     } catch (e) {
//       // biarkan silent; bukan error fatal untuk login
//       console.warn("Sync users warning:", e.message);
//     }
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (isSignUp) {
//         // SIGN UP + kirim email verifikasi (redirect balik ke /auth?confirmed=1)
//         const { error } = await supabase.auth.signUp({
//           email: form.email,
//           password: form.password,
//           options: {
//             emailRedirectTo: `${window.location.origin}/auth?confirmed=1`,
//           },
//         });
//         if (error) throw error;
//         setEmailSent(true);
//         alert("Akun dibuat! Cek email untuk verifikasi.");
//       } else {
//         // LOGIN
//         const { error } = await supabase.auth.signInWithPassword({
//           email: form.email,
//           password: form.password,
//         });
//         if (error) {
//           if (/email not confirmed/i.test(error.message)) {
//             alert(
//               "Email belum terverifikasi. Cek inbox/spam kamu, lalu klik link verifikasi."
//             );
//           } else {
//             alert(error.message);
//           }
//           return;
//         }
//         await ensureUserRow();
//         navigate("/");
//       }
//     } catch (err) {
//       alert(err.message || "Terjadi kesalahan");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (!form.email) return alert("Isi email dulu.");
//     const { error } = await supabase.auth.resend({
//       type: "signup",
//       email: form.email,
//     });
//     if (error) return alert(error.message);
//     alert("Email verifikasi dikirim ulang. Cek inbox/spam.");
//   };

//   const handleForgot = async () => {
//     if (!form.email) return alert("Isi email yang terdaftar dahulu.");
//     const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
//       redirectTo: `${window.location.origin}/auth?reset=1`,
//     });
//     if (error) return alert(error.message);
//     alert("Tautan reset password telah dikirim ke email kamu.");
//   };

//   return (
//     <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
//       <div className="w-full max-w-md rounded-2xl border bg-white shadow-luxe overflow-hidden">
//         {/* Header gradient + wave */}
//         <div className="relative h-32 bg-gradient-to-tr from-brand-dark to-brand-gold text-white flex items-center justify-center">
//           <div className="text-center">
//             <div className="text-sm/none opacity-90 tracking-wide">
//               Selamat datang di
//             </div>
//             <div className="font-display text-2xl font-semibold">
//               Guru<span className="font-light">Nada</span>
//             </div>
//           </div>

//           {/* wave putih di bawah header */}
//           <svg
//             className="absolute -bottom-[1px] left-0 w-full"
//             viewBox="0 0 1440 90"
//             preserveAspectRatio="none"
//           >
//             <path
//               fill="#fff"
//               d="M0,64L60,58.7C120,53,240,43,360,42.7C480,43,600,53,720,64C840,75,960,85,1080,80C1200,75,1320,53,1380,42.7L1440,32L1440,90L1380,90C1320,90,1200,90,1080,90C960,90,840,90,720,90C600,90,480,90,360,90C240,90,120,90,60,90L0,90Z"
//             ></path>
//           </svg>
//         </div>

//         {/* Body */}
//         <div className="p-6">
//           {notice && (
//             <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
//               {notice}
//             </div>
//           )}

//           <h1 className="text-2xl font-bold mb-1">
//             {isSignUp ? "Buat Akun" : "Welcome back!"}
//           </h1>
//           <p className="text-slate-500 mb-6">
//             {isSignUp
//               ? "Daftar untuk mulai booking kelas."
//               : "Masuk untuk mengelola jadwal & booking."}
//           </p>

//           <form onSubmit={onSubmit} className="space-y-4">
//             <label className="block">
//               <span className="text-sm text-slate-600">Email</span>
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="nama@email.com"
//                 value={form.email}
//                 onChange={onChange}
//                 required
//                 className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-gold/60"
//               />
//             </label>

//             <label className="block">
//               <span className="text-sm text-slate-600">Password</span>
//               <div className="mt-1 relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   placeholder="••••••••"
//                   value={form.password}
//                   onChange={onChange}
//                   required
//                   className="w-full border rounded-lg p-3 pr-12 outline-none focus:ring-2 focus:ring-brand-gold/60"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((v) => !v)}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm px-2"
//                   aria-label={
//                     showPassword ? "Sembunyikan password" : "Tampilkan password"
//                   }
//                 >
//                   {showPassword ? "🙈" : "👁️"}
//                 </button>
//               </div>
//             </label>

//             {!isSignUp && (
//               <div className="flex items-center justify-between text-sm">
//                 <label className="flex items-center gap-2 text-slate-600 select-none">
//                   <input
//                     type="checkbox"
//                     className="rounded border-slate-300"
//                     defaultChecked
//                   />
//                   Remember me
//                 </label>
//                 <button
//                   type="button"
//                   onClick={handleForgot}
//                   className="text-brand-dark hover:underline"
//                 >
//                   Lupa password?
//                 </button>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-brand-gold text-white px-4 py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
//             >
//               {loading ? "Memproses..." : isSignUp ? "Daftar" : "Log In"}
//             </button>
//           </form>

//           {/* Resend hint setelah sign up */}
//           {isSignUp && emailSent && (
//             <div className="mt-3 text-sm text-slate-600">
//               Belum menerima email verifikasi?{" "}
//               <button
//                 onClick={handleResend}
//                 className="text-brand-dark underline"
//               >
//                 Kirim ulang
//               </button>
//             </div>
//           )}

//           <div className="mt-6 text-center text-sm">
//             {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
//             <button
//               onClick={() => {
//                 setIsSignUp(!isSignUp);
//                 setNotice("");
//               }}
//               className="text-brand-dark underline"
//             >
//               {isSignUp ? "Login di sini" : "Daftar di sini"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/Auth.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Pastikan baris di public.users ada & sinkron dengan auth.uid()
 * - Jika belum ada: insert (id, email, name)
 * - Jika sudah ada tapi id beda (warisan data lama): update id
 */
async function ensureUserRow(sb, { id, email }, name) {
  const payload = { id, email };
  if (name && name.trim()) payload.name = name.trim();

  // paksa DB mengembalikan baris yang di-upsert, supaya ketahuan statusnya
  const { data, error, status } = await sb
    .from("users")
    .upsert(payload, { onConflict: "email" })
    .select("id, email, name, role")
    .single();

  if (error) {
    console.error("upsert users error:", { error, status, payload });
  } else {
    console.log("users upsert OK:", data);
  }
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // tambahkan name agar bisa disimpan saat Sign Up
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [notice, setNotice] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Jika sudah login, lempar ke beranda
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) navigate("/");
    })();
  }, [navigate]);

  // Load slot jadwal
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("available_slots")
        .select("*")
        .order("slot_datetime", { ascending: true })
        .limit(12);

      if (error) {
        console.error("load slots error:", error);
      }
      if (!cancelled) {
        setSlots(data || []);
        setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Setelah klik link verifikasi -> tampilkan notifikasi
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("confirmed") === "1") {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate("/");
        else setNotice("Email kamu sudah terverifikasi. Silakan login.");
      });
    }
  }, [location.search, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // SIGN UP - SUPABASE LOGIC
      if (isSignUp) {
        // SIGN UP + kirim email verifikasi (redirect balik ke /auth?confirmed=1)
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name || "" }, // simpan nama ke metadata auth
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        // ⚠️ Hanya upsert jika user langsung punya session (confirm-email OFF).
        if (data?.session && data?.user) {
          await ensureUserRow(supabase, data.user, form.name);
          navigate("/");
        } else {
          setEmailSent(true);
          alert("Akun dibuat! Cek email verifikasi, lalu login.");
        }
        return; // penting: stop di sini
      } else {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) {
          if (/email not confirmed/i.test(error.message)) {
            alert(
              "Email belum terverifikasi. Cek inbox/spam kamu, lalu klik link verifikasi."
            );
          } else {
            alert(error.message);
          }
          return;
        }

        // Pastikan token sudah siap sebelum upsert
        await supabase.auth.getSession();

        // Setelah login, pastikan row users tersinkron
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const nameFromMeta = user?.user_metadata?.name || undefined;
        if (user) await ensureUserRow(supabase, user, nameFromMeta);

        navigate("/");
      }
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!form.email) return alert("Isi email dulu.");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: form.email,
    });
    if (error) return alert(error.message);
    alert("Email verifikasi dikirim ulang. Cek inbox/spam.");
  };

  const handleForgot = async () => {
    if (!form.email) return alert("Isi email yang terdaftar dahulu.");
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth?reset=1`,
    });
    if (error) return alert(error.message);
    alert("Tautan reset password telah dikirim ke email kamu.");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-luxe overflow-hidden">
        {/* Header gradient + wave */}
        <div className="relative h-32 bg-gradient-to-tr from-brand-dark to-brand-gold text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm/none opacity-90 tracking-wide">
              Selamat datang di
            </div>
            <div className="font-display text-2xl font-semibold">
              Guru<span className="font-light">Nada</span>
            </div>
          </div>
          <svg
            className="absolute -bottom-[1px] left-0 w-full"
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
          >
            <path
              fill="#fff"
              d="M0,64L60,58.7C120,53,240,43,360,42.7C480,43,600,53,720,64C840,75,960,85,1080,80C1200,75,1320,53,1380,42.7L1440,32L1440,90L1380,90C1320,90,1200,90,1080,90C960,90,840,90,720,90C600,90,480,90,360,90C240,90,120,90,60,90L0,90Z"
            ></path>
          </svg>
        </div>

        {/* Body */}
        <div className="p-6">
          {notice && (
            <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
              {notice}
            </div>
          )}

          <h1 className="text-2xl font-bold mb-1">
            {isSignUp ? "Buat Akun" : "Welcome back!"}
          </h1>
          <p className="text-slate-500 mb-6">
            {isSignUp
              ? "Daftar untuk mulai booking kelas."
              : "Masuk untuk mengelola jadwal & booking."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {isSignUp && (
              <label className="block">
                <span className="text-sm text-slate-600">Nama</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Nama lengkap"
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-gold/60"
                />
              </label>
            )}

            <label className="block">
              <span className="text-sm text-slate-600">Email</span>
              <input
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={onChange}
                required
                className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-gold/60"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-600">Password</span>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  required
                  className="w-full border rounded-lg p-3 pr-12 outline-none focus:ring-2 focus:ring-brand-gold/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm px-2"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600 select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    defaultChecked
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-brand-dark hover:underline"
                >
                  Lupa password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold text-white px-4 py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Memproses..." : isSignUp ? "Daftar" : "Log In"}
            </button>
          </form>

          {/* Resend hint setelah sign up */}
          {isSignUp && emailSent && (
            <div className="mt-3 text-sm text-slate-600">
              Belum menerima email verifikasi?{" "}
              <button
                onClick={handleResend}
                className="text-brand-dark underline"
              >
                Kirim ulang
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setNotice("");
              }}
              className="text-brand-dark underline"
            >
              {isSignUp ? "Login di sini" : "Daftar di sini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
