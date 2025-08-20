// src/pages/Questionnaire.jsx (English version with Day/Time selectors)
// Tweaks: remove placeholders for Gender/Day/Time, auto defaults, modern UI

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const ADMIN_WA = import.meta.env.VITE_WA_PHONE || "6281234567890";
const BUCKET = "proofs";

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

// ---------- UI ----------
// Field putih murni + border 2px + shadow lembut + ring saat fokus
const fieldInput =
  "w-full rounded-xl bg-white border-2 border-slate-200/80 px-4 py-3 " +
  "placeholder-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)] " +
  "focus:outline-none focus:border-amber-400 focus:ring-4 " +
  "focus:ring-amber-200/60 transition";

const fieldSelect =
  "w-full rounded-xl bg-white border-2 border-slate-200/80 px-4 h-11 " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none " +
  "focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60 transition";

// Panel (card) untuk tiap section agar kontras jelas
const panelClass =
  "rounded-2xl bg-[#FFF7EC] ring-1 ring-[#E8E0CC] " +
  "shadow-[0_8px_24px_rgba(16,24,40,0.06)] p-6 md:p-8";

// Label yang lebih tegas & rapi
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const formatIDRDisplay = (n) => {
  const num = Number(n || 0);
  const base = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(num);
  return `Rp ${base},-`;
};

function timeOptions(day) {
  const slots = [];
  let startHour, endHour;
  if (day === "saturday") {
    startHour = 9; // 09:00
    endHour = 14; // 14:00
  } else {
    startHour = 13; // 13:00
    endHour = 18; // 18:00
  }
  for (let h = startHour; h <= endHour; h++) {
    const hh = String(h).padStart(2, "0");
    slots.push({ value: `${hh}:00`, label: `${hh}:00` });
  }
  return slots;
}

const EXAM_TYPES = ["ABRSM", "LCM", "Trinity", "Other"];
const EXAM_GRADES = ["Preparatory", "1", "2", "3", "4", "5", "6", "7", "8"];

