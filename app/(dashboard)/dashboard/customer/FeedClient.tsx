"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import BarberCard from "@/components/barbers/BarberCard";

interface Post {
  id: string; caption?: string | null; createdAt: string;
  images: { id: string; url: string; order: number }[];
  customer: { id: string; name: string; surname: string; avatar?: string | null };
  barber:   { id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null };
}

interface Barber {
  id: string; name: string; surname: string; salonName?: string | null;
  city: string; district?: string | null; avatar?: string | null;
  specialties: string[]; overallScore: number; reviewCount: number;
  avgVisualFidelity?: number; avgTechnical?: number;
  avgTransparency?: number; avgExpectation?: number; avgCompensation?: number;
  posts: { images: { url: string }[] }[];
  _count: { receivedReviews: number; posts: number };
}

interface Props {
  customerName: string; customerId: string;
  initialPosts: Post[]; featuredBarbers: Barber[];
}

// En çok arananlar → specialty değerleriyle eşlenmiş
const POPULAR_TAGS = [
  { label: "Sarı Saç",        specialty: "Saç Boyama" },
  { label: "Skin Fade",       specialty: "Skin Fade" },
  { label: "Doğal Renkler",   specialty: "Ombre" },
  { label: "Keratin",         specialty: "Keratin" },
  { label: "Balayage",        specialty: "Balayage" },
  { label: "Çocuk Kesimi",    specialty: "Çocuk Kesimi" },
  { label: "Klasik Kesim",    specialty: "Klasik Kesim" },
];

// Platformun ilkelerine göre filtreler
const PRINCIPLE_FILTERS = [
  { key: "trust",       label: "Güven Onaylı",   desc: "Bileşik skoru 8/10 ve üzeri olan, gerçek müşteri deneyimleriyle kanıtlanmış ustalar." },
  { key: "transparent", label: "Şeffaf Süreç",   desc: "Şeffaflık kriteri 4/5 ve üzeri — söz verdiklerini yapan, fiyat ve süre konusunda dürüst ustalar." },
  { key: "new",         label: "Yeni Ustalar",   desc: "Henüz değerlendirme almamış, ilk izlenimini bırakmaya hazır yeni zanaatkarlar." },
];

// Akıllı sıralama seçenekleri
const SORT_OPTIONS = [
  { key: "score",        label: "En Yüksek Skor",          desc: "Bileşik skor yüksekten düşüğe" },
  { key: "reviews",      label: "En Fazla Yorum",           desc: "Deneyimi kanıtlanmış ustalar" },
  { key: "transparent",  label: "En Şeffaf",                desc: "Şeffaflık kriteri yüksek olanlar" },
  { key: "visual",       label: "Görsel Sadakat",           desc: "Portfolyo ile sonucu en örtüşen ustalar" },
];

