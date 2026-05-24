"use client";

import { useState } from "react";
import Link from "next/link";

interface Barber {
  id: string; name: string; surname: string; salonName?: string | null;
  city: string; district?: string | null; phone?: string | null;
  status: string; approvedAt?: Date | null;
  user: { email: string; createdAt: Date };
}

interface Props { pending: Barber[]; approved: Barber[]; rejected: Barber[]; }

function BarberRow({ barber, onAction }: { barber: Barber; onAction: (id: string, action: "approve" | "reject") => void }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch(`/api/admin/barbers/${barber.id}/${action}`, { method: "POST" });
    onAction(barber.id, action);
    setLoading(null);
  }

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors border-b border-white/5 last:border-0">
      <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {barber.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/profile/barber/${barber.id}`} target="_blank"
            className="text-white text-sm font-medium hover:underline">
            {barber.name} {barber.surname}
          </Link>
          {barber.salonName && <span className="text-zinc-500 text-xs">· {barber.salonName}</span>}
        </div>
        <p className="text-zinc-500 text-xs">{barber.user.email} · {barber.city}{barber.district ? `, ${barber.district}` : ""}</p>
        <p className="text-zinc-700 text-xs">{new Date(barber.user.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde kayıt</p>
      </div>
      {barber.status === "PENDING" && (
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => act("approve")} disabled={!!loading}
            className="bg-green-950/50 border border-green-800/50 text-green-400 hover:bg-green-900/50 text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 font-medium">
            {loading === "approve" ? "..." : "Onayla"}
          </button>
          <button onClick={() => act("reject")} disabled={!!loading}
            className="bg-red-950/50 border border-red-800/50 text-red-400 hover:bg-red-900/50 text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 font-medium">
            {loading === "reject" ? "..." : "Reddet"}
          </button>
        </div>
      )}
      {barber.status === "APPROVED" && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-green-950/40 border border-green-800/40 text-green-400 text-xs px-3 py-1.5 rounded-xl">✓ Onaylı</span>
          <button onClick={() => act("reject")} disabled={!!loading}
            className="text-zinc-700 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded-lg">
            {loading === "reject" ? "..." : "Reddet"}
          </button>
        </div>
      )}
      {barber.status === "REJECTED" && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-red-950/40 border border-red-800/40 text-red-400 text-xs px-3 py-1.5 rounded-xl">✕ Reddedildi</span>
          <button onClick={() => act("approve")} disabled={!!loading}
            className="text-zinc-700 hover:text-green-400 text-xs transition-colors px-2 py-1 rounded-lg">
            {loading === "approve" ? "..." : "Onayla"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApprovalClient({ pending: ip, approved: ia, rejected: ir }: Props) {
  const [pending,  setPending]  = useState<Barber[]>(ip);
  const [approved, setApproved] = useState<Barber[]>(ia);
  const [rejected, setRejected] = useState<Barber[]>(ir);

  function handleAction(id: string, action: "approve" | "reject") {
    const all = [...pending, ...approved, ...rejected];
    const barber = all.find((b) => b.id === id);
    if (!barber) return;
    const updated = { ...barber, status: action === "approve" ? "APPROVED" : "REJECTED" };

    setPending((p) => p.filter((b) => b.id !== id));
    setApproved((p) => p.filter((b) => b.id !== id));
    setRejected((p) => p.filter((b) => b.id !== id));

    if (action === "approve") setApproved((p) => [updated, ...p]);
    else setRejected((p) => [updated, ...p]);
  }

  return (
    <div className="space-y-6">
      {/* Bekleyenler */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-amber-500/5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-white font-medium text-sm">Onay Bekleyenler</h2>
          <span className="text-amber-400 text-sm font-bold ml-auto">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-zinc-600 text-sm text-center">Bekleyen usta yok 🎉</p>
        ) : (
          pending.map((b) => <BarberRow key={b.id} barber={b} onAction={handleAction} />)
        )}
      </div>

      {/* Onaylananlar */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <h2 className="text-white font-medium text-sm">Onaylı Ustalar</h2>
          <span className="text-green-400 text-sm font-bold ml-auto">{approved.length}</span>
        </div>
        {approved.length === 0 ? (
          <p className="px-5 py-8 text-zinc-600 text-sm text-center">Henüz onaylı usta yok</p>
        ) : (
          approved.map((b) => <BarberRow key={b.id} barber={b} onAction={handleAction} />)
        )}
      </div>

      {/* Reddedilenler */}
      {rejected.length > 0 && (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <h2 className="text-white font-medium text-sm">Reddedilenler</h2>
            <span className="text-red-400 text-sm font-bold ml-auto">{rejected.length}</span>
          </div>
          {rejected.map((b) => <BarberRow key={b.id} barber={b} onAction={handleAction} />)}
        </div>
      )}
    </div>
  );
}
