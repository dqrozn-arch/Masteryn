"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─── Types ─── */
interface Appointment {
  id: string; service: string; date: string; status: string;
  customer: { name: string; surname: string };
}
interface Campaign {
  id: string; title: string; discount?: number | null; validUntil?: string | null;
}
interface PostImage { url: string; order: number; }
interface Post {
  id: string; caption?: string | null; createdAt: string;
  images: PostImage[];
  customer: { name: string; surname: string; avatar?: string | null };
  _count?: { likes: number };
}
interface Profile {
  id: string; name: string; surname: string; salonName?: string | null;
  avatar?: string | null; city: string; overallScore: number; reviewCount: number;
}

/* ─── Yardımcılar ─── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} gün önce`;
  if (h > 0) return `${h} saat önce`;
  if (m > 0) return `${m} dk önce`;
  return "Az önce";
}
function timeLeft(v: string) {
  const diff = new Date(v).getTime() - Date.now();
  if (diff <= 0) return "Süresi doldu";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d} gün kaldı` : `${h} saat kaldı`;
}

/* ─── Lightbox ─── */
function Lightbox({ images, index, onClose }: { images: PostImage[]; index: number; onClose: () => void }) {
  const [cur, setCur] = useState(index);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCur(c => Math.min(c + 1, images.length - 1));
      if (e.key === "ArrowLeft")  setCur(c => Math.max(c - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)" }}
      onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-screen flex flex-col items-center"
        onClick={e => e.stopPropagation()}>
        {/* Kapat */}
        <button onClick={onClose}
          className="absolute -top-10 right-2 text-white text-2xl z-10">✕</button>

        {/* Görsel */}
        <div className="relative w-full" style={{ maxHeight: "80vh" }}>
          <Image src={images[cur].url} alt="" width={600} height={600}
            className="w-full object-contain rounded-2xl"
            style={{ maxHeight: "80vh" }} />
        </div>

        {/* Navigasyon */}
        {images.length > 1 && (
          <div className="flex items-center gap-4 mt-4">
            <button disabled={cur === 0} onClick={() => setCur(c => c - 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-20 transition-all"
              style={{ background: "rgba(255,255,255,0.1)" }}>‹</button>
            <div className="flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCur(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === cur ? "var(--gold)" : "rgba(255,255,255,0.3)" }} />
              ))}
            </div>
            <button disabled={cur === images.length - 1} onClick={() => setCur(c => c + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-20 transition-all"
              style={{ background: "rgba(255,255,255,0.1)" }}>›</button>
          </div>
        )}
        <p className="text-zinc-500 text-xs mt-2">{cur + 1} / {images.length}</p>
      </div>
    </div>
  );
}

/* ─── Post Kartı ─── */
function PostCard({ post, profile }: { post: Post; profile: Profile }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [liked, setLiked]       = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0);
  const [liking, setLiking]     = useState(false);

  async function toggleLike() {
    if (liking) return;
    setLiking(true);
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const d = await res.json();
    setLiked(d.liked);
    setLikeCount(d.count);
    setLiking(false);
  }

  const imgs = post.images.sort((a, b) => a.order - b.order);
  const isMulti = imgs.length > 1;

  return (
    <>
      {lightbox !== null && (
        <Lightbox images={imgs} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      <article className="rounded-2xl overflow-hidden"
        style={{ background: "#111", border: "1px solid #1e1e1e" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: "1px solid var(--gold-border)" }}>
            {profile.avatar ? (
              <Image src={profile.avatar} alt="" width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "linear-gradient(135deg, var(--gold-dark), var(--copper))" }}>
                {profile.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              {profile.salonName ?? `${profile.name} ${profile.surname}`}
            </p>
            <p className="text-zinc-600 text-xs">{timeAgo(post.createdAt)}</p>
          </div>
          {isMulti && (
            <div className="flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "#6b7280" }}>
              1/{imgs.length}
            </div>
          )}
        </div>

        {/* Görsel */}
        {imgs.length > 0 && (
          <div className="relative w-full cursor-zoom-in" style={{ aspectRatio: "4/3" }}
            onClick={() => setLightbox(0)}>
            <Image src={imgs[0].url} alt={post.caption ?? ""} fill className="object-cover" />
            {isMulti && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
                +{imgs.length - 1}
              </div>
            )}
            {/* Görüntüle ipucu */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.3)" }}>
              <div className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                🔍 Büyüt
              </div>
            </div>
          </div>
        )}

        {/* Etkileşim çubuğu */}
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center gap-4">
            {/* Beğen */}
            <button onClick={toggleLike} disabled={liking}
              className="flex items-center gap-1.5 transition-all active:scale-90">
              <svg className="w-5 h-5 transition-all" viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
              </svg>
              <span className="text-xs font-medium transition-all"
                style={{ color: liked ? "#ef4444" : "#6b7280" }}>
                {likeCount > 0 ? likeCount : "Beğen"}
              </span>
            </button>

            {/* Çoklu görsel butonu */}
            {isMulti && (
              <button onClick={() => setLightbox(0)}
                className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-400 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="2" y="2" width="9" height="9" rx="1"/>
                  <rect x="13" y="2" width="9" height="9" rx="1"/>
                  <rect x="2" y="13" width="9" height="9" rx="1"/>
                  <rect x="13" y="13" width="9" height="9" rx="1"/>
                </svg>
                <span className="text-xs">{imgs.length} fotoğraf</span>
              </button>
            )}

            {/* Masteryn güvence rozeti */}
            <div className="ml-auto flex items-center gap-1"
              style={{ color: "var(--gold-dark)" }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 100 100">
                <path d="M29,4 L71,4 L96,29 L96,71 L71,96 L29,96 L4,71 L4,29 Z" fill="currentColor" opacity={0.3}/>
                <path d="M32,50 L44,63 L68,37" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] font-semibold" style={{ color: "var(--gold-dark)" }}>Filtresiz</span>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-zinc-300 text-sm leading-relaxed">
              <span className="text-white font-semibold mr-1.5">
                {profile.salonName ?? profile.name}
              </span>
              {post.caption}
            </p>
          )}

          {/* Müşteri */}
          <p className="text-zinc-600 text-xs">
            Müşteri: {post.customer.name} {post.customer.surname}
          </p>
        </div>
      </article>
    </>
  );
}