export default function FeedClient({ customerName, initialPosts, featuredBarbers }: Props) {
  const [query,       setQuery]      = useState("");
  const [activeTag,   setTag]        = useState("");
  const [activeFilters, setFilters]  = useState<Set<string>>(new Set());
  const [sortBy,      setSortBy]     = useState("score");
  const [tooltipKey,  setTooltip]    = useState<string | null>(null);
  const [tab,         setTab]        = useState<"explore" | "feed">("explore");
  const [posts,       setPosts]      = useState<Post[]>(initialPosts);
  const [postCursor,  setCursor]     = useState<string | null>(
    initialPosts.length === 12 ? initialPosts[initialPosts.length - 1].id : null
  );
  const [loadingMore, setLoadMore]   = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  function toggleFilter(key: string) {
    setFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const filtered = useMemo(() => {
    let result = [...featuredBarbers];
    const q = query.toLowerCase().trim();

    if (q || activeTag) {
      result = result.filter((b) => {
        const matchQ = !q || [b.name, b.surname, b.salonName ?? "", b.city, b.district ?? "", ...b.specialties]
          .some((s) => s.toLowerCase().includes(q));
        const matchT = !activeTag || b.specialties.includes(activeTag);
        return matchQ && matchT;
      });
    }

    if (activeFilters.has("trust"))       result = result.filter((b) => b.overallScore >= 8);
    if (activeFilters.has("new"))         result = result.filter((b) => b.reviewCount === 0);
    if (activeFilters.has("transparent")) result = result.filter((b) => (b.avgTransparency ?? 0) >= 4);

    // Akıllı sıralama
    result = [...result].sort((a, b) => {
      if (sortBy === "score")       return b.overallScore - a.overallScore;
      if (sortBy === "reviews")     return b.reviewCount - a.reviewCount;
      if (sortBy === "transparent") return (b.avgTransparency ?? 0) - (a.avgTransparency ?? 0);
      if (sortBy === "visual")      return (b.avgVisualFidelity ?? 0) - (a.avgVisualFidelity ?? 0);
      return 0;
    });

    return result;
  }, [featuredBarbers, query, activeTag, activeFilters]);

  async function loadMorePosts() {
    if (!postCursor || loadingMore) return;
    setLoadMore(true);
    const res  = await fetch(`/api/feed?cursor=${postCursor}`);
    const data = await res.json();
    setPosts((p) => [...p, ...data.posts]);
    setCursor(data.nextCursor);
    setLoadMore(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* ── Selamlama ── */}
      <div className="mb-6">
        <p className="text-zinc-600 text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">{customerName} 👋</h1>
      </div>

      {/* ── Tab Seçici ── */}
      <div className="flex bg-zinc-900 border border-white/5 rounded-2xl p-1 mb-6">
        {([["explore", "Keşfet"], ["feed", "Son Paylaşımlar"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}>{label}</button>
        ))}
      </div>

      {/* ── KEŞFET ── */}
      {tab === "explore" && (
        <div>
          {/* Hero arama barı */}
          <div className="relative mb-4">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
              style={{ background: "#161616", border: "1.5px solid #3a3a3a" }}>
              <svg className="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Semt veya uzmanlık yaz... (Ombre, Kadıköy)"
                className="flex-1 bg-transparent text-white placeholder-zinc-600 text-sm focus:outline-none" />
              {query && (
                <button onClick={() => setQuery("")} className="text-zinc-600 hover:text-zinc-400 text-lg">×</button>
              )}
            </div>
          </div>

          {/* En çok arananlar */}
          <div className="mb-5">
            <p className="text-zinc-600 text-xs mb-2.5 font-medium">En Çok Arananlar</p>
            <div className="flex gap-2 flex-wrap">
              {POPULAR_TAGS.map(({ label, specialty }) => (
                <button key={specialty}
                  onClick={() => setTag(activeTag === specialty ? "" : specialty)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    activeTag === specialty
                      ? "bg-amber-400/15 border-amber-400/40 text-amber-300 font-medium"
                      : "text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                  }`}
                  style={{ background: activeTag === specialty ? undefined : "#161616", borderColor: activeTag === specialty ? undefined : "#2a2a2a" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Prensip filtreleri + Sıralama */}
          <div className="mb-5 space-y-3">
            {/* Filtreler */}
            <div>
              <p className="text-zinc-600 text-xs mb-2 font-medium">Platform Filtreleri</p>
              <div className="flex gap-2 flex-wrap">
                {PRINCIPLE_FILTERS.map(({ key, label, desc }) => (
                  <div key={key} className="relative">
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => toggleFilter(key)}
                        className={`text-xs px-3 py-1.5 rounded-l-xl border-y border-l transition-all ${
                          activeFilters.has(key)
                            ? "font-semibold"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                        style={{
                          background: activeFilters.has(key) ? "var(--gold-subtle)" : "#161616",
                          borderColor: activeFilters.has(key) ? "var(--gold-border)" : "#2a2a2a",
                          color: activeFilters.has(key) ? "var(--gold)" : undefined,
                        }}>
                        {label}
                      </button>
                      {/* Info butonu */}
                      <button
                        onMouseEnter={() => setTooltip(key)}
                        onMouseLeave={() => setTooltip(null)}
                        className="px-1.5 py-1.5 rounded-r-xl border transition-all text-zinc-700 hover:text-zinc-400"
                        style={{
                          background: activeFilters.has(key) ? "var(--gold-subtle)" : "#161616",
                          borderColor: activeFilters.has(key) ? "var(--gold-border)" : "#2a2a2a",
                        }}>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                    {/* Tooltip */}
                    {tooltipKey === key && (
                      <div className="absolute top-full left-0 mt-2 w-56 z-50 p-3 rounded-xl text-xs text-zinc-400 leading-relaxed"
                        style={{ background: "#1a1a1a", border: "1px solid #303030", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
                        {desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sıralama */}
            <div>
              <p className="text-zinc-600 text-xs mb-2 font-medium">Sıralama</p>
              <div className="flex gap-2 flex-wrap">
                {SORT_OPTIONS.map(({ key, label, desc }) => (
                  <div key={key} className="relative">
                    <div className="flex items-center gap-0">
                      <button onClick={() => setSortBy(key)}
                        className={`text-xs px-3 py-1.5 rounded-l-xl border-y border-l transition-all ${
                          sortBy === key ? "font-semibold" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                        style={{
                          background: sortBy === key ? "#1a1a1a" : "#161616",
                          borderColor: sortBy === key ? "#404040" : "#2a2a2a",
                          color: sortBy === key ? "#fff" : undefined,
                        }}>
                        {label}
                      </button>
                      <button
                        onMouseEnter={() => setTooltip(`sort-${key}`)}
                        onMouseLeave={() => setTooltip(null)}
                        className="px-1.5 py-1.5 rounded-r-xl border transition-all text-zinc-700 hover:text-zinc-400"
                        style={{ background: sortBy === key ? "#1a1a1a" : "#161616", borderColor: sortBy === key ? "#404040" : "#2a2a2a" }}>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                    {tooltipKey === `sort-${key}` && (
                      <div className="absolute top-full left-0 mt-2 w-44 z-50 p-3 rounded-xl text-xs text-zinc-400 leading-relaxed"
                        style={{ background: "#1a1a1a", border: "1px solid #303030", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
                        {desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sonuç sayısı */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-zinc-400 text-sm font-medium">
              {query || activeTag || activeFilters.size > 0
                ? <>{filtered.length} usta bulundu</>
                : "Tüm Ustalar"}
            </p>
            {(query || activeTag || activeFilters.size > 0) && (
              <button onClick={() => { setQuery(""); setTag(""); setFilters(new Set()); }}
                className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Temizle</button>
            )}
          </div>

          {/* Usta grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-zinc-400 font-medium">Sonuç bulunamadı</p>
              <button onClick={() => { setQuery(""); setTag(""); setFilters(new Set()); }}
                className="mt-3 text-zinc-600 hover:text-zinc-400 text-sm transition-colors underline">
                Filtreyi temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((b) => <BarberCard key={b.id} barber={b} />)}
            </div>
          )}
        </div>
      )}

      {/* ── SON PAYLAŞIMLAR ── */}
      {tab === "feed" && (
        <div>
          {/* Öne çıkan ustalar — yatay scroll */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">Öne Çıkan Ustalar</p>
              <button onClick={() => setTab("explore")} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                Tümünü gör →
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {featuredBarbers.slice(0, 8).map((b) => {
                const coverImg = b.posts[0]?.images[0]?.url ?? null;
                return (
                  <Link key={b.id} href={`/profile/barber/${b.id}`} className="flex-shrink-0 group">
                    <div className="w-20 flex flex-col items-center gap-1.5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/8 group-hover:border-amber-400/40 transition-all">
                        {coverImg ? (
                          <Image src={coverImg} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-xl">
                            {b.name[0]}
                          </div>
                        )}
                        {b.overallScore >= 8 && (
                          <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-zinc-400 text-[10px] text-center truncate w-full group-hover:text-zinc-200 transition-colors leading-tight">
                        {b.salonName ?? b.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Ayırıcı */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-zinc-600 text-xs font-medium uppercase tracking-wider">Son Paylaşımlar</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Post akışı */}
          {posts.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-zinc-400 font-medium">Henüz paylaşım yok</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {posts.map((p) => (
                  <Link key={p.id} href={`/profile/barber/${p.barber.id}`}
                    className="glass rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
                    {p.images[0] && (
                      <div className="relative aspect-square bg-zinc-900">
                        <Image src={p.images[0].url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <p className="text-white text-xs font-medium truncate">
                            {p.barber.salonName ?? `${p.barber.name} ${p.barber.surname}`}
                          </p>
                          <p className="text-zinc-400 text-[10px]">{p.customer.name} {p.customer.surname}</p>
                        </div>
                      </div>
                    )}
                    {p.caption && (
                      <p className="text-zinc-500 text-xs px-3 py-2 truncate">{p.caption}</p>
                    )}
                  </Link>
                ))}
              </div>
              {postCursor && (
                <button onClick={loadMorePosts} disabled={loadingMore}
                  className="w-full mt-5 glass border border-white/8 hover:border-white/15 text-zinc-400 hover:text-white py-3.5 rounded-2xl text-sm font-medium transition-all disabled:opacity-50">
                  {loadingMore ? "Yükleniyor..." : "Daha Fazla Gör"}
                </button>
              )}
              {!postCursor && posts.length > 0 && (
                <p className="text-center text-zinc-700 text-xs mt-5">Tüm paylaşımlar gösterildi</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
