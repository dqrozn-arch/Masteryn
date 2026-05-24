"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

interface Props {
  barberId: string;
  barberName: string;
  phone?: string | null;
  specialties?: string[];
  overallScore?: number;
  reviewCount?: number;
  appointmentSlot?: ReactNode;
}

// Uzmanlık kategorisi → ikon SVG path
function SpecialtyIcon({ specialties }: { specialties: string[] }) {
  const colorSpecs  = ["Saç Boyama", "Röfle", "Balayage", "Ombre", "Keratin", "Saç Bakımı"];
  const isColor     = specialties.some((s) => colorSpecs.includes(s));

  if (isColor) return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity={0.3}/>
      <path d="M7 12c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5z"/>
      <path d="M12 7v2M12 15v2M7 12H9M15 12h2"/>
    </svg>
  );

  // Default: makas
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
    </svg>
  );
}

// Yanıt süresi metni
function getResponseLabel(reviewCount: number, overallScore: number): string {
  if (reviewCount === 0) return "Yeni usta · Hızlı yanıt beklenir";
  if (overallScore >= 9 && reviewCount >= 15) return "Genelde 15 dk'da yanıt verir";
  if (reviewCount >= 10) return "Genelde 1 saatte yanıt verir";
  if (reviewCount >= 5)  return "Genelde 2-3 saatte yanıt verir";
  return "Yanıt süresi değişken";
}

