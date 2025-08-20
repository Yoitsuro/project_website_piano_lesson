// src/pages/Pricing.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const BASE_PRICE = 149_500;          // Rp 149.500 / bulan (termasuk kamu)
const ADDL_PER_TEACHER = 49_000;     // Rp 49.000 per tambahan pengajar/staf
const MIN = 1;
const MAX = 20;

const rp = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function Pricing() {
  const [count, setCount] = useState(1);
  const clamp = (v) => Math.min(MAX, Math.max(MIN, v));
  const total = BASE_PRICE + ADDL_PER_TEACHER * (count - 1);

  return (
    <div className="font-sans text-brand-dark">
      {/* HERO – samakan nuansa dengan LandingPage */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-soft to-white"></div>
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(900px 340px at 20% 10%, rgba(212,175,55,0.22), transparent 60%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Harga sederhana, all-in-one untuk <span className="font-bold">Guru</span>Nada
          </h1>
          <p className="mt-4 text-lg text-slate-700">
            Harga transparan yang tumbuh sesuai kebutuhanmu — <span className="font-semibold">tanpa biaya tersembunyi</span>.
          </p>
        </div>
      </section>

      {/* KARTU HARGA */}
      <section className="relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-luxe p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Kolom kiri: info harga dasar */}
              <div className="text-left">
                <div className="text-3xl md:text-4xl font-bold">{rp(BASE_PRICE)}</div>
                <div className="text-slate-600">/bulan <span className="text-xs">(termasuk kamu sendiri)</span></div>
                <div className="mt-3 text-slate-600 text-sm">
                  + {rp(ADDL_PER_TEACHER)} <span>per tambahan pengajar/staf</span>
                </div>

                <Link
                  to="/questionnaire"
                  className="inline-flex mt-6 px-5 py-3 rounded-full bg-brand-gold text-white hover:opacity-90 shadow-luxe"
                >
                  Mulai sekarang
                </Link>
              </div>

              {/* Kolom kanan: kontrol jumlah & total */}
              <div className="text-left md:text-right">
                <label className="block text-sm text-slate-600 mb-2">
                  Jumlah pengajar & staf (termasuk kamu):
                </label>

                <input
                  type="range"
                  min={MIN}
                  max={MAX}
                  value={count}
                  onChange={(e) => setCount(clamp(parseInt(e.target.value || "1", 10)))}
                  className="w-full accent-brand-gold"
                />

                <div className="mt-3 flex items-center justify-start md:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCount((c) => clamp(c - 1))}
                    className="w-12 h-12 rounded-xl border hover:bg-slate-50 text-xl"
                    aria-label="Kurangi"
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min={MIN}
                    max={MAX}
                    value={count}
                    onChange={(e) => setCount(clamp(parseInt(e.target.value || "1", 10)))}
                    className="w-16 h-12 rounded-xl border text-center text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setCount((c) => clamp(c + 1))}
                    className="w-12 h-12 rounded-xl border hover:bg-slate-50 text-xl"
                    aria-label="Tambah"
                  >
                    +
                  </button>
                </div>

                <div className="mt-4 text-slate-700">
                  Total per bulan: <span className="font-semibold">{rp(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR TERMASUK */}
      <section className="py-16 bg-gradient-to-b from-white to-brand-soft/40">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl text-center mb-10">Semua Fitur Termasuk</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "Manajemen Siswa", d: "Data & komunikasi terpusat." },
              { t: "Jadwal & Kehadiran", d: "Kelola jadwal, catat kehadiran." },
              { t: "Pembayaran Online", d: "Tagihan dan pembayaran lebih mudah." },
              { t: "Catatan & Progress", d: "Pantau perkembangan tiap pertemuan." },
              { t: "Materi Belajar", d: "Bagikan file & materi latihan." },
              { t: "Laporan & Ekspor", d: "Ringkasan untuk administrasi." },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-6 border bg-white hover:shadow-luxe transition">
                <div className="text-brand-gold text-2xl mb-2">★</div>
                <div className="font-semibold">{f.t}</div>
                <p className="text-sm text-slate-600 mt-1">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ sederhana */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <details className="rounded-xl border bg-white p-4">
            <summary className="font-medium cursor-pointer">Apakah ada biaya tersembunyi?</summary>
            <p className="mt-2 text-slate-600 text-sm">Tidak ada. Harga hanya bertambah sesuai jumlah pengajar/staf.</p>
          </details>
          <details className="rounded-xl border bg-white p-4">
            <summary className="font-medium cursor-pointer">Bisakah saya mengubah jumlah pengajar kapan saja?</summary>
            <p className="mt-2 text-slate-600 text-sm">Bisa. Kamu bisa menambah/mengurangi kapan pun.</p>
          </details>
          <details className="rounded-xl border bg-white p-4">
            <summary className="font-medium cursor-pointer">Apakah ada kontrak minimum?</summary>
            <p className="mt-2 text-slate-600 text-sm">Tidak ada kontrak minimum.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
