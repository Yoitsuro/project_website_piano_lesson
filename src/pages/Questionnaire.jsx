// src/pages/Questionnaire.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const ADMIN_WA = import.meta.env.VITE_WA_PHONE || "6281234567890"; // nomor telepon ganti disini
const BUCKET = "proofs";

export default function Questionnaire() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = async () => {
    setLoadingSlots(true);

    const { data, error } = await supabase
      .from("available_slots")
      .select("*")
      .gte("slot_datetime", new Date().toISOString()) // hanya slot mendatang
      .order("slot_datetime", { ascending: true });

    if (error) {
      console.error(error);
      setSlots([]); // kalau error, kosongkan list agar tidak ngegantung
    } else {
      setSlots(data || []); // simpan hasil ke state
    }

    setLoadingSlots(false); // matikan loading
  };

  const [form, setForm] = useState({
    parent_name: "",
    child_name: "",
    child_age: "",
    played_before: "no",
    playing_duration: "",
    achievements: "",
    preferred_slot_id: "",
    amount: "",
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (user) loadSlots();
  }, [user]);

  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted && user) loadSlots();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // validasi sederhana: max 5MB, gambar atau pdf
    const okType = /image\/(png|jpe?g|webp)|application\/pdf/.test(f.type);
    if (!okType) return alert("File harus gambar (png/jpg/webp) atau PDF.");
    if (f.size > 5 * 1024 * 1024) return alert("Maksimal 5MB.");
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const formatWaktu = (iso) =>
    new Date(iso).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/auth");

    if (!form.preferred_slot_id) return alert("Pilih jadwal terlebih dahulu.");
    if (!file) return alert("Unggah bukti transfer dulu.");
    if (!form.amount || Number(form.amount) <= 0)
      return alert("Nominal pembayaran tidak valid.");

    setSubmitting(true);
    try {
      // 1) Simpan kuisioner
      const { error: qErr } = await supabase
        .from("questionnaire")
        .insert([
          {
            user_id: user.id,
            parent_name: form.parent_name,
            child_name: form.child_name,
            child_age: form.child_age ? Number(form.child_age) : null,
            played_before: form.played_before === "yes",
            playing_duration: form.playing_duration,
            achievements: form.achievements || null,
            preferred_slot_id: form.preferred_slot_id,
          },
        ])
        .select("id")
        .single();

      if (qErr) throw qErr;

      // 2) Buat booking
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user.id,
            slot_id: form.preferred_slot_id,
            status: "pending",
          },
        ])
        .select("id, slot_id")
        .single();

      if (bErr) {
        if ((bErr.message || "").toLowerCase().includes("unique")) {
          alert(
            "Maaf, slot baru saja diambil orang lain. Silakan pilih slot lain."
          );
          return;
        }
        throw bErr;
      }

      // 3) Upload bukti transfer ke Storage
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);
      const proofUrl = urlData?.publicUrl;
      if (!proofUrl) throw new Error("Gagal membuat URL bukti transfer.");

      // 4) Simpan pembayaran
      const { error: pErr } = await supabase.from("payments").insert([
        {
          user_id: user.id,
          booking_id: booking.id,
          amount: Number(form.amount),
          proof_url: proofUrl,
          status: "pending",
        },
      ]);
      if (pErr) throw pErr;

      // 5) Tandai slot booked (best effort)
      await supabase
        .from("available_slots")
        .update({ is_booked: true })
        .eq("id", booking.slot_id);

      // 6) Redirect WhatsApp
      // 6) Buka WhatsApp di TAB BARU, lalu tab website balik ke home
      const slot = slots.find((s) => s.id === booking.slot_id);
      const when = slot ? formatWaktu(slot.slot_datetime) : "(lihat dashboard)";
      const text = encodeURIComponent(
        `Halo Admin, saya ${form.parent_name} (email: ${
          user.email
        }) sudah mendaftar trial piano untuk ${
          form.child_name
        }.\nPilihan jadwal: ${when} (45 menit).\nNominal: Rp ${Number(
          form.amount
        ).toLocaleString(
          "id-ID"
        )}.\nMohon verifikasi pembayaran ya. Terima kasih!`
      );
      const waUrl = `https://wa.me/${ADMIN_WA}?text=${text}`;

      const win = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        // popup diblokir → pakai fallback
        window.location.href = waUrl;
        return;
      }

      // kembalikan tab website ke landing + refresh ringan agar state bersih
      navigate("/", { replace: true });
      setTimeout(() => window.location.reload(), 50);
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal mengirim kuisioner.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Kuisioner Siswa & Booking Jadwal
      </h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Data Orang Tua & Anak */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm">Nama Orang Tua</span>
            <input
              name="parent_name"
              className="mt-1 w-full border rounded p-2"
              value={form.parent_name}
              onChange={onChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm">Nama Anak</span>
            <input
              name="child_name"
              className="mt-1 w-full border rounded p-2"
              value={form.child_name}
              onChange={onChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm">Usia Anak</span>
            <input
              type="number"
              name="child_age"
              className="mt-1 w-full border rounded p-2"
              value={form.child_age}
              onChange={onChange}
              min="1"
            />
          </label>

          <label className="block">
            <span className="text-sm">Pernah bermain piano?</span>
            <select
              name="played_before"
              className="mt-1 w-full border rounded p-2"
              value={form.played_before}
              onChange={onChange}
            >
              <option value="no">Belum</option>
              <option value="yes">Sudah</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Lama bermain (jika sudah)</span>
            <select
              name="playing_duration"
              className="mt-1 w-full border rounded p-2"
              value={form.playing_duration}
              onChange={onChange}
            >
              <option value="">Pilih...</option>
              <option value="< 6 bulan">&lt; 6 bulan</option>
              <option value="1-2 tahun">1–2 tahun</option>
              <option value="3+ tahun">3+ tahun</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Prestasi (opsional)</span>
            <textarea
              name="achievements"
              className="mt-1 w-full border rounded p-2"
              value={form.achievements}
              onChange={onChange}
              rows={3}
              placeholder="Contoh: Juara 1 lomba piano tingkat provinsi, dsb."
            />
          </label>
        </div>

        {/* Jadwal & Pembayaran */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm">Pilih Jadwal</span>
            {loadingSlots ? (
              <div className="mt-2 text-slate-600">Memuat slot…</div>
            ) : slots.length === 0 ? (
              <div className="mt-2 text-slate-600">
                Belum ada slot tersedia.
              </div>
            ) : (
              <select
                name="preferred_slot_id"
                className="mt-1 w-full border rounded p-2"
                value={form.preferred_slot_id}
                onChange={onChange}
                required
              >
                <option value="">Pilih slot…</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.is_booked}>
                    {formatWaktu(s.slot_datetime)} (45 menit)
                    {s.is_booked ? " — (Penuh)" : ""}
                  </option>
                ))}
              </select>
            )}
          </label>

          {/* Catatan kecil jadwal */}
          <p className="mt-1 text-xs text-slate-500">
            Catatan: Sesi 45 menit. Tersedia Senin–Jumat pukul 14.00, 15.00,
            16.00, 17.00, dan 18.00 WIB.
          </p>

          <label className="block">
            <span className="text-sm">Nominal Pembayaran (Rp)</span>
            <input
              type="number"
              name="amount"
              className="mt-1 w-full border rounded p-2"
              value={form.amount}
              onChange={onChange}
              min="1"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm">
              Unggah Bukti Transfer (jpg/png/webp/pdf, max 5MB)
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="mt-1 w-full"
              onChange={onFile}
              required
            />
          </label>

          {filePreview && (
            <div className="mt-2">
              <span className="text-sm block mb-1">Preview:</span>
              {/* preview hanya untuk gambar */}
              {file?.type?.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="preview"
                  className="max-h-48 rounded border"
                />
              ) : (
                <div className="text-slate-600 text-sm">{file?.name} (PDF)</div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loadingSlots}
            className="w-full bg-brand-gold text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Mengirim…" : "Kirim Kuisioner & Booking"}
          </button>

          <p className="text-xs text-slate-500">
            Setelah submit, kamu akan diarahkan ke WhatsApp Admin untuk
            konfirmasi.
          </p>
        </div>
      </form>
    </div>
  );
}
