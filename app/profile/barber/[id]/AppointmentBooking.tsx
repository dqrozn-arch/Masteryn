"use client";

import { useState, useRef } from "react";

const DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

const SERVICE_GROUPS = [
  {
    label: "Kesim",
    services: ["Saç Kesimi", "Klasik Kesim", "Modern Kesim", "Çocuk Kesimi", "Fringe / Pony Kesim"],
  },
  {
    label: "Renklendirme",
    services: ["Saç Boyama", "Balayage", "Ombre", "Sombre", "Röfle", "Facelight", "Freelight", "Highlights", "Tease Light", "Toner / Renk Tazele"],
  },
  {
    label: "Bakım & Şekillendirme",
    services: ["Keratin Düzleştirme", "Saç Bakımı", "Nem Bakımı", "Botoks Bakımı", "Olaplex", "Fön & Şekillendirme", "Maşa / Bukle", "Düzleştirme"],
  },
  {
    label: "Diğer",
    services: ["Gelin Saçı", "Topuz & Örgü", "Saç Uzatma", "Danışmanlık"],
  },
];

function buildDays(n = 21) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}
const SERVICES = [
  "Saç Kesimi", "Klasik Kesim", "Modern Kesim", "Çocuk Kesimi",
  "Saç Boyama", "Balayage", "Ombre", "Röfle",
  "Keratin", "Saç Bakımı", "Nem Bakımı", "Stilist",
];

interface Props {
  barberId: string;
  barberName: string;
}

