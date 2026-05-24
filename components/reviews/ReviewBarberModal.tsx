"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface Props {
  barber: { id: string; name: string; surname: string; salonName?: string | null };
  onClose: () => void;
  onSuccess: () => void;
}

const CRITERIA = [
  { key: "visualFidelity",      label: "Görsel Sadakat",         desc: "Portfolyodaki saç ile aynada gördüğünüz örtüştü mü?" },
  { key: "technicalSkill",      label: "Teknik Uzmanlık",        desc: "Saçınızın sağlığı korundu, yanma veya yıpranma olmadı mı?" },
  { key: "processTransparency", label: "Süreç Şeffaflığı",       desc: "Söylenen süre ve fiyat ile gerçekleşen tutarlı mıydı?" },
  { key: "expectationMgmt",     label: "Beklenti Yönetimi",      desc: "Usta saç tipinize göre dürüstçe yönlendirme yaptı mı?" },
  { key: "compensationScore",   label: "Telafi Yaklaşımı",       desc: "Sorun olsaydı/oldu ise ustanın sorumluluk alma tutumu." },
] as const;

type Key = typeof CRITERIA[number]["key"];

function StarRow({ label, desc, value, onChange }: { label: string; desc: string; value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-1">
        <p className="text-white text-sm font-medium">{label}</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((s) => (
            <button key={s} type="button"
              onClick={() => onChange(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className={`text-xl transition-all duration-100 hover:scale-110 ${
                s <= (hovered || value) ? "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" : "text-zinc-700"
              }`}>★</button>
          ))}
        </div>
      </div>
      <p className="text-zinc-600 text-xs">{desc}</p>
    </div>
  );
}

export default function ReviewBarberModal({ barber, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"rate" | "photos" | "comment">("rate");
  const [scores, setScores] = useState<Record<Key, number>>({
    visualFidelity: 0, technicalSkill: 0, processTransparency: 0, expectationMgmt: 0, compensationScore: 0,
  });
  const [previews, setPreviews] = useState<string[]>([]);
  const [files,    setFiles]    = useState<File[]>([]);
  const [comment,  setComment]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const allScored   = Object.values(scores).every((v) => v > 0);
  const avgScore    = allScored
    ? ((Object.values(scores).reduce((s, v) => s + v, 0) / 5) * 2).toFixed(1)
    : null;
  const displayName = barber.salonName ?? `${barber.name} ${barber.surname}`;

  function handleFiles(sel: File[]) {
    const valid = sel.filter((f) => f.type.startsWith("image/")).slice(0, 4);
    setFiles(valid);
    Promise.all(valid.map((f) => new Promise<string>((res) => {
      const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.readAsDataURL(f);
    }))).then(setPreviews);
  }

  const removeImg = useCallback((i: number) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }, []);

  async function handleSubmit() {
    setLoading(true); setError("");
    const fd = new FormData();
    fd.append("barberId", barber.id);
    fd.append("comment", comment);
    Object.entries(scores).forEach(([k, v]) => fd.append(k, String(v)));
    files.forEach((f) => fd.append("images", f));

    const res  = await fetch("/api/reviews/barber", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSuccess(); onClose();
  }

  const steps = ["rate", "photos", "comment"] as const;
  const stepIdx = steps.indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg bg-[#111111] border border-white/8 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-white font-semibold text-lg tracking-tight">Usta Değerlendirmesi</h2>
            <p className="text-zinc-500 text-xs mt-0.5">{displayName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors text-sm">✕</button>
        </div>

        {/* Step bar */}
        <div className="flex gap-1.5 px-6 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${stepIdx >= i ? "bg-amber-400" : "bg-zinc-800"}`} />
          ))}
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">

          {/* Adım 1: 5 kriter puanla */}
          {step === "rate" && (
            <div>
              <div className="bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 divide-y divide-white/5 mb-5">
                {CRITERIA.map(({ key, label, desc }) => (
                  <StarRow key={key} label={label} desc={desc}
                    value={scores[key]} onChange={(v) => setScores((p) => ({ ...p, [key]: v }))} />
                ))}
              </div>

              {avgScore && (
                <div className="flex items-center justify-center gap-3 py-3 mb-5 bg-amber-400/5 border border-amber-400/15 rounded-2xl">
                  <span className="text-zinc-400 text-sm">Bileşik Skor</span>
                  <span className="text-amber-400 text-3xl font-black">{avgScore}</span>
                  <span className="text-amber-400/60 text-sm font-medium">/ 10</span>
                  {parseFloat(avgScore) >= 8 && (
                    <span className="bg-green-500/15 border border-green-500/25 text-green-400 text-xs px-2 py-0.5 rounded-lg">8/10 Barajı ✓</span>
                  )}
                </div>
              )}

              <button disabled={!allScored} onClick={() => setStep("photos")}
                className="w-full bg-white text-zinc-900 font-semibold py-3.5 rounded-2xl disabled:opacity-30 hover:bg-zinc-100 transition-colors">
                Devam Et
              </button>
            </div>
          )}

          {/* Adım 2: Fotoğraf */}
          {step === "photos" && (
            <div>
              <p className="text-zinc-400 text-sm text-center mb-4">Sonuçtan fotoğraf ekle <span className="text-zinc-600">(isteğe bağlı)</span></p>
              {previews.length === 0 ? (
                <div onClick={() => fileRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl h-36 flex flex-col items-center justify-center cursor-pointer transition-colors gap-2 mb-5">
                  <span className="text-3xl">📷</span>
                  <p className="text-zinc-500 text-sm">Fotoğraf ekle</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image src={src} alt="" fill className="object-cover" />
                      <button onClick={() => removeImg(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">✕</button>
                    </div>
                  ))}
                  {previews.length < 4 && (
                    <div onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 flex items-center justify-center cursor-pointer text-zinc-600 text-2xl transition-colors">+</div>
                  )}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(Array.from(e.target.files ?? []))} />
              <div className="flex gap-2">
                <button onClick={() => setStep("rate")} className="flex-1 bg-zinc-800 text-zinc-300 py-3 rounded-2xl hover:bg-zinc-700 transition-colors font-medium">Geri</button>
                <button onClick={() => setStep("comment")} className="flex-1 bg-white text-zinc-900 font-semibold py-3 rounded-2xl hover:bg-zinc-100 transition-colors">
                  {previews.length > 0 ? "Devam Et" : "Atla"}
                </button>
              </div>
            </div>
          )}

          {/* Adım 3: Yorum + Gönder */}
          {step === "comment" && (
            <div>
              {avgScore && (
                <div className="glass border border-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Puanlarınız</p>
                    <span className="text-amber-400 font-black text-lg">{avgScore}<span className="text-zinc-600 text-xs font-normal">/10</span></span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CRITERIA.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-zinc-600 text-xs truncate pr-2">{label}</span>
                        <span className="text-amber-400 text-xs flex-shrink-0">{"★".repeat(scores[key])}<span className="text-zinc-800">{"★".repeat(5-scores[key])}</span></span>
                      </div>
                    ))}
                  </div>
                  {previews.length > 0 && (
                    <div className="flex gap-1.5 mt-3">
                      {previews.map((src, i) => (
                        <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={src} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Deneyimini toplulukla paylaş... (isteğe bağlı)"
                rows={3}
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 resize-none mb-4 transition-colors" />

              {error && <div className="bg-red-950/40 border border-red-800/40 text-red-400 rounded-2xl px-4 py-3 text-sm mb-4">{error}</div>}

              <div className="flex gap-2">
                <button onClick={() => setStep("photos")} className="flex-1 bg-zinc-800 text-zinc-300 py-3 rounded-2xl hover:bg-zinc-700 transition-colors font-medium">Geri</button>
                <button disabled={loading} onClick={handleSubmit}
                  className="flex-[2] bg-amber-400 text-zinc-900 font-bold py-3 rounded-2xl hover:bg-amber-300 transition-colors disabled:opacity-40">
                  {loading ? "Gönderiliyor..." : "Değerlendir ★"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
