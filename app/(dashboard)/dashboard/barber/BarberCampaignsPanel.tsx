"use client";

import { useState, useEffect, useCallback } from "react";

interface Campaign {
  id: string;
  title: string;
  body?: string | null;
  service?: string | null;
  discount?: number | null;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
}

function timeLeft(validUntil: string): string {
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return "Süresi doldu";
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} gün kaldı`;
  if (h > 0) return `${h} saat kaldı`;
  return "Bugün son gün!";
}

function CampaignForm({ barberId, onSaved }: { barberId: string; onSaved: () => void }) {
  const [title, setTitle]         = useState("");
  const [body, setBody]           = useState("");
  const [service, setService]     = useState("");
  const [discount, setDiscount]   = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  async function submit() {
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/barbers/${barberId}/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body: body || null,
        service: service || null,
        discount: discount ? Number(discount) : null,
        validUntil: validUntil || null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setTitle(""); setBody(""); setService(""); setDiscount(""); setValidUntil("");
      onSaved();
    } else {
      const d = await res.json();
      setError(d.error ?? "Hata oluştu");
    }
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#161616", border: "1px solid #252525" }}>
      <p className="text-white text-xs font-semibold uppercase tracking-wider">Yeni Kampanya</p>

      <input value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlık — ör. Bugün %20 İndirim! *"
        className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />

      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2}
        placeholder="Açıklama (opsiyonel)"
        className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />

      <div className="grid grid-cols-2 gap-2">
        <input value={service} onChange={(e) => setService(e.target.value)}
          placeholder="Hizmet (ör. Balayage)"
          className="rounded-xl px-3 py-2.5 text-sm text-white"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
        <div className="relative">
          <input type="number" min={1} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)}
            placeholder="İndirim %"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
        </div>
      </div>

      <div>
        <label className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1 block">Son Geçerlilik (opsiyonel)</label>
        <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", colorScheme: "dark" }} />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button disabled={!title.trim() || loading} onClick={submit}
        className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
        style={{ background: "var(--gold)", color: "#0a0a0a" }}>
        {loading ? "Paylaşılıyor…" : "⚡ Kampanyayı Yayınla"}
      </button>
    </div>
  );
}

export default function BarberCampaignsPanel({ barberId }: { barberId: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading]    = useState(true);
  const [showForm, setShowForm]  = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/barbers/${barberId}/campaigns`);
      const d = await res.json();
      setCampaigns(d.campaigns ?? []);
    } catch { /* noop */ } finally {
      setLoading(false);
    }
  }, [barberId]);

  useEffect(() => { load(); }, [load]);

  async function deactivate(id: string) {
    await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <p className="text-white font-semibold text-sm">⚡ Kampanyalarım</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: showForm ? "rgba(239,68,68,0.08)" : "var(--gold-subtle)",
            color: showForm ? "#ef4444" : "var(--gold)",
            border: `1px solid ${showForm ? "rgba(239,68,68,0.2)" : "var(--gold-border)"}`,
          }}>
          {showForm ? "✕ Kapat" : "+ Yeni Kampanya"}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {showForm && (
          <CampaignForm barberId={barberId} onSaved={() => { setShowForm(false); load(); }} />
        )}

        {loading ? (
          <p className="text-zinc-600 text-xs text-center py-4">Yükleniyor…</p>
        ) : campaigns.length === 0 ? (
          <p className="text-zinc-700 text-xs text-center py-6">Henüz aktif kampanya yok</p>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl p-4"
              style={{ background: "#161616", border: "1px solid rgba(201,169,110,0.15)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {c.discount && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: "var(--gold)", color: "#0a0a0a" }}>
                        %{c.discount} İndirim
                      </span>
                    )}
                    {c.service && (
                      <span className="text-[10px] text-zinc-500">{c.service}</span>
                    )}
                  </div>
                  <p className="text-white text-sm font-semibold">{c.title}</p>
                  {c.body && <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{c.body}</p>}
                  {c.validUntil && (
                    <p className="text-zinc-600 text-xs mt-1">📅 {timeLeft(c.validUntil)}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => deactivate(c.id)}
                    className="text-[10px] px-2 py-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    style={{ background: "#1a1a1a" }}>
                    Durdur
                  </button>
                  <button onClick={() => remove(c.id)}
                    className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                    style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)" }}>
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
