"use client";

import { useState, useMemo } from "react";
import BarberCard from "@/components/barbers/BarberCard";

const SPECIALTIES = [
  "Skin Fade", "Deri Kesim", "Klasik Kesim",
  "Saç Boyama", "Röfle", "Balayage", "Keratin",
  "Çocuk Kesimi", "Afro Kesim", "Ombre", "Saç Bakımı",
];

type Barber = {
  id: string; name: string; surname: string; salonName?: string | null;
  city: string; district?: string | null; avatar?: string | null;
  specialties: string[]; overallScore: number;
  reviewCount: number;
  posts: { images: { url: string }[] }[];
  _count: { receivedReviews: number; posts: number };
};

export default function DiscoverClient({ barbers }: { barbers: Barber[] }) {
  const [query, setQuery]    = useState("");
  const [specialty, setSpec] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return barbers.filter((b) => {
      const matchQ = !q || [b.name, b.surname, b.salonName ?? "", b.city, b.district ?? "", ...b.specialties]
        .some((s) => s.toLowerCase().includes(q));
      const matchS = !specialty || b.specialties.includes(specialty);
      return matchQ && matchS;
    });
  }, [barbers, query, specialty]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">Keşfet</h1>

      {/* Arama */}
      <div className="glass border border-white/10 rounded-2xl flex items-center gap-3 px-4 py-3 mb-5 focus-within:border-white/20 transition-all">
        <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="İsim, salon, uzmanlık veya semt..."
          className="flex-1 bg-transparent text-white placeholder-zinc-700 text-sm focus:outline-none" />
        {query && (
          <button onClick={() => setQuery("")} className="text-zinc-600 hover:text-zinc-400 transition-colors">×</button>
        )}
      </div>

      {/* Uzmanlık filtreleri */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setSpec("")}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
            !specialty ? "bg-white text-zinc-900 font-semibold border-white" : "glass border-white/8 text-zinc-500 hover:text-zinc-300"
          }`}>Tümü</button>
        {SPECIALTIES.map((s) => (
          <button key={s} onClick={() => setSpec(specialty === s ? "" : s)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
              specialty === s ? "bg-amber-400/15 border-amber-400/40 text-amber-300 font-medium" : "glass border-white/8 text-zinc-500 hover:text-zinc-300"
            }`}>{s}</button>
        ))}
      </div>

      {/* Sonuç sayısı */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-zinc-600 text-sm">{filtered.length} usta</p>
        {(query || specialty) && (
          <button onClick={() => { setQuery(""); setSpec(""); }}
            className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Temizle</button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-zinc-400 text-sm font-medium">Sonuç bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((b) => <BarberCard key={b.id} barber={b} />)}
        </div>
      )}
    </div>
  );
}
