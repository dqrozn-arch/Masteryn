"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface Barber {
  id: string; name: string; surname: string;
  salonName?: string | null; city: string; district?: string | null;
}

interface Props { onClose: () => void; onSuccess: () => void; }

function StarRow({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-300 text-sm">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s} type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className={`text-2xl transition-all duration-100 hover:scale-125 ${
              s <= (hovered || value)
                ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                : "text-zinc-700"
            }`}
          >★</button>
        ))}
      </div>
    </div>
  );
}

export default function CreatePostModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"images" | "barber" | "finish">("images");
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  type RKey = "visualFidelity"|"technicalSkill"|"processTransparency"|"expectationMgmt"|"compensationScore";
  const POST_CRITERIA: { key: RKey; label: string }[] = [
    { key: "visualFidelity",      label: "Görsel Sadakat" },
    { key: "technicalSkill",      label: "Teknik Uzmanlık" },
    { key: "processTransparency", label: "Süreç Şeffaflığı" },
    { key: "expectationMgmt",     label: "Beklenti Yönetimi" },
    { key: "compensationScore",   label: "Telafi Yaklaşımı" },
  ];
  const [ratings, setRatings] = useState<Record<RKey, number>>({
    visualFidelity: 0, technicalSkill: 0, processTransparency: 0, expectationMgmt: 0, compensationScore: 0,
  });
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRating = Object.values(ratings).every((v) => v >= 1);
  const avgRating = hasRating
    ? ((Object.values(ratings).reduce((s, v) => s + v, 0) / 5) * 2).toFixed(1)
    : null;

  function handleFiles(selected: File[]) {
    const valid = selected.filter((f) => f.type.startsWith("image/")).slice(0, 5);
    setFiles(valid);
    Promise.all(
      valid.map((f) => new Promise<string>((res) => {
        const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.readAsDataURL(f);
      }))
    ).then(setPreviews);
  }

  function handleBarberSearch(q: string) {
    setQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setBarbers([]); return; }
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/barbers/search?q=${encodeURIComponent(q)}`);
      setBarbers(await res.json());
    }, 300);
  }

  const removeImage = useCallback((i: number) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }, []);

  async function handleSubmit() {
    setLoading(true); setError("");
    const fd = new FormData();
    fd.append("barberId", selectedBarber!.id);
    fd.append("caption", caption);
    files.forEach((f) => fd.append("images", f));
    if (hasRating) {
      Object.entries(ratings).forEach(([k, v]) => fd.append(k, String(v)));
    }

    const res  = await fetch("/api/posts", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSuccess(); onClose();
  }

  const steps = ["images", "barber", "finish"] as const;
  const stepIdx = steps.indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-[#111111] border border-white/8 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-white font-semibold text-lg tracking-tight">Yeni Paylaşım</h2>
            {selectedBarber && (
              <p className="text-zinc-500 text-xs mt-0.5">
                {selectedBarber.salonName ?? `${selectedBarber.name} ${selectedBarber.surname}`}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors text-sm">✕</button>
        </div>

        {/* Step bar */}
        <div className="flex gap-1.5 px-6 mb-5">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${stepIdx >= i ? "bg-white" : "bg-zinc-800"}`} />
          ))}
        </div>

        <div className="px-6 pb-6">

          {/* ── Adım 1: Fotoğraf ── */}
          {step === "images" && (
            <div className="space-y-4">
              {previews.length === 0 ? (
                <div
                  onDrop={(e) => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl h-44 flex flex-col items-center justify-center cursor-pointer transition-colors gap-2"
                >
                  <span className="text-4xl">📷</span>
                  <p className="text-zinc-500 text-sm">Tıkla veya sürükle bırak</p>
                  <p className="text-zinc-700 text-xs">JPG, PNG, WEBP · Max 5</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image src={src} alt="" fill className="object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">✕</button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <div onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 flex items-center justify-center cursor-pointer text-zinc-600 hover:text-zinc-400 text-2xl transition-colors">+</div>
                  )}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(Array.from(e.target.files ?? []))} />
              <button disabled={files.length === 0} onClick={() => setStep("barber")}
                className="w-full bg-white text-zinc-900 font-semibold py-3.5 rounded-2xl disabled:opacity-30 hover:bg-zinc-100 transition-colors">
                Devam Et
              </button>
            </div>
          )}

          {/* ── Adım 2: Usta Seç ── */}
          {step === "barber" && (
            <div className="space-y-4">
              {selectedBarber ? (
                <div className="flex items-center gap-3 glass border border-white/8 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedBarber.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{selectedBarber.name} {selectedBarber.surname}</p>
                    <p className="text-zinc-500 text-xs">{selectedBarber.salonName ? `${selectedBarber.salonName} · ` : ""}{selectedBarber.city}</p>
                  </div>
                  <button onClick={() => { setSelectedBarber(null); setQuery(""); }}
                    className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors">Değiştir</button>
                </div>
              ) : (
                <div className="relative">
                  <input value={query} onChange={(e) => handleBarberSearch(e.target.value)}
                    placeholder="İsim veya salon adı ara..." autoFocus
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20 transition-colors" />
                  {barbers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/8 rounded-xl overflow-hidden z-10 max-h-52 overflow-y-auto">
                      {barbers.map((b) => (
                        <button key={b.id} onClick={() => { setSelectedBarber(b); setBarbers([]); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {b.name[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{b.name} {b.surname}</p>
                            <p className="text-zinc-500 text-xs">{b.salonName ? `${b.salonName} · ` : ""}{b.city}{b.district ? `, ${b.district}` : ""}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {query.length >= 2 && barbers.length === 0 && (
                    <p className="mt-2 text-zinc-600 text-sm text-center py-4">Usta bulunamadı</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep("images")}
                  className="flex-1 bg-zinc-800 text-zinc-300 font-medium py-3 rounded-2xl hover:bg-zinc-700 transition-colors">Geri</button>
                <button disabled={!selectedBarber} onClick={() => setStep("finish")}
                  className="flex-1 bg-white text-zinc-900 font-semibold py-3 rounded-2xl disabled:opacity-30 hover:bg-zinc-100 transition-colors">Devam Et</button>
              </div>
            </div>
          )}

          {/* ── Adım 3: Puanla + Açıklama + Paylaş ── */}
          {step === "finish" && (
            <div className="space-y-4">
              {/* Foto önizleme */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden">
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>

              {/* Puanlama */}
              <div className="glass border border-white/5 rounded-2xl p-4 space-y-0 divide-y divide-white/5">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Değerlendirme</p>
                  {avgRating && <span className="text-amber-400 text-sm font-bold">{avgRating}/10</span>}
                </div>
                {POST_CRITERIA.map(({ key, label }) => (
                  <StarRow key={key} label={label} value={ratings[key]} onChange={(v) => setRatings((p) => ({ ...p, [key]: v }))} />
                ))}
                {!hasRating && (
                  <p className="text-zinc-700 text-xs text-center pt-2">Puanlama isteğe bağlı — şeffaflık için önerilir</p>
                )}
              </div>

              {/* Açıklama */}
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                placeholder="Deneyimini anlat... (isteğe bağlı)"
                rows={3}
                className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/20 resize-none transition-colors" />

              {error && (
                <div className="bg-red-950/40 border border-red-800/40 text-red-400 rounded-2xl px-4 py-3 text-sm">{error}</div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep("barber")}
                  className="flex-1 bg-zinc-800 text-zinc-300 font-medium py-3 rounded-2xl hover:bg-zinc-700 transition-colors">Geri</button>
                <button disabled={loading} onClick={handleSubmit}
                  className={`flex-1 font-semibold py-3 rounded-2xl transition-all disabled:opacity-40 ${
                    hasRating
                      ? "bg-amber-400 text-zinc-900 hover:bg-amber-300"
                      : "bg-white text-zinc-900 hover:bg-zinc-100"
                  }`}>
                  {loading ? "Paylaşılıyor..." : hasRating ? "Paylaş & Değerlendir ★" : "Paylaş"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
