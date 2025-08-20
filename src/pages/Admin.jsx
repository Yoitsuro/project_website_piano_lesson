// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setMe(user);

      let role = null;
      if (user.email) {
        const { data } = await supabase.from("users").select("role").eq("email", user.email).maybeSingle();
        role = data?.role || null;
      }
      if (!role) {
        const { data } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
        role = data?.role || null;
      }

      if (role !== "admin") {
        alert("Anda bukan admin.");
        navigate("/");
        return;
      }

      await fetchAll();
      setLoading(false);
    })();
  }, [navigate]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: pmt }, { data: bkg }, { data: slt }, { data: qst }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*"),
      supabase.from("available_slots").select("*").order("slot_datetime", { ascending: true }),
      supabase.from("questionnaire").select("*"),
    ]);
    setPayments(pmt || []);
    setBookings(bkg || []);
    setSlots(slt || []);
    setQuestionnaires(qst || []);
    setLoading(false);
  };

  const bookingsById = useMemo(() => {
    const m = new Map();
    bookings.forEach(b => m.set(b.id, b));
    return m;
  }, [bookings]);

  const slotById = useMemo(() => {
    const m = new Map();
    slots.forEach(s => m.set(s.id, s));
    return m;
  }, [slots]);

  const questionnaireByUser = useMemo(() => {
    const map = new Map();
    questionnaires
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .forEach(q => { if (!map.has(q.user_id)) map.set(q.user_id, q); });
    return map;
  }, [questionnaires]);

  const fmtWaktu = (iso) =>
    new Date(iso).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

  const verifyPayment = async (paymentId, bookingId, slotId) => {
    if (!bookingId || !slotId) {
      alert("Data booking/slot tidak lengkap.");
      return;
    }
    if (!confirm("Verifikasi pembayaran ini?")) return;

    const results = await Promise.all([
      supabase.from("payments").update({ status: "verified" }).eq("id", paymentId),
      supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId),
      supabase.from("available_slots").update({ is_booked: true }).eq("id", slotId),
    ]);
    const err = results.find(r => r.error)?.error;
    if (err) alert("Gagal verifikasi: " + err.message);
    else {
      await fetchAll();
      alert("Pembayaran terverifikasi & booking dikonfirmasi.");
    }
  };

  const rejectPayment = async (paymentId) => {
    if (!confirm("Tolak pembayaran ini?")) return;
    const { error } = await supabase.from("payments").update({ status: "rejected" }).eq("id", paymentId);
    if (error) alert("Gagal menolak: " + error.message);
    else {
      await fetchAll();
      alert("Pembayaran ditolak.");
    }
  };

  const cancelBooking = async (bookingId, slotId) => {
    if (!confirm("Batalkan booking ini dan buka kembali slot?")) return;
    const results = await Promise.all([
      supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId),
      supabase.from("available_slots").update({ is_booked: false }).eq("id", slotId),
    ]);
    const err = results.find(r => r.error)?.error;
    if (err) alert("Gagal membatalkan: " + err.message);
    else {
      await fetchAll();
      alert("Booking dibatalkan & slot dibuka.");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>

      {/* Pembayaran */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Pembayaran</h2>
          <button onClick={fetchAll} className="px-3 py-1.5 rounded border hover:bg-slate-50">Refresh</button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 border">Tanggal</th>
                <th className="p-2 border">Orang Tua</th>
                <th className="p-2 border">Anak</th>
                <th className="p-2 border">Jadwal</th>
                <th className="p-2 border">Nominal</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Bukti</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500">Belum ada pembayaran.</td>
                </tr>
              ) : payments.map((p) => {
                const b = bookingsById.get(p.booking_id);
                const s = b ? slotById.get(b.slot_id) : null;
                const q = questionnaireByUser.get(p.user_id);
                return (
                  <tr key={p.id} className="odd:bg-white even:bg-slate-50">
                    <td className="p-2 border align-top">{new Date(p.created_at).toLocaleString("id-ID")}</td>
                    <td className="p-2 border align-top">{q?.parent_name || "-"}</td>
                    <td className="p-2 border align-top">{q?.child_name || "-"}</td>
                    <td className="p-2 border align-top">
                      {s ? fmtWaktu(s.slot_datetime) : "-"}
                      <div className="text-xs text-slate-500">Booking: {b?.status || "-"}</div>
                    </td>
                    <td className="p-2 border align-top">Rp {Number(p.amount || 0).toLocaleString("id-ID")}</td>
                    <td className="p-2 border align-top">
                      <span className={
                        "inline-block px-2 py-0.5 rounded text-xs " +
                        (p.status === "verified" ? "bg-green-100 text-green-700" :
                         p.status === "rejected" ? "bg-red-100 text-red-700" :
                         "bg-yellow-100 text-yellow-700")
                      }>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2 border align-top">
                      {p.proof_url ? (
                        <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          Lihat Bukti
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-2 border align-top space-x-2">
                      <button
                        disabled={p.status === "verified" || !b?.id || !b?.slot_id}
                        onClick={() => verifyPayment(p.id, b?.id, b?.slot_id)}
                        className={`px-2 py-1 rounded ${p.status === "verified" || !b?.id || !b?.slot_id
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"}`}
                      >
                        Verifikasi
                      </button>
                      <button
                        disabled={p.status !== "pending"}
                        onClick={() => rejectPayment(p.id)}
                        className={`px-2 py-1 rounded ${p.status !== "pending"
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"}`}
                      >
                        Tolak
                      </button>
                      {b && (
                        <button
                          onClick={() => cancelBooking(b.id, b.slot_id)}
                          className="px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
                        >
                          Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Slot */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Semua Slot</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 border">Waktu</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="odd:bg-white even:bg-slate-50">
                  <td className="p-2 border">{fmtWaktu(s.slot_datetime)}</td>
                  <td className="p-2 border">{s.is_booked ? "Sudah Dibooking" : "Tersedia"}</td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-slate-500">Belum ada slot.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