/* ─── Hızlı Paylaşım ─── */
function QuickPost({ onDone }: { onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles]       = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption]   = useState("");
  const [loading, setLoading]   = useState(false);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const sel = Array.from(e.target.files ?? []).slice(0, 5);
    setFiles(sel);
    setPreviews(sel.map(f => URL.createObjectURL(f)));
  }

  async function submit() {
    if (!files.length) return;
    setLoading(true);
    const fd = new FormData();
    files.forEach(f => fd.append("images", f));
    if (caption) fd.append("caption", caption);
    await fetch("/api/barber/portfolio", { method: "POST", body: fd });
    setLoading(false);
    setFiles([]); setPreviews([]); setCaption("");
    onDone();
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-zinc-600"
          style={{ background: "#1a1a1a" }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
        </div>
        <button onClick={() => inputRef.current?.click()}
          className="flex-1 text-left text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
          Çalışmalarını paylaş…
        </button>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={pick} />
        <button onClick={() => inputRef.current?.click()}
          className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex-shrink-0"
          style={{ background: "var(--gold-subtle)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
          📷 Ekle
        </button>
      </div>

      {previews.length > 0 && (
        <div className="p-4 space-y-3">
          <div className={`grid gap-1.5 ${previews.length === 1 ? "grid-cols-1" : previews.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
            {previews.map((p, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden"
                style={{ aspectRatio: previews.length === 1 ? "4/3" : "1" }}>
                <Image src={p} alt="" fill className="object-cover" />
                <button onClick={() => { setFiles(f => f.filter((_, idx) => idx !== i)); setPreviews(pr => pr.filter((_, idx) => idx !== i)); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                  style={{ background: "rgba(0,0,0,0.7)" }}>✕</button>
              </div>
            ))}
          </div>
          <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={2}
            placeholder="Açıklama ekle…"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
          <div className="flex gap-2">
            <button onClick={() => { setFiles([]); setPreviews([]); }}
              className="flex-1 py-2 rounded-xl text-sm text-zinc-500" style={{ background: "#1a1a1a" }}>İptal</button>
            <button disabled={loading} onClick={submit}
              className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--gold)", color: "#0a0a0a" }}>
              {loading ? "Yükleniyor…" : "Paylaş"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Hızlı Kampanya ─── */
function QuickCampaign({ barberId, campaigns, onDone }: { barberId: string; campaigns: Campaign[]; onDone: () => void }) {
  const [open, setOpen]       = useState(false);
  const [title, setTitle]     = useState("");
  const [discount, setDiscount] = useState("");
  const [hours, setHours]     = useState("24");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setLoading(true);
    const validUntil = hours ? new Date(Date.now() + Number(hours) * 3600000).toISOString() : null;
    await fetch(`/api/barbers/${barberId}/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, discount: discount ? Number(discount) : null, validUntil }),
    });
    setLoading(false);
    setTitle(""); setDiscount(""); setHours("24"); setOpen(false);
    onDone();
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: campaigns.length > 0 || open ? "1px solid #1a1a1a" : "none" }}>
        <p className="text-white text-sm font-semibold flex items-center gap-2">
          <span>⚡</span> Kampanyalar
          {campaigns.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-lg font-medium"
              style={{ background: "var(--gold-subtle)", color: "var(--gold)" }}>
              {campaigns.length} aktif
            </span>
          )}
        </p>
        <button onClick={() => setOpen(v => !v)}
          className="text-xs px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: open ? "rgba(239,68,68,0.08)" : "var(--gold-subtle)",
            color: open ? "#ef4444" : "var(--gold)",
            border: `1px solid ${open ? "rgba(239,68,68,0.2)" : "var(--gold-border)"}`,
          }}>
          {open ? "✕ Kapat" : "+ Yeni"}
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Başlık * — ör. Bugün %20 indirim"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
              placeholder="% İndirim"
              className="rounded-xl px-3 py-2.5 text-sm text-white"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
            <select value={hours} onChange={e => setHours(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm text-white"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", colorScheme: "dark" }}>
              <option value="2">2 saat</option>
              <option value="6">6 saat</option>
              <option value="12">12 saat</option>
              <option value="24">1 gün</option>
              <option value="48">2 gün</option>
              <option value="">Süresiz</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-sm text-zinc-500" style={{ background: "#1a1a1a" }}>İptal</button>
            <button disabled={!title.trim() || loading} onClick={submit}
              className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--gold)", color: "#0a0a0a" }}>
              {loading ? "…" : "⚡ Yayınla"}
            </button>
          </div>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
          {campaigns.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              {c.discount && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                  style={{ background: "var(--gold)", color: "#0a0a0a" }}>%{c.discount}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{c.title}</p>
                {c.validUntil && <p className="text-zinc-600 text-xs">{timeLeft(c.validUntil)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Ana bileşen ─── */
export default function BarberFeedTab({ profile, recentPosts }: { profile: Profile; recentPosts: Post[] }) {
  const [posts, setPosts]           = useState<Post[]>(recentPosts);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [refresh, setRefresh]       = useState(0);
  const bump = useCallback(() => setRefresh(r => r + 1), []);

  useEffect(() => {
    // Bugünün randevuları
    fetch("/api/appointments").then(r => r.json()).then(d => {
      const todayStr = new Date().toLocaleDateString("sv");
      setTodayAppts((d.appointments ?? []).filter((a: Appointment) =>
        new Date(a.date).toLocaleDateString("sv") === todayStr &&
        ["PENDING","CONFIRMED"].includes(a.status)
      ));
    }).catch(() => {});

    // Kampanyalar
    fetch(`/api/barbers/${profile.id}/campaigns`).then(r => r.json())
      .then(d => setCampaigns(d.campaigns ?? [])).catch(() => {});

    // Postlar (beğeni sayısıyla)
    fetch(`/api/posts?barberId=${profile.id}&withLikes=1`).then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPosts(d); }).catch(() => {});
  }, [profile.id, refresh]);

  const STATUS_COLOR: Record<string, string> = { PENDING: "#f59e0b", CONFIRMED: "#10b981" };
  const STATUS_LABEL: Record<string, string> = { PENDING: "Bekliyor", CONFIRMED: "Onaylandı" };

  return (
    <div className="space-y-4">

      {/* ── Bugün ── */}
      {todayAppts.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <p className="text-white text-sm font-semibold">📅 Bugün</p>
            <span className="text-zinc-600 text-xs">
              {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
            {todayAppts.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "#1e1e1e" }}>{a.customer.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{a.customer.name} {a.customer.surname}</p>
                  <p className="text-zinc-500 text-xs">{a.service}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-semibold">
                    {new Date(a.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs" style={{ color: STATUS_COLOR[a.status] }}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Kampanyalar ── */}
      <QuickCampaign barberId={profile.id} campaigns={campaigns} onDone={bump} />

      {/* ── Paylaşım kutusu ── */}
      <QuickPost onDone={bump} />

      {/* ── Profil linki ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-zinc-600 text-xs">{posts.length} paylaşım</p>
        <Link href={`/profile/barber/${profile.id}`} target="_blank"
          className="text-xs flex items-center gap-1"
          style={{ color: "var(--gold)" }}>
          Profilimi görüntüle ↗
        </Link>
      </div>

      {/* ── Feed ── */}
      {posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
          <p className="text-4xl mb-3">📸</p>
          <p className="text-zinc-500 text-sm">Henüz paylaşım yok</p>
          <p className="text-zinc-700 text-xs mt-1">İlk çalışmanı yukarıdan paylaş</p>
        </div>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} profile={profile} />)
      )}
    </div>
  );
}
