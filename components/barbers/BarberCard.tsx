"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  barber: {
    id: string; name: string; surname: string; salonName?: string | null;
    city: string; district?: string | null; avatar?: string | null;
    specialties: string[];
    overallScore: number; reviewCount: number;
    avgVisualFidelity?: number; avgTechnical?: number;
    avgTransparency?: number; avgExpectation?: number; avgCompensation?: number;
    posts: { images: { url: string }[] }[];
    _count: { receivedReviews: number; posts: number };
  };
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, val: boolean) => void;
}

const CRITERIA_LABELS = [
  { key: "avgVisualFidelity", label: "Görsel" },
  { key: "avgTechnical",      label: "Teknik" },
  { key: "avgTransparency",   label: "Şeffaflık" },
  { key: "avgExpectation",    label: "Beklenti" },
  { key: "avgCompensation",   label: "Telafi" },
] as const;

type Level = { label: string; roman: string; color: string; bg: string };
function getLevel(score: number | null): Level | null {
  if (score === null) return null;
  if (score >= 9.5) return { label: "EFSANEVİ", roman: "IV", color: "#FFD700", bg: "rgba(255,215,0,0.15)" };
  if (score >= 9.0) return { label: "MASTER",   roman: "III", color: "#C9A96E", bg: "rgba(201,169,110,0.15)" };
  if (score >= 8.0) return { label: "UZMAN",    roman: "II",  color: "#A8A8B8", bg: "rgba(168,168,184,0.15)" };
  if (score >= 7.0) return { label: "DENEYİMLİ", roman: "I", color: "#CD8C4A", bg: "rgba(205,140,74,0.15)" };
  return null;
}

function getSpecIcon(spec: string): { path: string; title: string } {
  const s = spec.toLowerCase();
  // Perma — dalga çizgileri
  if (s.includes("perma") || s.includes("kalıcı dalga") || s.includes("permanent"))
    return { title: "Perma",    path: "M3 9 Q5.5 6 8 9 Q10.5 12 13 9 Q15.5 6 18 9 Q20.5 12 21 9M3 15 Q5.5 12 8 15 Q10.5 18 13 15 Q15.5 12 18 15" };
  // Keratin — düz paralel çizgiler
  if (s.includes("keratin") || s.includes("brezilya") || s.includes("düzleş"))
    return { title: "Keratin",  path: "M5 8h14M5 12h14M5 16h10" };
  // Balayage — fırça darbesi
  if (s.includes("ombre") || s.includes("balay") || s.includes("highli") || s.includes("röfle"))
    return { title: "Balayage", path: "M4 20 L10 4M9 20 L15 4M14 20 L20 4" };
  // Renk — boya damlası
  if (s.includes("renk") || s.includes("boya") || s.includes("colour") || s.includes("color"))
    return { title: "Renk",     path: "M12 3 Q17 9 17 13 A5 5 0 0 1 7 13 Q7 9 12 3" };
  // Fön — spiral hava
  if (s.includes("stilis") || s.includes("şekillend") || s.includes("föhn") || s.includes("fön"))
    return { title: "Fön",      path: "M5 12 Q8 7 12 12 Q16 17 19 12M5 17 Q8 12 12 17" };
  // Bakım — yaprak
  if (s.includes("bakım") || s.includes("maske") || s.includes("nem") || s.includes("onarım"))
    return { title: "Bakım",    path: "M12 21 Q5 16 5 10 Q5 4 12 3 Q19 4 19 10 Q19 16 12 21M12 3 L12 21" };
  // Uzatma — ok yukarı + aşağı
  if (s.includes("uzat") || s.includes("rötar") || s.includes("eklem") || s.includes("kaynak"))
    return { title: "Uzatma",   path: "M12 4 L12 20M8 8 L12 4 L16 8M8 16 L12 20 L16 16" };
  // Varsayılan — makas
  return   { title: "Kesim",    path: "M5 5 L19 19M5 5 A3 3 0 1 0 8 8M19 19 A3 3 0 1 0 16 16M5 19 L9 15M19 5 L15 9" };
}

