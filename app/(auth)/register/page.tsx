"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { normalizePhone, isValidIndonesianPhone } from "@/lib/phone";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"murid" | "guru">("murid");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedPhone = normalizePhone(phone);
    if (!isValidIndonesianPhone(normalizedPhone)) {
      setError("Nomor HP tidak valid. Contoh: 081234567890");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: normalizedPhone, role },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Cek email Anda</h1>
        <p className="mt-3 text-sm leading-[1.7] text-parchment-600">
          {role === "guru"
            ? "Kami mengirim tautan konfirmasi ke email Anda. Setelah dikonfirmasi, akun guru Anda menunggu persetujuan Admin sebelum dapat mengelola kelas."
            : "Kami mengirim tautan konfirmasi ke email Anda. Klik tautan tersebut untuk mulai belajar."}
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-flex">Kembali ke Masuk</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-brand-900">
        Buat akun baru
      </h1>
      <p className="mt-2 text-sm text-parchment-600">Mulai belajar bersama Sakeenah Academy.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="full_name" className="field-label">Nama Lengkap</label>
          <input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="field-input" placeholder="Nama sesuai identitas" />
        </div>

        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" placeholder="nama@email.com" />
        </div>

        <div>
          <label htmlFor="phone" className="field-label">Nomor HP (WhatsApp)</label>
          <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="field-input" placeholder="081234567890" />
          <p className="mt-1.5 text-xs text-parchment-500">Dipakai untuk pengingat pembayaran via WhatsApp.</p>
        </div>

        <div>
          <label htmlFor="password" className="field-label">Kata Sandi</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" placeholder="Minimal 8 karakter" />
        </div>

        <div>
          <span className="field-label">Daftar sebagai</span>
          <div className="grid grid-cols-2 gap-3">
            {(["murid", "guru"] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  role === r
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-parchment-300 text-parchment-600 hover:border-parchment-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {role === "guru" && (
            <p className="mt-1.5 text-xs text-parchment-500">
              Akun guru memerlukan persetujuan Admin sebelum dapat mengelola kelas.
            </p>
          )}
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-parchment-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-600">Masuk</Link>
      </p>
    </div>
  );
}
