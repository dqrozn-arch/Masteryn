"use client";

import { useState, useRef } from "react";
import StarPicker from "./StarPicker";

interface Customer { id: string; name: string; surname: string; city?: string | null; }

const CRITERIA = [
  { key: "appointmentLoyalty",   label: "Randevu Sadakati",         desc: "Belirlenen saate uydu veya iptal için zamanında haber verdi." },
  { key: "processCooperation",   label: "Süreç İş Birliği",         desc: "Teknik uyarılara anlayış gösterdi, gerçekçi beklenti taşıdı." },
  { key: "communicationRespect", label: "İletişim Nezaketi",         desc: "Salon içindeki davranışı ve zanaatkara gösterdiği saygı." },
  { key: "feedbackHonesty",      label: "Geri Bildirim Dürüstlüğü", desc: "Sorun varsa salondan çıkmadan önce dile getirdi." },
] as const;

type Key = typeof CRITERIA[number]["key"];

interface Props { onClose: () => void; onSuccess: () => void; }

export default function ReviewCustomerModal({ onClose, onSuccess }: Props) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [scores,   setScores]   = useState<Record<Key, number>>({
    appointmentLoyalty: 0, processCooperation: 0, communicationRespect: 0, feedbackHonesty: 0,
  });
  const [comment,  setComment]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allScored = Object.values(scores).every((v) => v > 0);

  function handleSearch(q: string) {
    setQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/customers/search?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) { setError("Müşteri seçin"); return; }
    if (!allScored) { setError("Tüm kriterleri doldurun"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/reviews/customer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: selected.id, ...scores, comment }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSuccess(); onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-[#111111] border border-white/8 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-white font-semibold text-lg">Müşteri Değerlendirmesi</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 overflow-y-auto max-h-[70vh] space-y-5">

          {/* Müşteri seç */}
          {!selected ? (
            <div className="relative">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Müşteriyi Ara</label>
              <input value={query} onChange={(e) => handleSearch(e.target.value)}
                placeholder="İsim ara..." autoFocus
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20 transition-all" />
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/8 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                  {results.map((c) => (
                    <button key={c.id} type="button"
                      onClick={() => { setSelected(c); setResults([]); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors">
                      <div className="w-8 h-8 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{c.name} {c.surname}</p>
                        {c.city && <p className="text-zinc-500 text-xs">{c.city}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-zinc-900 border border-white/8 rounded-2xl p-4">
              <div className="w-10 h-10 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {selected.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{selected.name} {selected.surname}</p>
                {selected.city && <p className="text-zinc-500 text-xs">{selected.city}</p>}
              </div>
              <button type="button" onClick={() => { setSelected(null); setQuery(""); }}
                className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors">Değiştir</button>
            </div>
          )}

          {/* 4 kriter */}
          <div className="bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 divide-y divide-white/5">
            {CRITERIA.map(({ key, label, desc }) => (
              <div key={key} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-white text-sm font-medium">{label}</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} type="button" onClick={() => setScores((p) => ({ ...p, [key]: s }))}
                        className={`text-xl transition-all hover:scale-110 ${s <= scores[key] ? "text-amber-400" : "text-zinc-700"}`}>★</button>
                    ))}
                  </div>
                </div>
                <p className="text-zinc-600 text-xs">{desc}</p>
              </div>
            ))}
          </div>

          {/* Yorum */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Yorum <span className="normal-case text-zinc-700 tracking-normal">(isteğe bağlı)</span></label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Müşteri hakkında not bırak..."
              rows={2}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20 resize-none transition-all" />
          </div>

          {error && <div className="bg-red-950/40 border border-red-800/40 text-red-400 rounded-2xl px-4 py-3 text-sm">{error}</div>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 text-zinc-300 py-3 rounded-2xl hover:bg-zinc-700 transition-colors font-medium">İptal</button>
            <button type="submit" disabled={loading || !allScored}
              className="flex-1 bg-white text-zinc-900 font-semibold py-3 rounded-2xl disabled:opacity-40 hover:bg-zinc-100 transition-colors">
              {loading ? "Gönderiliyor..." : "Değerlendir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
