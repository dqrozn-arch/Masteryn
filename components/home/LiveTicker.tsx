"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface TickerBarber {
  id: string; name: string; surname: string; salonName?: string | null;
  overallScore: number; specialties: string[];
  posts: { images: { url: string }[] }[];
}

interface Props { barbers: TickerBarber[]; }

export default function LiveTicker({ barbers }: Props) {
  const [offset,   setOffset]   = useState(0);
  const [paused,   setPaused]   = useState(false);
  const [hoveredId, setHovered] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const approved = barbers.filter((b) => b.overallScore >= 8);
  const all = [...approved, ...approved]; // duplicate for infinite scroll

  // Otomatik kaydırma
  useEffect(() => {
    if (paused) return;
    tickRef.current = setInterval(() => setOffset((o) => o + 1), 40);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [paused]);

  // Sürükleme
  function handleMouseDown(e: React.MouseEvent) {
    setPaused(true);
    setDragStart(e.clientX - dragOffset);
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (dragStart === null) return;
    setDragOffset(e.clientX - dragStart);
  }
  function handleMouseUp() {
    setDragStart(null);
    setPaused(false);
  }

  const itemWidth = 280; // px per item
  const totalWidth = approved.length * itemWidth;
  const scrollX = -(offset % totalWidth) + dragOffset;

  const hoveredBarber = hoveredId ? barbers.find((b) => b.id === hoveredId) : null;

  return (
    <div className="relative border-b select-none"
      style={{ borderColor: "rgba(201,169,110,0.1)", background: "#030303", cursor: dragStart !== null ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { handleMouseUp(); setHovered(null); }}>

      <div className="overflow-hidden py-3">
        <div className="flex items-center gap-0 whitespace-nowrap"
          style={{ transform: `translateX(${scrollX}px)`, transition: dragStart !== null ? "none" : "transform 0.04s linear", willChange: "transform" }}>
          {all.map((b, i) => {
            const isHigh = b.overallScore >= 9;
            return (
              <div key={`${b.id}-${i}`}
                className="inline-flex items-center gap-3 flex-shrink-0 px-6"
                style={{ width: `${itemWidth}px` }}
                onMouseEnter={(e) => {
                  setPaused(true);
                  setHovered(b.id);
                  setHoverPos({ x: e.currentTarget.getBoundingClientRect().left, y: e.currentTarget.getBoundingClientRect().bottom });
                }}
                onMouseLeave={() => { if (dragStart === null) setPaused(false); setHovered(null); }}>

                {/* Usta adı */}
                <span className="text-[10px] font-semibold uppercase"
                  style={{
                    letterSpacing: "0.15em",
                    color: hoveredId === b.id ? "rgba(201,169,110,0.8)" : "rgba(201,169,110,0.35)",
                    transition: "color 0.2s",
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontStyle: "italic",
                  }}>
                  {b.salonName ?? `${b.name} ${b.surname}`}
                </span>

                {/* Puan badge */}
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isHigh ? "rgba(201,169,110,0.12)" : "rgba(201,169,110,0.06)",
                    color: isHigh ? "var(--gold)" : "rgba(201,169,110,0.5)",
                    border: `1px solid ${isHigh ? "rgba(201,169,110,0.3)" : "rgba(201,169,110,0.1)"}`,
                    boxShadow: isHigh && hoveredId === b.id ? "0 0 8px rgba(201,169,110,0.3)" : "none",
                    transition: "all 0.2s",
                  }}>
                  ✓ {b.overallScore.toFixed(1)}
                </span>

                {/* Yıldız ayırıcı */}
                <svg width="8" height="8" viewBox="0 0 24 24" fill="rgba(201,169,110,0.15)">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover mikro kart — glassmorphism */}
      {hoveredBarber && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${hoverPos.y + 8}px`,
            left: `${Math.min(hoverPos.x, window.innerWidth - 220)}px`,
            width: "210px",
            background: "rgba(12,12,10,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(201,169,110,0.25)",
            borderRadius: "18px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(201,169,110,0.1)",
            overflow: "hidden",
            animation: "fadeUp 0.15s ease forwards",
          }}>
          {/* Kapak fotoğrafı */}
          {hoveredBarber.posts[0]?.images[0]?.url && (
            <div className="relative h-28 overflow-hidden">
              <img src={hoveredBarber.posts[0].images[0].url} alt=""
                className="w-full h-full object-cover" style={{ opacity: 0.75 }} />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(12,12,10,1) 0%, transparent 60%)" }} />
              {/* Filtresiz mühür */}
              <div className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded"
                style={{ background:"rgba(0,0,0,0.65)", color:"rgba(201,169,110,0.5)", border:"1px solid rgba(201,169,110,0.12)", letterSpacing:"0.1em" }}>
                FİLTRESİZ
              </div>
              {/* Puan overlay */}
              <div className="absolute bottom-2 left-3">
                <span className="text-2xl font-black" style={{ color:"var(--gold)", fontFamily:"var(--font-playfair),Georgia,serif", filter:"drop-shadow(0 0 8px rgba(201,169,110,0.4))" }}>
                  {hoveredBarber.overallScore.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          {/* Bilgi */}
          <div className="px-3.5 py-3">
            <p className="text-white text-xs font-semibold leading-tight mb-0.5"
              style={{ letterSpacing:"0.03em" }}>
              {hoveredBarber.salonName ?? `${hoveredBarber.name} ${hoveredBarber.surname}`}
            </p>
            {hoveredBarber.specialties[0] && (
              <p className="text-[10px]" style={{ color:"rgba(201,169,110,0.55)", letterSpacing:"0.06em" }}>
                {hoveredBarber.specialties[0]} Sanatçısı
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
