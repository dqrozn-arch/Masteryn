"use client";

import { useState, useEffect, useCallback } from "react";

const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Bekliyor",   color: "#f59e0b" },
  CONFIRMED: { label: "Onaylandı", color: "#10b981" },
  CANCELLED: { label: "İptal",     color: "#ef4444" },
  COMPLETED: { label: "Tamamlandı",color: "#6b7280" },
  NO_SHOW:   { label: "Gelmedi",   color: "#ef4444" },
};

interface Appointment {
  id: string;
  service: string;
  date: string;
  duration: number;
  status: string;
  note?: string | null;
  cancelNote?: string | null;
  customer: { id: string; name: string; surname: string; avatar?: string | null; phone?: string | null };
}

interface AvailabilityItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function AppointmentCard({ appt, onUpdate }: { appt: Appointment; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const { date, time } = fmt(appt.date);

  async function updateStatus(status: string, note?: string) {
    setLoading(true);
    await fetch(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(note ? { cancelNote: note } : {}) }),
    });
    setLoading(false);
    setShowCancel(false);
    onUpdate();
  }

  const s = STATUS_LABEL[appt.status] ?? { label: appt.status, color: "#6b7280" };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#161616", border: "1px solid #252525" }}>
      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #1e1e1e, #2a2a2a)", border: "1px solid #333" }}>
          {appt.customer.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-white text-sm font-medium truncate">
              {appt.customer.name} {appt.customer.surname}
            </p>
            <span className="text-[11px] px-2 py-0.5 rounded-lg font-medium flex-shrink-0"
              style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
              {s.label}
            </span>
          </div>
          <p className="text-zinc-500 text-xs">{appt.service}</p>
          <p className="text-zinc-600 text-xs mt-0.5">{date} · {time} · {appt.duration} dk</p>
          {appt.note && (
            <p className="text-zinc-500 text-xs mt-1.5 italic">"{appt.note}"</p>
          )}
          {appt.cancelNote && (
            <p className="text-red-400/70 text-xs mt-1">İptal nedeni: {appt.cancelNote}</p>
          )}
          {appt.customer.phone && (
            <p className="text-zinc-600 text-xs mt-0.5">📞 {appt.customer.phone}</p>
          )}
        </div>
      </div>

      {/* Aksiyon butonları */}
      {appt.status === "PENDING" && (
        <div className="px-4 pb-4 flex gap-2">
          <button disabled={loading} onClick={() => updateStatus("CONFIRMED")}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
            ✓ Onayla
          </button>
          <button disabled={loading} onClick={() => setShowCancel(true)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            ✕ Reddet
          </button>
        </div>
      )}

      {appt.status === "CONFIRMED" && (
        <div className="px-4 pb-4 flex gap-2">
          <button disabled={loading} onClick={() => updateStatus("COMPLETED")}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: "var(--gold-subtle)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
            Tamamlandı
          </button>
          <button disabled={loading} onClick={() => updateStatus("NO_SHOW")}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: "rgba(245,158,11,0.08)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)" }}>
            Gelmedi
          </button>
          <button disabled={loading} onClick={() => setShowCancel(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            İptal
          </button>
        </div>
      )}

      {showCancel && (
        <div className="px-4 pb-4 space-y-2">
          <textarea value={cancelNote} onChange={(e) => setCancelNote(e.target.value)}
            placeholder="İptal gerekçesi (opsiyonel)" rows={2}
            className="w-full rounded-xl px-3 py-2 text-xs text-white resize-none"
            style={{ background: "#1a1a1a", border: "1px solid #333" }} />
          <div className="flex gap-2">
            <button onClick={() => setShowCancel(false)}
              className="flex-1 py-2 rounded-xl text-xs text-zinc-500"
              style={{ background: "#1a1a1a" }}>Vazgeç</button>
            <button disabled={loading} onClick={() => updateStatus("CANCELLED", cancelNote)}
              className="flex-1 py-2 rounded-xl text-xs font-medium"
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
              İptal Et
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AvailabilityEditor({ barberId }: { barberId: string }) {
  const [schedule, setSchedule] = useState<AvailabilityItem[]>(() =>
    Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, startTime: "09:00", endTime: "18:00", isActive: i >= 1 && i <= 6 }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/barbers/${barberId}/schedule`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.schedule) {
          setSchedule((prev) => prev.map((day) => {
            const found = data.schedule.find((s: AvailabilityItem) => s.dayOfWeek === day.dayOfWeek);
            return found ? { ...day, ...found } : day;
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [barberId]);

  function toggleDay(i: number) {
    setSchedule((prev) => prev.map((d) => d.dayOfWeek === i ? { ...d, isActive: !d.isActive } : d));
  }

  function setTime(i: number, field: "startTime" | "endTime", val: string) {
    setSchedule((prev) => prev.map((d) => d.dayOfWeek === i ? { ...d, [field]: val } : d));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/barbers/${barberId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-zinc-600 text-xs text-center py-4">Yükleniyor…</p>;

  return (
    <div className="space-y-2">
      {schedule.map((day) => (
        <div key={day.dayOfWeek} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ background: day.isActive ? "#1a1a1a" : "#111", border: `1px solid ${day.isActive ? "#2a2a2a" : "#1a1a1a"}` }}>
          <button onClick={() => toggleDay(day.dayOfWeek)}
            className="w-10 flex-shrink-0 text-xs font-medium text-left"
            style={{ color: day.isActive ? "var(--gold)" : "#3a3a3a" }}>
            {DAYS_SHORT[day.dayOfWeek]}
          </button>
          {day.isActive ? (
            <div className="flex items-center gap-2 flex-1">
              <input type="time" value={day.startTime} onChange={(e) => setTime(day.dayOfWeek, "startTime", e.target.value)}
                className="text-xs text-white rounded-lg px-2 py-1"
                style={{ background: "#252525", border: "1px solid #333", colorScheme: "dark" }} />
              <span className="text-zinc-600 text-xs">—</span>
              <input type="time" value={day.endTime} onChange={(e) => setTime(day.dayOfWeek, "endTime", e.target.value)}
                className="text-xs text-white rounded-lg px-2 py-1"
                style={{ background: "#252525", border: "1px solid #333", colorScheme: "dark" }} />
            </div>
          ) : (
            <span className="text-zinc-700 text-xs flex-1">Kapalı</span>
          )}
          <button onClick={() => toggleDay(day.dayOfWeek)}
            className="w-9 h-5 rounded-full flex-shrink-0 transition-all relative"
            style={{ background: day.isActive ? "var(--gold)" : "#252525" }}>
            <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white"
              style={{ left: day.isActive ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
          </button>
        </div>
      ))}
      <button onClick={save} disabled={saving}
        className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
        style={{ background: saved ? "rgba(16,185,129,0.12)" : "var(--gold)", color: saved ? "#10b981" : "#0a0a0a" }}>
        {saving ? "Kaydediliyor…" : saved ? "✓ Kaydedildi" : "Müsaitliği Kaydet"}
      </button>
    </div>
  );
}

export default function BarberAppointmentsPanel({ barberId }: { barberId: string }) {
  const [tab, setTab] = useState<"pending" | "upcoming" | "past" | "schedule">("pending");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch {
      // sessiz hata — boş liste göster
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppts(); }, [fetchAppts]);

  const now = new Date();
  const pending  = appointments.filter((a) => a.status === "PENDING");
  const upcoming = appointments.filter((a) => a.status === "CONFIRMED" && new Date(a.date) >= now);
  const past     = appointments.filter((a) => ["COMPLETED","CANCELLED","NO_SHOW"].includes(a.status) || (a.status === "CONFIRMED" && new Date(a.date) < now));

  const tabs = [
    { key: "pending",  label: "Bekleyen", count: pending.length },
    { key: "upcoming", label: "Yaklaşan", count: upcoming.length },
    { key: "past",     label: "Geçmiş",   count: past.length },
    { key: "schedule", label: "Takvim",   count: null },
  ] as const;

  const shown = tab === "pending" ? pending : tab === "upcoming" ? upcoming : tab === "past" ? past : [];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <p className="text-white font-semibold text-sm">Randevular</p>
        {pending.length > 0 && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: "#f59e0b", color: "#0a0a0a" }}>
            {pending.length}
          </span>
        )}
      </div>

      {/* Sekmeler */}
      <div className="flex border-b" style={{ borderColor: "#1e1e1e" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 text-xs font-medium transition-all relative"
            style={{ color: tab === t.key ? "var(--gold)" : "#4a4a4a" }}>
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="ml-1 text-[10px] px-1 rounded" style={{ background: tab === t.key ? "var(--gold-subtle)" : "#1e1e1e", color: tab === t.key ? "var(--gold)" : "#4a4a4a" }}>
                {t.count}
              </span>
            )}
            {tab === t.key && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: "var(--gold)" }} />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {tab === "schedule" ? (
          <AvailabilityEditor barberId={barberId} />
        ) : loading ? (
          <p className="text-zinc-600 text-xs text-center py-6">Yükleniyor…</p>
        ) : shown.length === 0 ? (
          <p className="text-zinc-700 text-xs text-center py-6">
            {tab === "pending" ? "Bekleyen randevu yok" : tab === "upcoming" ? "Yaklaşan randevu yok" : "Geçmiş kayıt yok"}
          </p>
        ) : (
          shown.map((a) => <AppointmentCard key={a.id} appt={a} onUpdate={fetchAppts} />)
        )}
      </div>
    </div>
  );
}