export default function AppointmentBooking({ barberId, barberName }: Props) {
  const [open, setOpen]         = useState(false);
  const [step, setStep]         = useState<1 | 2 | 3>(1);
  const [service, setService]   = useState("");
  const [date, setDate]         = useState("");
  const [slots, setSlots]       = useState<string[]>([]);
  const [slot, setSlot]         = useState("");
  const [note, setNote]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const daysRef = useRef<HTMLDivElement>(null);

  const dayList = buildDays(21);

  async function fetchSlots(d: string) {
    setLoading(true);
    setSlots([]);
    setSlot("");
    setError("");
    try {
      const res = await fetch(`/api/barbers/${barberId}/availability?date=${d}`);
      const data = await res.json();
      if (data.slots?.length === 0) setError("Bu gün müsait saat bulunmuyor.");
      setSlots(data.slots ?? []);
    } catch {
      setError("Müsaitlik bilgisi alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    if (!service || !date || !slot) return;
    setLoading(true);
    setError("");
    try {
      const dateTime = `${date}T${slot}:00.000Z`;
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberId, service, date: dateTime, note }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Hata oluştu."); return; }
      setSuccess(true);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setOpen(false); setStep(1); setService(""); setDate(""); setSlots([]);
    setSlot(""); setNote(""); setError(""); setSuccess(false);
  }

  return (
    <>
      {/* Randevu Al Butonu */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all"
        style={{
          padding: "13px 24px",
          background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
          color: "#0a0a0a",
          fontSize: "14px",
          letterSpacing: "0.04em",
          boxShadow: "0 4px 20px var(--gold-glow)",
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Randevu Al
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: "#111", border: "1px solid rgba(201,169,110,0.15)" }}>

            {/* Başlık */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(201,169,110,0.1)" }}>
              <div>
                <h3 className="text-white font-bold text-base">Randevu Al</h3>
                <p className="text-zinc-500 text-xs mt-0.5">{barberName}</p>
              </div>
              <button onClick={reset} className="text-zinc-600 hover:text-zinc-400 transition-colors text-xl leading-none">✕</button>
            </div>

            {/* Adım göstergesi */}
            <div className="flex gap-1 px-5 pt-4">
              {[1,2,3].map((s) => (
                <div key={s} className="flex-1 h-1 rounded-full transition-all"
                  style={{ background: step >= s ? "var(--gold)" : "#2a2a2a" }} />
              ))}
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h4 className="text-white font-bold text-lg mb-2">Randevu Talebiniz Alındı</h4>
                <p className="text-zinc-400 text-sm mb-6">Usta onayladıktan sonra bildirim alacaksınız.</p>
                <button onClick={reset}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "var(--gold)", color: "#0a0a0a" }}>
                  Tamam
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-5 overflow-y-auto" style={{ maxHeight: "70vh" }}>

                {/* ADIM 1 — Hizmet seç */}
                {step === 1 && (
                  <div className="space-y-4">
                    {SERVICE_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-2 px-0.5">{group.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.services.map((s) => (
                            <button key={s} onClick={() => setService(s)}
                              className="text-xs py-2 px-3 rounded-xl transition-all"
                              style={{
                                background: service === s ? "var(--gold-subtle)" : "#1a1a1a",
                                border: `1px solid ${service === s ? "var(--gold-border)" : "#2a2a2a"}`,
                                color: service === s ? "var(--gold)" : "#a1a1aa",
                                fontWeight: service === s ? 600 : 400,
                              }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button disabled={!service} onClick={() => setStep(2)}
                      className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-all"
                      style={{ background: "var(--gold)", color: "#0a0a0a" }}>
                      Devam →
                    </button>
                  </div>
                )}

                {/* ADIM 2 — Tarih ve saat */}
                {step === 2 && (
                  <div>
                    {/* Gün seçici — yatay kaydır */}
                    <p className="text-zinc-400 text-xs mb-3 uppercase tracking-widest">Gün Seçin</p>
                    <div ref={daysRef}
                      className="flex gap-2 overflow-x-auto pb-2"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                      {dayList.map((d) => {
                        const iso = d.toLocaleDateString("sv"); // yyyy-mm-dd
                        const isSelected = date === iso;
                        const isToday = iso === new Date().toLocaleDateString("sv");
                        return (
                          <button key={iso}
                            onClick={() => { setDate(iso); fetchSlots(iso); setSlot(""); }}
                            className="flex-shrink-0 flex flex-col items-center rounded-2xl py-3 transition-all"
                            style={{
                              width: 52,
                              background: isSelected ? "var(--gold)" : "#1a1a1a",
                              border: `1px solid ${isSelected ? "var(--gold)" : isToday ? "var(--gold-border)" : "#2a2a2a"}`,
                            }}>
                            <span className="text-[10px] font-medium mb-1"
                              style={{ color: isSelected ? "#0a0a0a" : isToday ? "var(--gold)" : "#6b7280" }}>
                              {DAYS[d.getDay()]}
                            </span>
                            <span className="text-base font-bold leading-none"
                              style={{ color: isSelected ? "#0a0a0a" : "#fff" }}>
                              {d.getDate()}
                            </span>
                            <span className="text-[10px] mt-1"
                              style={{ color: isSelected ? "#0a0a0a80" : "#3a3a3a" }}>
                              {MONTHS[d.getMonth()]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Saat slotları */}
                    {date && (
                      <div className="mt-4">
                        {loading ? (
                          <div className="flex items-center justify-center gap-2 py-6">
                            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                              style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                            <span className="text-zinc-500 text-xs">Saatler yükleniyor…</span>
                          </div>
                        ) : slots.length > 0 ? (
                          <>
                            <p className="text-zinc-400 text-xs mb-3 uppercase tracking-widest">Saat Seçin</p>
                            <div className="grid grid-cols-4 gap-2">
                              {slots.map((s) => (
                                <button key={s} onClick={() => setSlot(s)}
                                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                                  style={{
                                    background: slot === s ? "var(--gold)" : "#1a1a1a",
                                    border: `1px solid ${slot === s ? "var(--gold)" : "#2a2a2a"}`,
                                    color: slot === s ? "#0a0a0a" : "#a1a1aa",
                                  }}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 py-5">
                            <span className="text-2xl">📅</span>
                            <p className="text-zinc-500 text-xs">Bu gün müsait saat yok</p>
                            <p className="text-zinc-700 text-[10px]">Başka bir gün seçin</p>
                          </div>
                        )}
                      </div>
                    )}

                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setStep(1)}
                        className="flex-1 py-3 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors"
                        style={{ background: "#1a1a1a" }}>← Geri</button>
                      <button disabled={!date || !slot} onClick={() => setStep(3)}
                        className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
                        style={{ background: "var(--gold)", color: "#0a0a0a" }}>
                        Devam →
                      </button>
                    </div>
                  </div>
                )}

                {/* ADIM 3 — Not ve onay */}
                {step === 3 && (
                  <div>
                    <div className="rounded-2xl p-4 mb-4" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">Hizmet</span>
                        <span className="text-white font-medium">{service}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">Tarih</span>
                        <span className="text-white font-medium">
                          {date ? new Date(date + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" }) : ""}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Saat</span>
                        <span className="text-white font-medium">{slot}</span>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-xs mb-2 uppercase tracking-widest">Not (opsiyonel)</p>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                      placeholder="Özel bir isteğiniz var mı?"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />

                    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setStep(2)}
                        className="flex-1 py-3 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors"
                        style={{ background: "#1a1a1a" }}>← Geri</button>
                      <button disabled={loading} onClick={handleBook}
                        className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                        style={{ background: "var(--gold)", color: "#0a0a0a" }}>
                        {loading ? "Gönderiliyor…" : "Randevu Onayla"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
