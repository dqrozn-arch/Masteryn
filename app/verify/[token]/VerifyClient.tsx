"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  token: string;
  workplace: {
    id: string; salonName: string; city: string; role: string;
    startYear: number; endYear?: number | null; isCurrent: boolean;
    isVerified: boolean; employerName: string;
  };
  barber: { name: string; surname: string; salonName: string; avatar: string };
}

export default function VerifyClient({ token, workplace, barber }: Props) {
  const [verifierName, setVerifierName] = useState(workplace.employerName);
  const [loading, setLoading]  = useState<"approve" | "reject" | null>(null);
  const [done, setDone]        = useState<"approved" | "rejected" | null>(
    workplace.isVerified ? "approved" : null
  );

  async function act(action: "approve" | "reject") {
    setLoading(action);
    const res = await fetch(`/api/verify/${token}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, verifierName }),
    });
    setLoading(null);
    if (res.ok) setDone(action === "approve" ? "approved" : "rejected");
  }

  const period = `${workplace.startYear} – ${workplace.isCurrent ? "Günümüz" : workplace.endYear ?? "?"}`;

  if (done === "approved") {
    return (
      <div className="w-full max-w-md glass rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
        <h2 className="text-white font-bold text-xl mb-2">Onaylandı!</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          <span className="text-white font-medium">{barber.name} {barber.surname}</span>'nin{" "}
          <span className="text-white font-medium">{workplace.salonName}</span>'deki çalışması doğrulandı.
          Profilinde mavi tik görünecek.
        </p>
        <p className="text-zinc-600 text-xs mt-4">Bu sayfayı kapatabilirsiniz.</p>
      </div>
    );
  }

  if (done === "rejected") {
    return (
      <div className="w-full max-w-md glass rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✕</div>
        <h2 className="text-white font-bold text-xl mb-2">Reddedildi</h2>
        <p className="text-zinc-400 text-sm">Doğrulama talebi reddedildi ve kaldırıldı.</p>
        <p className="text-zinc-600 text-xs mt-4">Bu sayfayı kapatabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md fade-up">
      <div className="glass rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500/8 border-b border-blue-500/15 px-6 py-5">
          <p className="text-blue-400/80 text-xs uppercase tracking-wider font-medium mb-1">İşveren Doğrulama Talebi</p>
          <h1 className="text-white font-bold text-xl leading-tight">
            Çalışma geçmişini onaylıyor musunuz?
          </h1>
        </div>

        {/* Usta bilgisi */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
              {barber.avatar ? (
                <Image src={barber.avatar} alt="" width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-lg">
                  {barber.name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{barber.name} {barber.surname}</p>
              {barber.salonName && <p className="text-zinc-500 text-xs">{barber.salonName}</p>}
            </div>
          </div>

          {/* Çalışma detayı */}
          <div className="bg-white/3 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">{workplace.salonName}</p>
                {workplace.role && <p className="text-zinc-400 text-sm">{workplace.role}</p>}
                <p className="text-zinc-500 text-sm mt-0.5">
                  {workplace.city && `${workplace.city} · `}{period}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* İşveren adı */}
        <div className="px-6 py-4 border-b border-white/5">
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
            Adınız <span className="text-zinc-600 normal-case tracking-normal">(isteğe bağlı)</span>
          </label>
          <input
            value={verifierName}
            onChange={(e) => setVerifierName(e.target.value)}
            placeholder="Salon sahibi / yetkili adı"
            className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all"
          />
        </div>

        {/* Açıklama */}
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-zinc-500 text-xs leading-relaxed">
            Bu kişinin belirtilen salonda belirtilen tarihlerde çalıştığını onaylıyorsanız <strong className="text-white">Onayla</strong>'ya tıklayın.
            Onayladığınızda profilinde{" "}
            <span className="inline-flex items-center gap-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] px-1.5 py-0.5 rounded-lg font-medium">
              ✓ Doğrulandı
            </span>{" "}
            ibaresi görünecektir.
          </p>
        </div>

        {/* Butonlar */}
        <div className="px-6 py-5 flex gap-3">
          <button
            onClick={() => act("reject")}
            disabled={!!loading}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3.5 rounded-2xl transition-colors disabled:opacity-50 text-sm"
          >
            {loading === "reject" ? "..." : "Reddet"}
          </button>
          <button
            onClick={() => act("approve")}
            disabled={!!loading}
            className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            {loading === "approve" ? "Onaylanıyor..." : <><span className="text-lg leading-none">✓</span> Onayla</>}
          </button>
        </div>
      </div>
    </div>
  );
}