export default function ConsultationButton({ barberId, barberName, phone, specialties = [], overallScore = 0, reviewCount = 0, appointmentSlot }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [message,   setMessage]   = useState("");
  const [images,    setImages]    = useState<{ file: File; preview: string }[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  const waNumber = phone?.replace(/\D/g, "") ?? "";
  const waText   = encodeURIComponent(
    `Merhaba, Masteryn platformu üzerinden danışmak istiyorum.\n\nNot: Fiyat ve işlem onaylarını Masteryn uygulaması üzerinden yapmanızı rica ederim.`
  );
  const waUrl = waNumber ? `https://wa.me/90${waNumber.slice(-10)}?text=${waText}` : null;

  const isQuickReply   = (overallScore >= 9 && reviewCount >= 10) || reviewCount >= 20;
  const responseLabel  = getResponseLabel(reviewCount, overallScore);
  const topSpec        = specialties[0] ?? null;

  function handleImages(files: FileList | null) {
    if (!files) return;
    Array.from(files).slice(0, 3 - images.length).forEach((file) => {
      const r = new FileReader();
      r.onload = (e) => setImages((prev) => [...prev, { file, preview: e.target?.result as string }]);
      r.readAsDataURL(file);
    });
  }

  async function handleSubmit() {
    if (!message.trim() && images.length === 0) return;
    setLoading(true);
    setSubmitError("");
    try {
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberId, initialMessage: message }),
      });
      const convData = await convRes.json();
      if (!convRes.ok) {
        setSubmitError(convData.error ?? "Bir hata oluştu. Lütfen tekrar dene.");
        setLoading(false);
        return;
      }
      const convId = convData.conversationId;
      for (const img of images) {
        const fd = new FormData();
        fd.append("type", "IMAGE");
        fd.append("image", img.file);
        await fetch(`/api/conversations/${convId}/messages`, { method: "POST", body: fd });
      }
      window.location.href = `/messages/${convId}`;
    } catch {
      setSubmitError("Bağlantı hatası. İnternet bağlantını kontrol et.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── STICKY ALT ÇUBUK ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4"
        style={{
          background: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.98) 60%, transparent 100%)",
          paddingTop: "16px",
          paddingBottom: "calc(max(20px, env(safe-area-inset-bottom)) + 4px)",
        }}>
        <div className="max-w-2xl mx-auto">
          {/* Üst bilgi çubuğu */}
          <div className="flex items-center gap-2 mb-2.5 px-1">
            {topSpec && (
              <div className="flex items-center gap-1.5" style={{ color: "var(--gold)" }}>
                <SpecialtyIcon specialties={specialties} />
                <span className="text-xs font-medium" style={{ color: "var(--gold-dark)", letterSpacing: "0.03em" }}>
                  {topSpec}
                </span>
              </div>
            )}
            <div className="flex-1" />
            <span className="text-zinc-600 text-[10px]">{responseLabel}</span>
            {isQuickReply && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
                style={{ background: "var(--gold-subtle)", border: "1px solid var(--gold-border)" }}>
                <span className="text-[9px]" style={{ color: "var(--gold)" }}>⚡ Hızlı Yanıt</span>
              </div>
            )}
          </div>

          {/* Butonlar */}
          <div className="flex gap-2.5">
            {/* Randevu Al butonu */}
            {appointmentSlot && (
              <div className="flex-1">{appointmentSlot}</div>
            )}

            {/* Ana buton — Danışma Başlat */}
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #222 100%)",
                color: "var(--gold)",
                border: "1px solid var(--gold-border)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                letterSpacing: "0.05em",
              }}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
              </svg>
              <span className="text-sm font-medium" style={{ letterSpacing: "0.04em" }}>Danış</span>
            </button>

            {/* WhatsApp butonu */}
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  background: "#0d1a10",
                  border: "1px solid rgba(74,222,128,0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  color: "#4ade80",
                }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Danışma Modalı ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{ background: "#111", border: "1px solid #1e1e1e", boxShadow: "0 -12px 48px rgba(0,0,0,0.7)" }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4"
              style={{ borderBottom: "1px solid #1e1e1e" }}>
              <div>
                <h2 className="text-white font-semibold tracking-tight">Danışma Talebi</h2>
                <p className="text-zinc-500 text-xs mt-0.5" style={{ letterSpacing: "0.02em" }}>{barberName}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                style={{ background: "#1a1a1a" }}>✕</button>
            </div>

            {/* Masteryn Güvencesi */}
            <div className="mx-5 mt-4 px-4 py-3 rounded-xl flex items-start gap-2.5"
              style={{ background: "var(--gold-subtle)", border: "1px solid var(--gold-border)" }}>
              <svg width="14" height="14" viewBox="0 0 100 100" className="flex-shrink-0 mt-0.5">
                <defs><linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DFC28A"/><stop offset="100%" stopColor="#A8894E"/>
                </linearGradient></defs>
                <path d="M29,4 L71,4 L96,29 L96,71 L71,96 L29,96 L4,71 L4,29 Z" fill="url(#mg)"/>
                <path d="M32,50 L44,63 L68,37" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(201,169,110,0.8)" }}>
                Bu konuşma Masteryn Güvencesi kapsamındadır. Usta tarafından verilen fiyat ve süre teklifleri
                {" "}<strong>dijital kayıt altına</strong> alınır.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">İsteğini anlat</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ne yapmak istediğini açıkla... Referans fotoğraf eklemek için aşağıdaki butonu kullan."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none resize-none transition-colors"
                  style={{ background: "#161616", border: "1px solid #252525" }} />
              </div>

              {/* Referans fotoğraflar */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  Referans / Mevcut Saç Fotoğrafı
                  <span className="normal-case text-zinc-700 tracking-normal ml-1">(max 3)</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group flex-shrink-0">
                      <Image src={img.preview} alt="" fill className="object-cover" />
                      <button onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-opacity">✕</button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-500 hover:text-zinc-300 text-xs transition-colors py-2 px-3 rounded-xl"
                      style={{ background: "#161616", border: "1px solid #252525" }}>
                      <span>📷</span> Ekle
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => handleImages(e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {submitError && (
                <p className="text-red-400 text-xs px-1">{submitError}</p>
              )}
              <button onClick={handleSubmit} disabled={loading || (!message.trim() && images.length === 0)}
                className="w-full py-3.5 rounded-2xl text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dark), var(--gold-light))",
                  color: "#0a0a0a",
                  fontWeight: "500",
                  letterSpacing: "0.04em",
                  boxShadow: "0 4px 16px var(--gold-glow)",
                }}>
                {loading ? "Gönderiliyor..." : "Danışma Gönder →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