export default function Questionnaire() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Main form state
  const [form, setForm] = useState({
    // Student
    student_full_name: "",
    student_gender: "male", // default (no placeholder)
    student_dob: "",
    student_age: "", // auto computed
    student_address: "",
    student_phone: "",
    student_email: "",
    student_instagram: "",

    // Parents
    father_name: "",
    father_phone: "",
    mother_name: "",
    mother_phone: "",
    parents_email: "",
    parents_instagram: "",

    // Instrument & schedule
    instrument: "Piano",
    preferred_day: "monday", // default (no placeholder)
    preferred_time: "", // will be set based on day
    learned_before: "no", // yes/no
    learned_duration: "", // NEW: will hold dropdown value
    took_exam_before: "no", // yes/no
    exam_type: "", // NEW: auto when took_exam_before=yes
    exam_grade: "", // NEW: auto when took_exam_before=yes

    // Payment
    teacher_type: "junior", // NEW: junior | senior
    amount: "1000000", // NEW: auto by teacher_type (readOnly)
  });

  // Load auth
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return navigate("/auth");
      setUser(data.user);
    })();
  }, [navigate]);

  // Initialize preferred_time based on default day; keep it in sync when day changes
  const timeOpts = useMemo(
    () => timeOptions(form.preferred_day),
    [form.preferred_day]
  );
  useEffect(() => {
    // if current time not valid or empty, set to first slot of the day
    if (
      !form.preferred_time ||
      !timeOpts.some((t) => t.value === form.preferred_time)
    ) {
      setForm((s) => ({ ...s, preferred_time: timeOpts[0]?.value || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.preferred_day, timeOpts]);

  // Auto compute age from dob
  useEffect(() => {
    if (!form.student_dob) return;
    const dob = new Date(form.student_dob);
    if (isNaN(dob)) return;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    setForm((s) => ({ ...s, student_age: String(Math.max(age, 0)) }));
  }, [form.student_dob]);

  // NEW: default for learned_duration when user has learned before
  useEffect(() => {
    if (form.learned_before === "yes" && !form.learned_duration) {
      setForm((s) => ({ ...s, learned_duration: "< 6 months" }));
    }
    if (form.learned_before === "no") {
      setForm((s) => ({ ...s, learned_duration: "" }));
    }
  }, [form.learned_before]);

  // NEW: default exam board/grade when user has taken exam before
  useEffect(() => {
    if (form.took_exam_before === "yes") {
      setForm((s) => ({
        ...s,
        exam_type: s.exam_type || "ABRSM",
        exam_grade: s.exam_grade || "Preparatory",
      }));
    } else {
      setForm((s) => ({ ...s, exam_type: "", exam_grade: "" }));
    }
  }, [form.took_exam_before]);

  // NEW: keep amount synced with teacher_type
  useEffect(() => {
    const price = form.teacher_type === "senior" ? 2000000 : 1000000;
    setForm((s) => ({ ...s, amount: String(price) }));
  }, [form.teacher_type]);

  const isValid = useMemo(() => {
    const amt = Number(form.amount);
    return (
      !!form.student_full_name &&
      !!form.student_gender &&
      !!form.student_dob &&
      !!form.student_phone &&
      !!form.instrument &&
      !!form.preferred_day &&
      !!form.preferred_time &&
      !!file &&
      Number.isFinite(amt) &&
      amt > 0
    );
  }, [form, file]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return alert("Max file size is 10MB.");
    if (!/(image|pdf)/.test(f.type)) return alert("Only image or PDF allowed.");
    setFile(f);
  };

  const rupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(n || 0);

  async function uploadProof(userId) {
    const ext = file?.name?.split(".").pop() || "dat";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      contentType: file?.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return pub.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return navigate("/auth");
    if (!isValid)
      return alert(
        "Please complete all required fields and upload the proof of payment."
      );

    setSubmitting(true);
    try {
      const proofUrl = await uploadProof(user.id);

      // Store extended answers in questionnaire.extra (JSONB)
      // Store answers persis ke kolom baru di tabel `questionnaire`
      const payload = {
        user_id: user.id,

        // Student
        student_full_name: form.student_full_name,
        student_gender: form.student_gender, // "male" | "female"
        student_dob: form.student_dob, // YYYY-MM-DD
        student_address: form.student_address || null,
        student_phone: form.student_phone,
        student_email: form.student_email || null,
        student_instagram: form.student_instagram || null,

        // Parents
        father_name: form.father_name || null,
        father_phone: form.father_phone || null,
        mother_name: form.mother_name || null,
        mother_phone: form.mother_phone || null,
        parents_email: form.parents_email || null,
        parents_instagram: form.parents_instagram || null,

        // Instrument & Schedule
        instrument: form.instrument,
        preferred_day: form.preferred_day, // "monday" | ... | "saturday"
        preferred_time: form.preferred_time, // "13:00" dst
        learned_before: form.learned_before === "yes", // -> boolean
        learned_duration: form.learned_duration || null, // "< 6 months" | "1–3 years" | "> 3 years" | null
        took_exam_before: form.took_exam_before === "yes",
        exam_type: form.took_exam_before === "yes" ? form.exam_type : null,
        exam_grade: form.took_exam_before === "yes" ? form.exam_grade : null,

        // Payment info (hanya untuk catatan di questionnaire; pembayaran tetap dicatat di tabel payments)
        teacher_type: form.teacher_type, // "junior" | "senior"
        amount: Number(form.amount),

        // OPTIONAL: hapus `extra` kalau tidak ingin simpan JSON
        extra: {
          preferred: { day: form.preferred_day, time: form.preferred_time },
        },
      };

      const { data: q, error: qErr } = await supabase
        .from("questionnaire")
        .insert([payload])
        .select()
        .single();
      if (qErr) throw qErr;

      // Optional booking request (requested_day/time columns are optional)
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user.id,
            status: "pending",
            requested_day: form.preferred_day,
            requested_time: form.preferred_time,
          },
        ])
        .select()
        .single();
      if (bErr)
        console.warn("[Optional] booking insert warning:", bErr.message);

      const { error: pErr } = await supabase.from("payments").insert([
        {
          user_id: user.id,
          booking_id: booking?.id || null,
          amount: Number(form.amount), // fixed by teacher_type
          proof_url: proofUrl,
          status: "pending",
        },
      ]);
      if (pErr) throw pErr;

      const msg =
        `Hello Admin, I have completed the questionnaire and uploaded the payment proof.\n` +
        `Student: ${form.student_full_name} (Age ${form.student_age})\n` +
        `Instrument: ${form.instrument}\n` +
        `Preferred schedule: ${form.preferred_day}, ${form.preferred_time}\n` +
        `Teacher: ${form.teacher_type === "senior" ? "Senior" : "Junior"}\n` + // NEW
        `Amount: ${formatIDRDisplay(form.amount)}\n` +
        `Proof: ${proofUrl}`;

      window.location.href = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(
        msg
      )}`;
    } catch (err) {
      console.error(err);
      alert(err.message || "Submit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Student Questionnaire & Booking
        </h1>
        <p className="text-slate-600">
          Please fill in the information below to help us understand your needs
          and schedule your lessons.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Info */}
        <section className={panelClass}>
          <h2 className="text-xl font-medium mb-4">Student Information</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className={labelClass}>Student's Full Name</label>
              <input
                name="student_full_name"
                className={fieldInput} // UPDATED
                value={form.student_full_name}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                name="student_gender"
                className={fieldSelect} // UPDATED
                value={form.student_gender}
                onChange={onChange}
                required
              >
                {/* no placeholder; defaults to male */}
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                name="student_dob"
                className={fieldInput} // UPDATED
                value={form.student_dob}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Age (auto)</label>
              <input
                readOnly
                className={`${fieldInput} bg-gray-50`} // UPDATED
                value={form.student_age}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <input
                name="student_address"
                className={fieldInput} // UPDATED
                value={form.student_address}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                name="student_phone"
                className={fieldInput} // UPDATED
                value={form.student_phone}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                name="student_email"
                className={fieldInput} // UPDATED
                value={form.student_email}
                onChange={onChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Instagram</label>
              <input
                name="student_instagram"
                className={fieldInput} // UPDATED
                value={form.student_instagram}
                onChange={onChange}
              />
            </div>
          </div>
        </section>

        {/* Parents */}
        <section className={panelClass}>
          <h2 className="text-xl font-medium mb-4">Parents Information</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className={labelClass}>Father's Name</label>
              <input
                name="father_name"
                className={fieldInput} // UPDATED
                value={form.father_name}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={labelClass}>Father's Contact Number</label>
              <input
                name="father_phone"
                className={fieldInput} // UPDATED
                value={form.father_phone}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={labelClass}>Mother's Name</label>
              <input
                name="mother_name"
                className={fieldInput} // UPDATED
                value={form.mother_name}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={labelClass}>Mother's Contact Number</label>
              <input
                name="mother_phone"
                className={fieldInput} // UPDATED
                value={form.mother_phone}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={labelClass}>Parent's E-mail</label>
              <input
                type="email"
                name="parents_email"
                className={fieldInput} // UPDATED
                value={form.parents_email}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={labelClass}>Parent's Instagram</label>
              <input
                name="parents_instagram"
                className={fieldInput} // UPDATED
                value={form.parents_instagram}
                onChange={onChange}
              />
            </div>
          </div>
        </section>

        {/* Instrument & Schedule */}
        <section className={panelClass}>
          <h2 className="text-xl font-medium mb-4">Instrument & Schedule</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className={labelClass}>Instrument</label>
              <select
                name="instrument"
                className={fieldSelect} // UPDATED
                value={form.instrument}
                onChange={onChange}
              >
                {[
                  "Piano",
                  "Violin",
                  "Cello",
                  "Vocal",
                  "Drum/Percussion",
                  "Digital Music Producing",
                ].map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Preferable Day</label>
              <select
                name="preferred_day"
                className={fieldSelect} // UPDATED
                value={form.preferred_day}
                onChange={onChange}
                required
              >
                {/* no placeholder; defaults to monday */}
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Preferable Time</label>
              <select
                name="preferred_time"
                className={fieldSelect} // UPDATED
                value={form.preferred_time}
                onChange={onChange}
                required
              >
                {/* no placeholder; auto-filled based on day */}
                {timeOpts.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Mon–Fri: 13:00–18:00 • Sat: 09:00–14:00 (1-hour sessions)
              </p>
            </div>
            <div>
              <label className={labelClass}>Have you learned before?</label>
              <select
                name="learned_before"
                className={fieldSelect} // UPDATED
                value={form.learned_before}
                onChange={onChange}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {form.learned_before === "yes" && (
              <div>
                <label className={labelClass}>If yes, how long?</label>
                {/* NEW: dropdown instead of free text */}
                <select
                  name="learned_duration"
                  className={fieldSelect}
                  value={form.learned_duration}
                  onChange={onChange}
                >
                  <option value="< 6 months">&lt; 6 months</option>
                  <option value="1–3 years">1–3 years</option>
                  <option value="> 3 years">&gt; 3 years</option>
                </select>
              </div>
            )}
            <div>
              <label className={labelClass}>
                Have you taken an exam before?
              </label>
              <select
                name="took_exam_before"
                className={fieldSelect} // UPDATED
                value={form.took_exam_before}
                onChange={onChange}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {form.took_exam_before === "yes" && (
              <>
                <div>
                  <label className={labelClass}>Which exam?</label>
                  <select
                    name="exam_type"
                    className={fieldSelect} // UPDATED: no placeholder
                    value={form.exam_type}
                    onChange={onChange}
                  >
                    {EXAM_TYPES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Exam Grade</label>
                  <select
                    name="exam_grade"
                    className={fieldSelect} // UPDATED: no placeholder
                    value={form.exam_grade}
                    onChange={onChange}
                  >
                    {EXAM_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Payment & Proof */}
        <section className={panelClass}>
          <h2 className="text-xl font-medium mb-4">Payment</h2>

          {/* NEW: Choose teacher type */}
          <div className="mb-4">
            <label className={labelClass}>Choose Teacher</label>
            <div className="flex flex-wrap gap-6 md:justify-center">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="teacher_type"
                  value="junior"
                  checked={form.teacher_type === "junior"}
                  onChange={onChange}
                  className="radio"
                />
                <span>Junior Teacher (Rp1.000.000)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="teacher_type"
                  value="senior"
                  checked={form.teacher_type === "senior"}
                  onChange={onChange}
                  className="radio"
                />
                <span>Senior Teacher (Rp2.000.000)</span>
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 md:items-center gap-6">
            <div>
              <label className="block text-sm mb-1">Amount (IDR)</label>
              <input
                name="amount_display"
                type="text"
                className={`${fieldInput} cursor-not-allowed`}
                value={formatIDRDisplay(form.amount)}
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">
                Amount is set automatically based on teacher selection.
              </p>
            </div>
            <div>
              <label className={labelClass}>
                Upload Payment Proof (image/PDF)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={onFile}
                className="file-input file-input-bordered file-input-lg 
             border-2 border-slate-200/80 bg-white
             shadow-[0_1px_2px_rgba(0,0,0,0.04)]
             focus:outline-none focus:border-amber-400
             focus:ring-4 focus:ring-amber-200/60"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="
      inline-flex items-center justify-center
      px-10 py-3 rounded-full
      bg-gradient-to-r from-amber-500 to-amber-600
      text-white font-semibold tracking-wide
      shadow-[0_10px_20px_rgba(217,119,6,0.25)]
      ring-1 ring-amber-400/40
      hover:from-amber-600 hover:to-amber-700
      hover:shadow-[0_14px_28px_rgba(217,119,6,0.35)]
      active:scale-[0.98]
      focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300
      disabled:opacity-70 disabled:cursor-not-allowed
      transition
    "
            title={!isValid ? "Please complete all required fields first." : ""}
          >
            {submitting ? "Submitting…" : "Submit Forms"}
          </button>

          <span className="text-xs text-slate-600 text-center">
            After submitting, you'll be redirected to WhatsApp Admin for
            confirmation.
          </span>
        </div>
      </form>
    </div>
  );
}
