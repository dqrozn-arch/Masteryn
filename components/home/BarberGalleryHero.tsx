"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface GalleryPost {
  id: string;
  images: { url: string }[];
  barber: {
    id: string; name: string; surname: string;
    salonName?: string | null; overallScore: number; specialties: string[];
  };
}

interface Props { posts: GalleryPost[]; tickerOnly?: boolean; }

// Mosaic layout: kolona göre sıralama ve boyut
const MOSAIC_LAYOUT = [
  { span: "row-span-2", aspect: "aspect-[3/4]" },  // Büyük dikey
  { span: "row-span-1", aspect: "aspect-[4/3]" },  // Normal yatay
  { span: "row-span-1", aspect: "aspect-[4/3]" },
  { span: "row-span-2", aspect: "aspect-[2/3]" },  // Büyük dikey
  { span: "row-span-1", aspect: "aspect-square"  },
  { span: "row-span-1", aspect: "aspect-[4/3]" },
  { span: "row-span-2", aspect: "aspect-[3/4]" },
  { span: "row-span-1", aspect: "aspect-square"  },
  { span: "row-span-1", aspect: "aspect-[4/3]" },
];

export default function BarberGalleryHero({ posts, tickerOnly = false }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [ticker, setTicker] = useState(0);

  // Üst ticker otomatik kaydırma
  useEffect(() => {
    const id = setInterval(() => setTicker((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const displayed = posts.slice(0, 9);
  if (displayed.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden" style={{ background: "#050505" }}>

      {/* ── Ticker şeridi ── */}
      <div className="overflow-hidden border-b" style={{ borderColor: "rgba(201,169,110,0.1)", background: "#030303" }}>
        <div className="flex items-center gap-8 px-6 py-2.5 whitespace-nowrap"
          style={{
            transform: `translateX(-${ticker * 32}px)`,
            transition: "transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}>
          {[...posts, ...posts].map((p, i) => (
            <div key={`${p.id}-${i}`} className="inline-flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(201,169,110,0.4)", letterSpacing: "0.15em" }}>
                {p.barber.salonName ?? `${p.barber.name} ${p.barber.surname}`}
              </span>
              {p.barber.overallScore >= 8 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(201,169,110,0.08)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.15)" }}>
                  ✓ {p.barber.overallScore.toFixed(1)}
                </span>
              )}
              <span style={{ color: "rgba(255,255,255,0.06)" }}>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mosaic galeri — tickerOnly modunda gizli ── */}
      {tickerOnly ? null : (<>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 auto-rows-[160px] sm:auto-rows-[180px]"
        style={{ gap: "2px" }}>
        {displayed.map((p, i) => {
          const layout = MOSAIC_LAYOUT[i % MOSAIC_LAYOUT.length];
          const isHovered = activeIdx === i;
          const imgUrl = p.images[0]?.url;
          if (!imgUrl) return null;

          return (
            <Link
              key={p.id}
              href={`/profile/barber/${p.barber.id}`}
              className={`relative overflow-hidden group ${layout.span}`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              style={{ gridRow: layout.span }}>

              <Image src={imgUrl} alt={p.barber.salonName ?? p.barber.name}
                fill className="object-cover transition-transform duration-700"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw" />

              {/* Karanlık overlay */}
              <div className="absolute inset-0 transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)", opacity: isHovered ? 0.9 : 0.5 }} />

              {/* Masteryn Onaylı rozet */}
              {p.barber.overallScore >= 8 && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(201,169,110,0.3)", backdropFilter: "blur(6px)" }}>
                  <svg width="8" height="8" viewBox="0 0 100 100">
                    <defs><linearGradient id={`g${i}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#DFC28A"/><stop offset="100%" stopColor="#A8894E"/></linearGradient></defs>
                    <path d="M29,4 L71,4 L96,29 L96,71 L71,96 L29,96 L4,71 L4,29 Z" fill={`url(#g${i})`}/>
                    <path d="M30,50 L43,63 L70,36" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[9px] font-bold" style={{ color: "var(--gold)" }}>{p.barber.overallScore.toFixed(1)}</span>
                </div>
              )}

              {/* Hover: salon adı + uzmanlık */}
              <div className={`absolute bottom-0 left-0 right-0 p-2.5 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                <p className="text-white text-xs font-semibold truncate leading-tight"
                  style={{ letterSpacing: "0.02em" }}>
                  {p.barber.salonName ?? `${p.barber.name} ${p.barber.surname}`}
                </p>
                {p.barber.specialties[0] && (
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(201,169,110,0.7)" }}>
                    {p.barber.specialties[0]}
                  </p>
                )}
              </div>

              {/* "Filtresiz" stamp — sadece hover'da */}
              {isHovered && (
                <div className="absolute top-2 right-2">
                  <div className="text-[8px] px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.6)", color: "rgba(201,169,110,0.6)", border: "1px solid rgba(201,169,110,0.15)", letterSpacing: "0.08em" }}>
                    FİLTRESİZ
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Alt vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.85) 50%, transparent 100%)" }} />
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(201,169,110,0.35)", letterSpacing: "0.2em" }}>
          Masteryn Onaylı Kuaförlük Portföyleri
        </p>
      </div>
      </>)}
    </div>
  );
}
