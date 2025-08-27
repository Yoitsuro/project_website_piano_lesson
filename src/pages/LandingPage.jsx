// src/pages/LandingPage.jsx
import TypingText from "../components/TypingText";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Load slot jadwal
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("available_slots")
        .select("*")
        .order("slot_datetime", { ascending: true })
        .limit(12);
      setSlots(data || []);
      setLoadingSlots(false);
    })();
  }, []);

  // Auto-scroll saat URL punya #hash (/#features, /#schedule, /#testimonials)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  const handleBook = () => navigate("/questionnaire");

  return (
    // Dasar halaman: cream (agar tidak “menabrak” navbar)
    <div
      className="text-brand-dark bg-[#F8F6ED]"
      style={{
        fontFamily:
          '"Creato Display", system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      {/* HERO — gradien cream → putih + highlight blush tipis */}
      <section
        className="relative min-h-[68vh] flex items-center"
        style={{
          background: "linear-gradient(180deg, #F8F6ED 0%, #FFFFFF 100%)",
        }}
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(800px 300px at 20% 10%, rgba(209,167,153,0.22), transparent 60%)" /* #D1A799 */,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-10 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="headline text-4xl md:text-5xl leading-tight text-[#50553C]">
              Les Piano Privat,{" "}
              <TypingText
                words={["Elegan", "Terstruktur", "Profesional"]}
                speed={90}
                deleteSpeed={45}
                pause={1200}
              />
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Dari pemula hingga mahir—kurikulum personal, jadwal fleksibel, dan
              bimbingan profesional.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleBook}
                className="px-5 py-3 rounded-full bg-brand-gold text-white shadow-luxe hover:opacity-90"
              >
                Coba Kelas Percobaan
              </button>
              <a
                href="#features"
                className="px-5 py-3 rounded-full border border-brand-gold hover:bg-brand-gold hover:text-white transition"
              >
                Lihat Fitur
              </a>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>★</span>
                <span>Mentor 10+ tahun</span>
              </div>
              <div className="flex items-center gap-2">
                <span>♪</span>
                <span>Metode menyenangkan</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Jadwal fleksibel</span>
              </div>
            </div>
          </div>

          {/* “Mockup” kartu kelas */}
          <div className="md:justify-self-end w-full">
            <div className="rounded-2xl bg-white/90 backdrop-blur shadow-luxe border border-white/60 p-6">
              <div className="flex items-center justify-between">
                <h3
                  className="font-semibold"
                  style={{ fontFamily: '"Rockdale FREE", serif' }}
                >
                  Kelas Piano Private
                </h3>
                <span className="text-brand-gold font-semibold">Baru</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Teknik dasar, sight-reading, teori musik, & repertoire favorit
                kamu.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {["Teknik", "Teori", "Repertoar"].map((t) => (
                  <div key={t} className="rounded-xl border bg-white p-3">
                    <div className="text-sm font-medium">{t}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleBook}
                className="mt-6 w-full px-4 py-3 rounded-xl bg-brand-gold text-white hover:opacity-90"
              >
                Daftar Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="headline text-3xl text-center mb-10 text-[#50553C]">
            Kenapa Pilih Kami?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Kurikulum Personal",
                desc: "Materi disesuaikan dengan tujuan dan tempo belajar kamu.",
              },
              {
                title: "Jadwal Fleksibel",
                desc: "Pilih slot yang cocok; mudah reschedule.",
              },
              {
                title: "Persiapan Resital/Grade",
                desc: "Pendampingan menuju ujian atau pertunjukan.",
              },
              {
                title: "Pantau Progres",
                desc: "Catatan latihan & milestone tiap pertemuan.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border bg-white hover:shadow-luxe transition"
              >
                <div className="text-brand-gold text-2xl mb-3">★</div>
                <div className="font-semibold">{f.title}</div>
                <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCHEDULE — gradien putih → blush tipis agar bloknya jelas */}
      <section
        id="schedule"
        className="py-16 scroll-mt-24"
        style={{
          background:
            "linear-gradient(180deg, #FFFFFF 0%, rgba(209,167,153,0.10) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <h2 className="headline text-3xl text-[#50553C]">
              Jadwal Piano Lesson
            </h2>
            <button
              onClick={handleBook}
              className="hidden md:inline-block px-4 py-2 rounded-full border border-brand-gold hover:bg-brand-gold hover:text-white"
            >
              Isi Kuisioner & Booking
            </button>
          </div>

          {loadingSlots ? (
            <div className="text-slate-600">Memuat slot...</div>
          ) : slots.length === 0 ? (
            <div className="text-slate-600">Tidak ada slot tersedia.</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {slots.map((s) => {
                const date = new Date(s.slot_datetime);
                const readable = date.toLocaleString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl border bg-white p-4 flex flex-col justify-between ${
                      s.is_booked ? "opacity-50" : ""
                    }`}
                  >
                    <div>
                      <div className="text-sm text-slate-500">
                        Slot 45 menit
                      </div>
                      <div className="font-semibold">{readable}</div>
                    </div>
                    <button
                      disabled={s.is_booked}
                      onClick={handleBook}
                      className={`mt-4 px-4 py-2 rounded-lg ${
                        s.is_booked
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-brand-gold text-white hover:opacity-90"
                      }`}
                    >
                      {s.is_booked ? "Sudah Dibooking" : "Pilih Slot"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 md:hidden">
            <button
              onClick={handleBook}
              className="w-full px-4 py-3 rounded-full bg-brand-gold text-white"
            >
              Isi Kuisioner & Booking
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="headline text-3xl text-center mb-10 text-[#50553C]">
            Apa Kata Mereka
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                q: "Anak saya lebih percaya diri tampil di sekolah.",
                n: "— Ibu Rina",
              },
              {
                q: "Metodenya menyenangkan, anak jadi rajin latihan.",
                n: "— Pak Andi",
              },
              {
                q: "Guru sabar & profesional. Highly recommended.",
                n: "— Michelle",
              },
            ].map((t, i) => (
              <figure key={i} className="rounded-2xl border bg-white p-6">
                <blockquote className="italic text-slate-700">
                  “{t.q}”
                </blockquote>
                <figcaption className="mt-3 text-sm text-slate-600">
                  {t.n}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — wash olive tipis */}
      <section
        id="faq"
        className="py-16 scroll-mt-24"
        style={{
          background:
            "linear-gradient(180deg, rgba(80,85,60,0.06) 0%, rgba(80,85,60,0.03) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="headline text-3xl text-center mb-10 text-[#50553C]">
            Pertanyaan Umum
          </h2>
          <div className="divide-y rounded-2xl border bg-white">
            {[
              {
                q: "Apakah bisa coba kelas dulu?",
                a: "Bisa. Isi kuisioner & pilih jadwal trial, lalu unggah bukti pembayaran. Admin akan verifikasi & konfirmasi via WhatsApp.",
              },
              {
                q: "Bisa reschedule?",
                a: "Bisa, selama slot tersedia. Kamu bisa pilih slot lain dari daftar yang tidak bertanda 'Sudah Dibooking'.",
              },
              {
                q: "Metode pembayarannya apa?",
                a: "Transfer bank. Unggah bukti transfer (jpg/png/webp/pdf, max 5MB) saat submit kuisioner.",
              },
            ].map((item, i) => (
              <details key={i} className="group p-4">
                <summary className="cursor-pointer font-medium flex items-center justify-between">
                  {item.q}
                  <span className="text-brand-gold ml-4 group-open:rotate-45 transition">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — charcoal solid dari palette */}
      <section
        className="py-14 text-white"
        style={{ backgroundColor: "#272925" }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="headline text-3xl text-[#F8F6ED]">
            Siap Mulai Perjalanan Musikmu?
          </h3>
          <p className="mt-2 text-slate-300">
            Daftar trial, isi kuisioner singkat, dan pilih jadwal yang cocok.
          </p>
          <button
            onClick={handleBook}
            className="mt-6 px-6 py-3 rounded-full bg-brand-gold text-white hover:opacity-90"
          >
            Daftar Trial Sekarang
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
