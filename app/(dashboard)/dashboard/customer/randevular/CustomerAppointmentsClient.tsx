"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Onay Bekliyor", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"   },
  CONFIRMED: { label: "Onaylandı",     color: "#10b981", bg: "rgba(16,185,129,0.1)"   },
  CANCELLED: { label: "İptal Edildi",  color: "#ef4444", bg: "rgba(239,68,68,0.1)"    },
  COMPLETED: { label: "Tamamlandı",    color: "#6b7280", bg: "rgba(107,114,128,0.1)"  },
  NO_SHOW:   { label: "Gitmedi",       color: "#ef4444", bg: "rgba(239,68,68,0.1)"    },
};

interface Appointment {
  id: string;
  service: string;
  date: string;
  duration: number;
  status: string;
  note?: string | null;
  cancelNote?: string | null;
  barber: { id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null; city?: string | null };
}

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function CustomerAppointmentsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function cancel(id: string) {
    setCancelling(id);
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "CANCELLED" } : a));
    setCancelling(null);
  }

  const now = new Date();
  const upcoming = appointments.filter((a) => ["PENDING","CONFIRMED"].includes(a.status) && new Date(a.date) >= now);
  const past     = appointments.filter((a) => !["PENDING","CONFIRMED"].includes(a.status) || new Date(a.date) < now);
  const shown    = tab === "upcoming" ? upcoming : past;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-white font-bold text-xl">Randevularım</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Randevu geçmişini ve yaklaşan randevuları takip et</p>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 mb-6">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === t ? "var(--gold-subtle)" : "#161616",
              color: tab === t ? "var(--gold)" : "#6b7280",
              border: `1px solid ${tab === t ? "var(--gold-border)" : "#252525"}`,
            }}>
            {t === "upcoming" ? `Yaklaşan (${upcoming.length})` : `Geçmiş (${past.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-600 text-sm">Yükleniyor…</div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-600 text-sm mb-4">
            {tab === "upcoming" ? "Yaklaşan randevun yok" : "Geçmiş randevu yok"}
          </p>
          {tab === "upcoming" && (
            <Link href="/dashboard/customer"
              className="text-sm px-4 py-2 rounded-xl"
              style={{ background: "var(--gold)", color: "#0a0a0a" }}>
              Usta Bul
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((appt) => {
            const s = STATUS_LABEL[appt.status] ?? { label: appt.status, color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
            const { date, time } = fmt(appt.date);
            const barberName = appt.barber.salonName ?? `${appt.barber.name} ${appt.barber.surname}`;

            return (
              <div key={appt.id} className="rounded-2xl p-5"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}>

                {/* Başlık */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white font-semibold text-sm">{appt.service}</p>
                    <Link href={`/profile/barber/${appt.barber.id}`}
                      className="text-zinc-400 text-xs hover:text-white transition-colors">
                      {barberName}
                      {appt.barber.city ? ` · ${appt.barber.city}` : ""}
                    </Link>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-xl font-medium flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>

                {/* Detaylar */}
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                  <span>📅 {date}</span>
                  <span>⏰ {time}</span>
                  <span>⏱ {appt.duration} dk</span>
                </div>

                {appt.note && (
                  <p className="text-zinc-600 text-xs italic mb-3">"{appt.note}"</p>
                )}

                {appt.cancelNote && (
                  <p className="text-red-400/60 text-xs mb-3">İptal nedeni: {appt.cancelNote}</p>
                )}

                {/* İptal butonu (sadece aktif randevular için) */}
                {["PENDING","CONFIRMED"].includes(appt.status) && new Date(appt.date) > now && (
                  <button disabled={cancelling === appt.id}
                    onClick={() => cancel(appt.id)}
                    className="text-xs px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {cancelling === appt.id ? "İptal ediliyor…" : "Randevuyu İptal Et"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
