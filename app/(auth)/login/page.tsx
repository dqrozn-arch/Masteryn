"use client";

import { useActionState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <div className="w-full max-w-sm fade-up">
      <div className="text-center mb-10">
        <Logo size="xl" href="/" />
        <p className="text-zinc-500 text-sm mt-4">Hesabına giriş yap</p>
      </div>

      <form action={action} className="glass rounded-3xl p-6 space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">
            E-posta veya Kullanıcı Adı
          </label>
          <input
            name="emailOrUsername"
            required
            autoFocus
            autoComplete="username"
            placeholder="ornek@gmail.com veya kullaniciadi"
            className="input-premium w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Şifre</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="input-premium w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all"
          />
        </div>

        {state?.error && (
          <div className="bg-red-950/40 border border-red-800/40 text-red-400 rounded-2xl px-4 py-3 text-sm">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-white text-zinc-900 font-semibold py-3.5 rounded-2xl hover:bg-zinc-100 transition-all disabled:opacity-40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-2"
        >
          {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="text-center text-zinc-600 text-sm mt-5">
        Hesabın yok mu?{" "}
        <Link href="/register" className="text-zinc-400 hover:text-white transition-colors underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
