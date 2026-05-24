"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import BarberDashboardClient from "./BarberDashboardClient";
import BarberTabsWrapper from "./BarberTabsWrapper";
import BarberAppointmentsPanel from "./BarberAppointmentsPanel";
import BarberCampaignsPanel from "./BarberCampaignsPanel";
import BarberQRCard from "@/components/barbers/BarberQRCard";

function PortfolioUploader({ recentPosts }: { recentPosts: Post[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles]       = useState<File[]>([]);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
    setDone(false);
  }

  async function upload() {
    if (!files.length) return;
    setLoading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    await fetch("/api/barber/portfolio", { method: "POST", body: fd });
    setLoading(false);
    setDone(true);
    setFiles([]);
    setPreviews([]);
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <>
      {/* Mevcut fotoğraflar */}
      {recentPosts.length > 0 && (
        <div className="grid grid-cols-3 gap-1 p-1 mb-1">
          {recentPosts.slice(0, 6).map((p) => p.images[0] && (
            <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image src={p.images[0].url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-1.5 left-1.5">
                <div className="text-[8px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(0,0,0,0.7)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                  ✓ FİLTRESİZ
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yükleme alanı */}
      <div className="px-4 pb-4">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

        {previews.length > 0 ? (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {previews.map((src, i) => (
                <div key={i} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={upload} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: loading ? "rgba(201,169,110,0.3)" : "var(--gold)", color: "#0a0a0a" }}>
                {loading ? "Yükleniyor..." : `${files.length} Fotoğraf Yükle`}
              </button>
              <button onClick={() => { setFiles([]); setPreviews([]); }}
                className="px-4 py-2.5 rounded-xl text-sm text-zinc-500 border border-zinc-800">
                İptal
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => inputRef.current?.click()}
            className="w-full py-3 rounded-xl text-sm font-medium border border-dashed transition-all"
            style={{ borderColor: "rgba(201,169,110,0.3)", color: "rgba(201,169,110,0.7)", background: "rgba(201,169,110,0.03)" }}>
            {done ? "✅ Fotoğraflar yüklendi!" : "+ Portföy Fotoğrafı Ekle"}
          </button>
        )}
      </div>
    </>
  );
}

const CRITERIA = [
  { key: "avgVisualFidelity",  label: "Görsel Sadakat",    icon: "📷" },
  { key: "avgTechnical",       label: "Teknik Uzmanlık",   icon: "✂" },
  { key: "avgTransparency",    label: "Süreç Şeffaflığı",  icon: "◎" },
  { key: "avgExpectation",     label: "Beklenti Yönetimi", icon: "💬" },
  { key: "avgCompensation",    label: "Telafi Yaklaşımı",  icon: "🛡" },
] as const;

// Her gün farklı, yüzde verili koçluk ipuçları
const TIPS = [
  { text: "Randevu öncesi fiyat onayı almak şeffaflık puanını ortalama %15 artırıyor.", icon: "💡" },
  { text: "Saçın kaldıramayacağı bir işlemi dürüstçe reddeden ustalar beklenti puanında %20 öne çıkıyor.", icon: "🏆" },
  { text: "İşlem süresi konusunda dürüst tahmin veren ustalar %30 daha az şikayet alıyor.", icon: "⏱" },
  { text: "Telafi teklifini 24 saat içinde yapan ustalar düşük yorumlarını %60 oranında geri kazanıyor.", icon: "🤝" },
  { text: "Filtresiz fotoğraf paylaşan ustalar görsel sadakat puanını %25 daha hızlı yükseltiyor.", icon: "📸" },
  { text: "İşveren onaylı iş geçmişi olan ustalar %40 daha fazla favori listesine ekleniyor.", icon: "✦" },
  { text: "Haftada en az 1 paylaşım yapan ustalar profil görüntülenmesini %50 artırıyor.", icon: "📈" },
];

// Skor → platform yüzdesi (tahmini)
function getPercentile(score: number): string | null {
  if (score <= 0)  return null;
  if (score >= 9.5) return "En iyi %1";
  if (score >= 9.0) return "En iyi %5";
  if (score >= 8.5) return "En iyi %10";
  if (score >= 8.0) return "En iyi %20";
  if (score >= 7.5) return "En iyi %40";
  return null;
}

interface Review {
  id: string; createdAt: Date | string;
  visualFidelity: number; technicalSkill: number; processTransparency: number;
  expectationMgmt: number; compensationScore: number; comment?: string | null;
  images: { url: string }[];
  customer: { id: string; name: string; surname: string; avatar?: string | null };
}

interface Post {
  id: string; createdAt: Date | string; caption?: string | null;
  images: { url: string }[];
  customer: { id: string; name: string; surname: string };
  barber: { id: string; name: string; surname: string; salonName?: string | null };
}

interface Workplace {
  id: string; salonName: string; city?: string | null; role?: string | null;
  startYear: number; endYear?: number | null; isCurrent: boolean;
  isVerified: boolean; verifierName?: string | null;
}
interface Certificate {
  id: string; name: string; issuer?: string | null; year?: number | null; description?: string | null;
}

interface Props {
  profile: {
    id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null;
    city: string; district?: string | null; phone?: string | null; bio?: string | null;
    username?: string | null;
    overallScore: number; reviewCount: number;
    avgVisualFidelity: number; avgTechnical: number; avgTransparency: number;
    avgExpectation: number; avgCompensation: number;
    specialties: string[];
    postCount: number; favCount: number; hasVerifiedWork: boolean; memberYears: number;
  };
  reviews: Review[];
  recentPosts: Post[];
  telafi: Review[];
  weeklyTrend: number | null;
  recentReviewCount: number;
  workplaces: Workplace[];
  certificates: Certificate[];
}

function ScoreArc({ score }: { score: number }) {
  const r    = 54;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(score / 10, 1);
  const dash = circ * pct;
  const gap  = circ - dash;
  const color = score >= 8 ? "var(--gold)" : score >= 6 ? "var(--copper)" : "#ef4444";
  const glow  = score >= 8 ? "rgba(201,169,110,0.4)" : score >= 6 ? "rgba(184,115,51,0.3)" : "rgba(239,68,68,0.25)";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a1a" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10"
          stroke={color} strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }} />
        {/* 8/10 eşik işareti */}
        <line x1="60" y1="6" x2="60" y2="16" stroke="#2a2a2a" strokeWidth="2.5"
          transform={`rotate(${8 / 10 * 360} 60 60)`} />
        <text transform={`rotate(${8 / 10 * 360 + 90} 60 60) translate(0 -42)`}
          textAnchor="middle" fill="#333" fontSize="7" fontWeight="600">8</text>
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black leading-none" style={{ color }}>
          {score > 0 ? score.toFixed(1) : "—"}
        </div>
        <div className="text-zinc-600 text-xs mt-0.5">/ 10</div>
        {score >= 8 && (
          <div className="text-[9px] font-semibold mt-1 px-2 py-0.5 rounded-full"
            style={{ background: "var(--gold-subtle)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
            ONAYLI
          </div>
        )}
      </div>
    </div>
  );
}

export default function BarberPerformanceDashboard({
  profile, reviews, recentPosts, telafi, weeklyTrend, recentReviewCount, workplaces, certificates,
}: Props) {
  const score       = profile.overallScore;
  const isAtRisk    = score > 0 && score < 8;
  const isBelowBar  = score > 0 && score < 7;
  const distanceTo8 = score > 0 ? Math.max(0, 8 - score).toFixed(1) : null;
  const tip         = TIPS[new Date().getDay() % TIPS.length];
  const percentile  = getPercentile(score);

  const criteriaValues = CRITERIA.map(({ key, label, icon }) => ({
    label, icon, key, value: profile[key as keyof typeof profile] as number,
  }));
  const sorted    = [...criteriaValues].sort((a, b) => b.value - a.value);
  const strongest = profile.reviewCount > 0 ? sorted[0] : null;
  const weakest   = profile.reviewCount > 0 && sorted[4].value < 4 ? sorted[4] : null;

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">


        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/" />
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl overflow-hidden flex-shrink-0"
                style={{ border: "1px solid var(--gold-border)" }}>
                {profile.avatar ? (
                  <Image src={profile.avatar} alt="" width={28} height={28} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background: "linear-gradient(135deg, var(--gold-dark), var(--copper))" }}>
                    {profile.name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  {profile.salonName ?? `${profile.name} ${profile.surname}`}
                </p>
                <p className="text-zinc-600 text-xs">{profile.city}{profile.district ? `, ${profile.district}` : ""}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/barber/messages"
              className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              style={{ background: "#161616", border: "1px solid #252525" }}>
              💬 <span>Mesajlar</span>
            </Link>
            <Link href="/dashboard/barber/edit"
              className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
              style={{ background: "#161616", border: "1px solid #252525" }}>✏</Link>
            <Link href={`/profile/barber/${profile.id}`} target="_blank"
              className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
              style={{ background: "#161616", border: "1px solid #252525" }}>↗</Link>
            <BarberQRCard barberId={profile.id} barberName={profile.salonName ?? `${profile.name} ${profile.surname}`} />
          </div>
        </div>

        {/* ── Sekmeli içerik ── */}
        <BarberTabsWrapper
          profile={{
            id: profile.id, name: profile.name, surname: profile.surname,
            salonName: profile.salonName, avatar: profile.avatar,
            bio: profile.bio, phone: profile.phone,
            specialties: profile.specialties,
            overallScore: profile.overallScore, reviewCount: profile.reviewCount,
            postCount: profile.postCount, favCount: profile.favCount,
            hasVerifiedWork: profile.hasVerifiedWork, memberYears: profile.memberYears,
            city: profile.city ?? "",
          }}
          workplaces={workplaces}
          certificates={certificates}
          recentPosts={recentPosts as never}
        >

        {/* ── Risk Uyarıları ── */}
        {isBelowBar && (
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span className="text-red-400 text-xl flex-shrink-0">⚠</span>
            <div>
              <p className="text-red-300 font-semibold text-sm">Profiliniz Risk Altında</p>
              <p className="text-red-400/70 text-xs mt-0.5 leading-relaxed">
                Bileşik skorunuz 7/10 barajının altında. Yeni değerlendirme almak veya telafi mekanizmasını kullanmak profilinizi kurtarabilir.
              </p>
            </div>
          </div>
        )}
        {isAtRisk && !isBelowBar && (
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <span className="text-amber-400 text-xl flex-shrink-0">◎</span>
            <div>
              <p className="text-amber-300 font-semibold text-sm">8/10 Güven Onayına {distanceTo8} puan kaldı</p>
              <p className="text-amber-400/60 text-xs mt-0.5 leading-relaxed">
                Birkaç olumlu değerlendirme seni Güven Onaylı statüsüne taşıyabilir.
              </p>
            </div>
          </div>
        )}

        {/* ── İtibar Karnesi ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium">İtibar Karnesi</p>
            <div className="flex items-center gap-2">
              {percentile && (
                <span className="text-xs px-2.5 py-1 rounded-xl font-semibold"
                  style={{ background: "var(--gold-subtle)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                  {percentile}
                </span>
              )}
              {profile.reviewCount > 0 && (
                <span className="text-zinc-600 text-xs">{profile.reviewCount} yorum</span>
              )}
            </div>
          </div>

          {profile.reviewCount === 0 ? (
            <div className="text-center py-10 px-5">
              <p className="text-zinc-600 text-sm">Henüz değerlendirme yok</p>
              <p className="text-zinc-700 text-xs mt-1">İlk müşteri değerlendirmenden sonra karnen oluşacak.</p>
            </div>
          ) : (
            <div className="px-5 pb-5">
              <div className="flex items-start gap-5 mb-4">
                <ScoreArc score={score} />
                <div className="flex-1 space-y-2.5 pt-2">
                  {criteriaValues.map(({ label, icon, key, value }) => {
                    const pct     = (value / 5) * 100;
                    const isTop   = key === sorted[0].key;
                    const isWeak  = value < 4;
                    const isCrit  = value < 3;
                    return (
                      <div key={key} className={`rounded-xl px-2.5 py-2 transition-all ${
                        isCrit ? "bg-red-950/20" : isWeak ? "bg-amber-950/15" : ""
                      }`} style={isCrit ? { border: "1px solid rgba(239,68,68,0.2)" }
                              : isWeak ? { border: "1px solid rgba(245,158,11,0.15)" }
                              : {}}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{icon}</span>
                            <span className={`text-xs font-medium ${isCrit ? "text-red-300" : isWeak ? "text-amber-300/80" : "text-zinc-400"}`}>
                              {label}
                            </span>
                            {isTop && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                                style={{ background: "var(--gold-subtle)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                                ★ En Güçlü
                              </span>
                            )}
                            {isCrit && <span className="text-[9px] text-red-400 font-semibold">⚠ Kritik</span>}
                          </div>
                          <span className={`text-xs font-bold ${
                            pct >= 80 ? "text-amber-300" : pct >= 60 ? "text-zinc-300" : isCrit ? "text-red-400" : "text-amber-600"
                          }`}>{value.toFixed(1)}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1e1e1e" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${pct}%`,
                            background: isCrit ? "linear-gradient(to right, #dc2626, #ef4444)"
                                      : isWeak ? "linear-gradient(to right, var(--copper), #d97706)"
                                      : "linear-gradient(to right, var(--gold-dark), var(--gold-light))",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* İstatistik çubukları */}
              <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: "1px solid #1a1a1a" }}>
                {[
                  { label: "Paylaşım", value: profile.postCount, color: "text-white" },
                  { label: "Favori",   value: profile.favCount,  color: "text-white" },
                  { label: "Bu Hafta", value: recentReviewCount, color: recentReviewCount > 0 ? "text-green-400" : "text-zinc-600", suffix: "yorum" },
                ].map((s) => (
                  <div key={s.label} className="text-center py-2 rounded-xl" style={{ background: "#161616" }}>
                    <p className={`font-bold text-sm ${s.color}`}>{s.value}{s.suffix ? "" : ""}</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Haftalık trend */}
              {weeklyTrend !== null && (
                <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium ${
                  weeklyTrend > 0 ? "text-green-400" : weeklyTrend < 0 ? "text-red-400" : "text-zinc-500"
                }`} style={{ background: "#161616", border: "1px solid #252525" }}>
                  <span className="text-base">{weeklyTrend > 0 ? "↑" : weeklyTrend < 0 ? "↓" : "→"}</span>
                  <span>Geçen haftaya göre güven oranın{" "}
                    <strong>{weeklyTrend > 0 ? `${weeklyTrend} puan arttı` : weeklyTrend < 0 ? `${Math.abs(weeklyTrend)} puan düştü` : "değişmedi"}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Telafi Fırsatları ── */}
        {telafi.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1e1e1e" }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-white font-semibold text-sm">Telafi Fırsatları</p>
              </div>
              <span className="text-amber-400 font-bold">{telafi.length}</span>
            </div>
            <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
              {telafi.slice(0, 3).map((r) => {
                const avgScore = (r.visualFidelity + r.technicalSkill + r.processTransparency + r.expectationMgmt + r.compensationScore) / 5;
                const keys = ["visualFidelity","technicalSkill","processTransparency","expectationMgmt","compensationScore"] as const;
                const lowestKey = keys.reduce((a, b) => (r[a] < r[b] ? a : b));
                const lowestLabel = CRITERIA.find(c => c.key.slice(3).toLowerCase() === lowestKey.replace(/([A-Z])/g,"").toLowerCase())?.label ?? "Kriter";
                return (
                  <div key={r.id} className="px-5 py-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "#1e1e1e", border: "1px solid #252525" }}>
                      {r.customer.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <Link href={`/profile/customer/${r.customer.id}`} className="text-white text-sm font-medium hover:underline">
                          {r.customer.name} {r.customer.surname}
                        </Link>
                        <span className="text-red-400 text-xs font-bold">{avgScore.toFixed(1)}/5</span>
                      </div>
                      {r.images[0] && (
                        <div className="relative w-full h-16 rounded-xl overflow-hidden mb-2">
                          <Image src={r.images[0].url} alt="" fill className="object-cover" />
                        </div>
                      )}
                      {r.comment && (
                        <div className="flex items-start gap-2 mb-2 p-2.5 rounded-xl" style={{ background: "#1a1a1a" }}>
                          <span className="text-zinc-600 text-base flex-shrink-0">"</span>
                          <p className="text-zinc-400 text-xs leading-relaxed">{r.comment}</p>
                        </div>
                      )}
                      <p className="text-amber-500/70 text-xs">
                        Kritik alan: <span className="font-medium text-amber-400/80">{lowestLabel}</span> — {(r as never)[lowestKey]}/5
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid #1e1e1e" }}>
              <p className="text-zinc-600 text-xs">Müşteriyle iletişime geçerek hatanı kabul et ve telafi teklif et.</p>
            </div>
          </div>
        )}

        {/* ── Şeffaf Analiz ── */}
        {strongest && (
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Koç Analizi</p>
            <div className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: "var(--gold-subtle)", border: "1px solid var(--gold-border)" }}>
              <span className="text-xl flex-shrink-0">🏆</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>En Güçlü Yönün</p>
                  {percentile && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-zinc-400"
                      style={{ background: "#1a1a1a" }}>
                      Bölgede {percentile}
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Müşterilerin seni en çok <strong className="text-white">{strongest.label}</strong> konusunda takdir ediyor
                  ({strongest.value.toFixed(1)}/5). Bu başarını paylaşımlarında vurgula.
                </p>
              </div>
            </div>
            {weakest && (
              <div className="p-4 rounded-xl flex items-start gap-3"
                style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <span className="text-xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-amber-300/80 text-sm font-semibold mb-0.5">Gelişim Fırsatı</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    <strong className="text-white">{weakest.label}</strong> puanın ({weakest.value.toFixed(1)}/5) diğer kriterlerin gerisinde.
                    Bu alana odaklanmak bileşik skorunu hızla yükseltebilir.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Müşteri Paylaşımları (Filtresiz Mühürlü) ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1e1e1e" }}>
            <p className="text-white font-semibold text-sm">Müşteri Paylaşımları</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold"
                style={{ background: "var(--gold-subtle)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                ✓ Filtresiz
              </span>
              <span className="text-zinc-600 text-xs">{profile.postCount}</span>
            </div>
          </div>
          <PortfolioUploader recentPosts={recentPosts} />
        </div>

        {/* ── Dürüstlük Koç İpucu ── */}
        <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
          style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.12)" }}>
          <span className="text-xl flex-shrink-0 mt-0.5">{tip.icon}</span>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>
              Başarı Asistanı — Günün İpucu
            </p>
            <p className="text-zinc-400 text-xs leading-relaxed">{tip.text}</p>
          </div>
        </div>

        {/* ── Kampanyalar ── */}
        <BarberCampaignsPanel barberId={profile.id} />

        {/* ── Randevu Yönetimi ── */}
        <BarberAppointmentsPanel barberId={profile.id} />

        {/* ── Aksiyonlar (Client) ── */}
        <BarberDashboardClient
          profileId={profile.id}
          receivedReviews={reviews as never}
          reviewCount={profile.reviewCount}
        />

        </BarberTabsWrapper>

      </div>
    </div>
  );
}
