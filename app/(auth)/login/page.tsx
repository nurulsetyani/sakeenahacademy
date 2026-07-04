"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Email atau kata sandi salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    router.push(searchParams.get("redirect") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-brand-900">
        Selamat datang kembali
      </h1>
      <p className="mt-2 text-sm text-parchment-600">Masuk untuk melanjutkan pembelajaran Anda.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="field-label">Kata Sandi</label>
            <Link href="/lupa-password" className="mb-1.5 text-xs font-medium text-brand-700 hover:text-brand-600">
              Lupa kata sandi?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-parchment-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-600">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
