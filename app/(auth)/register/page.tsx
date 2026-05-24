"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

type UserType = "CUSTOMER" | "BARBER";

const inputClass = "input-premium w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all";
const labelClass = "block text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "barber" ? "BARBER" : "CUSTOMER";
  const [userType, setUserType] = useState<UserType>(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "", surname: "", phone: "", city: "", district: "", salonName: "", address: "" });

  function set(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userType }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push(data.userType === "BARBER" ? "/dashboard/barber" : "/dashboard/customer");
  }

  return (
    <div className="w-full max-w-md fade-up">
      <div className="text-center mb-7">
        <div className="mb-5"><Logo size="lg" href="/" /></div>
        <h1 className="text-xl font-bold text-white mb-1">Hesap oluştur</h1>
        <p className="text-zinc-500 text-sm">Platforma katılmak için kayıt ol</p>
      </div>

      {/* Tür seçimi */}
      <div className="glass rounded-2xl p-1 flex mb-5">
        {([["CUSTOMER", "Müşteri"], ["BARBER", "Usta / Kuaför"]] as const).map(([t, label]) => (
          <button key={t} type="button" onClick={() => setUserType(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              userType === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}>{label}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Ad</label>
            <input name="name" value={form.name} onChange={set} required placeholder="Ahmet" className={inputClass} /></div>
          <div><label className={labelClass}>Soyad</label>
            <input name="surname" value={form.surname} onChange={set} required placeholder="Kaya" className={inputClass} /></div>
        </div>

        {userType === "BARBER" && (
          <div><label className={labelClass}>Salon Adı <span className="text-zinc-700 normal-case tracking-normal">(isteğe bağlı)</span></label>
            <input name="salonName" value={form.salonName} onChange={set} placeholder="Kaya Kuaför" className={inputClass} /></div>
        )}

        <div className={userType === "BARBER" ? "grid grid-cols-2 gap-3" : ""}>
          <div><label className={labelClass}>Şehir {userType === "BARBER" && <span className="text-amber-500">*</span>}</label>
            <input name="city" value={form.city} onChange={set} required={userType === "BARBER"} placeholder="İstanbul" className={inputClass} /></div>
          {userType === "BARBER" && (
            <div><label className={labelClass}>İlçe</label>
              <input name="district" value={form.district} onChange={set} placeholder="Kadıköy" className={inputClass} /></div>
          )}
        </div>

        {userType === "BARBER" && (
          <div><label className={labelClass}>Adres <span className="text-zinc-700 normal-case tracking-normal">(isteğe bağlı)</span></label>
            <input name="address" value={form.address} onChange={set} placeholder="Moda Cad. No:47" className={inputClass} /></div>
        )}

        <div><label className={labelClass}>Telefon <span className="text-zinc-700 normal-case tracking-normal">(isteğe bağlı)</span></label>
          <input name="phone" value={form.phone} onChange={set} placeholder="05xx xxx xx xx" className={inputClass} /></div>

        <div><label className={labelClass}>E-posta</label>
          <input name="email" type="email" value={form.email} onChange={set} required placeholder="ornek@gmail.com" className={inputClass} /></div>

        <div><label className={labelClass}>Şifre</label>
          <input name="password" type="password" value={form.password} onChange={set} required placeholder="En az 6 karakter" className={inputClass} /></div>

        {error && <div className="bg-red-950/40 border border-red-800/40 text-red-400 rounded-2xl px-4 py-3 text-sm">{error}</div>}

        <button type="submit" disabled={loading}
          className="w-full bg-white text-zinc-900 font-semibold py-3.5 rounded-2xl hover:bg-zinc-100 transition-all disabled:opacity-40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </button>
      </form>

      <p className="text-center text-zinc-600 text-sm mt-5">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="text-zinc-400 hover:text-white transition-colors underline">Giriş yap</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