function StarRating({ score }: { score: number }) {
  const filled = Math.round(score / 2); // 0-10 → 0-5 stars
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-2.5 h-2.5"
          fill={i < filled ? "var(--gold)" : "none"}
          stroke={i < filled ? "var(--gold)" : "rgba(255,255,255,0.25)"}
          strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function BarberCard({ barber, isFavorite = false, onFavoriteToggle }: Props) {
  const [imgIdx,    setImgIdx]   = useState(0);
  const [fav,       setFav]      = useState(isFavorite);
  const [favLoad,   setFavLoad]  = useState(false);
  const [showKarne, setKarne]    = useState(false);

  const idHash = barber.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const VALID = [4, 6, 7, 8, 15, 16, 17, 18, 19, 20, 21];
  const staticFallback = `/images/barber${VALID[idHash % VALID.length]}.jpg`;

  const postPhotos = barber.posts
    .map((p) => p.images[0]?.url)
    .filter((u): u is string => !!u && u.startsWith("/uploads"))
    .slice(0, 4);

  const displayPhotos = barber.avatar
    ? [barber.avatar, ...postPhotos.filter(u => u !== barber.avatar)]
    : postPhotos.length > 0 ? postPhotos : [staticFallback];

  const score      = barber.reviewCount > 0 ? barber.overallScore : null;
  const level      = getLevel(score);
  const isAwarded  = score !== null && score >= 9.0;
  const isApproved = score !== null && score >= 8.0;
  const successPct = score ? Math.round((score / 10) * 100) : null;
  const hasAvgs    = (barber.avgVisualFidelity ?? 0) > 0;
  const specs      = barber.specialties.slice(0, 3);

  const salonName  = barber.salonName ?? `${barber.name} ${barber.surname}`;

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    if (favLoad) return;
    setFavLoad(true);
    const res  = await fetch(`/api/favorites/${barber.id}`, { method: "POST" });
    const data = await res.json();
    setFavLoad(false);
    if (res.ok) { setFav(data.favorited); onFavoriteToggle?.(barber.id, data.favorited); }
  }

  return (
    <Link href={`/profile/barber/${barber.id}`}
      className="group block"
      onMouseEnter={() => setKarne(true)}
      onMouseLeave={() => setKarne(false)}>

      <div className="relative overflow-hidden"
        style={{
          aspectRatio: "4/3",
          borderRadius: "16px",
          border: isAwarded
            ? "1px solid rgba(201,169,110,0.45)"
            : isApproved
            ? "1px solid rgba(168,168,184,0.3)"
            : "1px solid #222",
          boxShadow: isAwarded
            ? "0 2px 12px rgba(0,0,0,0.5), 0 0 18px rgba(201,169,110,0.1)"
            : "0 2px 12px rgba(0,0,0,0.5)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 28px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,169,110,0.2)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = isAwarded
            ? "0 2px 12px rgba(0,0,0,0.5), 0 0 18px rgba(201,169,110,0.1)"
            : "0 2px 12px rgba(0,0,0,0.5)";
        }}>

        {/* Fotoğraf */}
        {/\.(mp4|mov|webm)$/i.test(displayPhotos[imgIdx])
          ? <video key={imgIdx} src={displayPhotos[imgIdx]} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
          : <Image key={imgIdx} src={displayPhotos[imgIdx]} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        }
        {displayPhotos.length > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); setImgIdx((i) => (i-1+displayPhotos.length)%displayPhotos.length); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", color:"#fff" }}>‹</button>
            <button onClick={(e) => { e.preventDefault(); setImgIdx((i) => (i+1)%displayPhotos.length); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", color:"#fff" }}>›</button>
          </>
        )}

        {/* Gradyan overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 30%, rgba(0,0,0,0.78) 100%)" }} />

        {/* ── Üst sol: Ödül rozeti (9.0+) ── */}
        {isAwarded && (
          <div className="absolute top-0 left-0 z-10"
            style={{ padding: "7px 12px 7px 10px", borderBottomRightRadius: "12px",
              background: "linear-gradient(135deg, rgba(10,8,4,0.92) 0%, rgba(30,22,8,0.92) 100%)",
              backdropFilter: "blur(8px)",
              borderRight: "1px solid rgba(201,169,110,0.35)",
              borderBottom: "1px solid rgba(201,169,110,0.35)" }}>
            <div className="flex items-center gap-1.5">
              {/* Trophy icon */}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinecap="round">
                <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4M12 16c-3.3 0-6-2.7-6-6V3h12v7c0 3.3-2.7 6-6 6zM8 21h8M12 16v5"/>
              </svg>
              <span className="text-[9px] font-black tracking-[0.08em]" style={{ color:"var(--gold)" }}>
                MASTERYN ÖDÜLLÜ
              </span>
            </div>
          </div>
        )}

        {/* ── Üst sağ: Favori ── */}
        <button onClick={toggleFav} disabled={favLoad}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{
            background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)",
            border: fav ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: fav ? "#f87171" : "rgba(255,255,255,0.5)",
          }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
        </button>

        {/* ── Alt overlay: İsim + Seviye + Skor + İkonlar ── */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8 z-10">

          {/* Seviye pill */}
          {level && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded mb-1"
              style={{ background: level.bg, border: `1px solid ${level.color}33` }}>
              <span className="text-[8px] font-black tracking-[0.1em]" style={{ color: level.color }}>
                {level.roman && `${level.roman} `}{level.label}
              </span>
            </div>
          )}

          {/* İsim */}
          <h3 className="text-white font-bold text-sm leading-tight truncate"
            style={{ letterSpacing: "0.02em", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
            {salonName}
          </h3>

          {/* Şehir */}
          <p className="text-white/40 text-[10px] mt-0.5 truncate">
            {barber.city}{barber.district ? `, ${barber.district}` : ""}
          </p>

          {/* Yıldız + Skor */}
          {score !== null ? (
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating score={score} />
              <span className="text-[11px] font-black" style={{ color:"var(--gold)" }}>
                {score.toFixed(1)}
              </span>
              <span className="text-white/30 text-[9px]">/ 10</span>
            </div>
          ) : (
            <span className="text-white/25 text-[9px] mt-1 block">Henüz değerlendirme yok</span>
          )}

          {/* Uzmanlık ikonları + etiketler */}
          {specs.length > 0 && (
            <div className="flex items-end gap-2.5 mt-1.5">
              {specs.map((spec) => {
                const icon = getSpecIcon(spec);
                return (
                  <div key={spec} className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center justify-center rounded-full"
                      style={{ width:22, height:22, background:"rgba(255,255,255,0.09)",
                        border:"1px solid rgba(255,255,255,0.14)" }}>
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none"
                        stroke="rgba(255,255,255,0.6)" strokeWidth={1.8} strokeLinecap="round">
                        <path d={icon.path} />
                      </svg>
                    </div>
                    <span className="text-white/40 leading-none" style={{ fontSize:"7px" }}>
                      {icon.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ultra-ince success bar */}
          {successPct !== null && (
            <div className="mt-1.5 h-0.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.07)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${successPct}%`,
                  background: successPct>=90 ? "var(--gold)"
                    : successPct>=80 ? "linear-gradient(90deg,var(--copper),var(--gold))"
                    : "var(--copper)" }} />
            </div>
          )}
        </div>

        {/* ── Hover Güven Karnesi Overlay ── */}
        {showKarne && hasAvgs && (
          <div className="absolute inset-0 flex flex-col justify-center z-20 pointer-events-none"
            style={{ background:"rgba(0,0,0,0.9)", backdropFilter:"blur(3px)" }}>
            <div className="px-4">
              <p className="text-center text-[9px] uppercase tracking-[0.12em] mb-2.5"
                style={{ color:"var(--gold)" }}>Güven Karnesi</p>
              <div className="space-y-1.5">
                {CRITERIA_LABELS.map(({ key, label }) => {
                  const val = (barber[key as keyof typeof barber] as number) ?? 0;
                  const pct = (val / 5) * 100;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-zinc-500 text-[9px] w-14 text-right flex-shrink-0">{label}</span>
                      <div className="flex-1 h-0.5 rounded-full" style={{ background:"#222" }}>
                        <div className="h-full rounded-full"
                          style={{ width:`${pct}%`, background: pct>=80 ? "var(--gold)" : pct>=60 ? "#888" : "var(--copper)" }} />
                      </div>
                      <span className="text-[9px] font-bold w-4 text-right flex-shrink-0"
                        style={{ color: pct>=80 ? "var(--gold)" : "var(--copper)" }}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-center">
                <span className="text-sm font-black" style={{ color: (score ?? 0)>=8 ? "var(--gold)" : "var(--copper)" }}>
                  {score?.toFixed(1) ?? "—"}/10
                </span>
                <span className="text-zinc-600 text-[10px] ml-1.5">bileşik skor</span>
              </div>
              {/* Level in karne */}
              {level && (
                <div className="mt-2 text-center">
                  <span className="text-[9px] font-black tracking-[0.1em]" style={{ color: level.color }}>
                    {level.roman} {level.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slider dots */}
      {displayPhotos.length > 1 && (
        <div className="flex gap-1 justify-center mt-1.5">
          {displayPhotos.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{ width: i===imgIdx?"10px":"4px", height:"3px", background: i===imgIdx ? "var(--gold)" : "#333" }} />
          ))}
        </div>
      )}
    </Link>
  );
}
