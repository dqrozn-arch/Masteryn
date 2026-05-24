"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
    bio?: string | null; phone?: string | null; specialties: string[];
    overallScore: number; reviewCount: number; postCount: number;
    favCount: number; hasVerifiedWork: boolean; memberYears: number;
  };
  workplaces: Workplace[];
  certificates: Certificate[];
}

const inputCls = "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors";
const inputStyle = { background: "#161616", border: "1px solid #252525" };

export default function BarberCareerTab({ profile, workplaces: initWP, certificates: initCerts }: Props) {
  const router = useRouter();

  // Bio düzenleme
  const [editBio,   setEditBio]  = useState(false);
  const [bio,       setBio]      = useState(profile.bio ?? "");
  const [savingBio, setSavingBio]= useState(false);
  const [bioMsg,    setBioMsg]   = useState("");

  // İş geçmişi
  const [workplaces, setWP]   = useState<Workplace[]>(initWP);
  const [showWPForm, setWPF]  = useState(false);
  const [wpForm, setWPForm]   = useState({ salonName:"", city:"", role:"", startYear:"", endYear:"", isCurrent:false });
  const [wpLoad, setWPLoad]   = useState(false);

  // Sertifikalar
  const [certs, setCerts]     = useState<Certificate[]>(initCerts);
  const [showCF, setShowCF]   = useState(false);
  const [certForm, setCertForm]= useState({ name:"", issuer:"", year:"", description:"" });
  const [certLoad, setCertLoad]= useState(false);

  // Kariyer özeti metrikleri
  const totalYears = workplaces.length > 0
    ? new Date().getFullYear() - Math.min(...workplaces.map((w) => w.startYear))
    : 0;
  const verifiedCount = workplaces.filter((w) => w.isVerified).length;

  async function saveBio() {
    setSavingBio(true); setBioMsg("");
    const res = await fetch("/api/profile/barber/info", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, surname: profile.surname, city: "", bio }),
    });
    setSavingBio(false);
    if (res.ok) { setBioMsg("Kaydedildi ✓"); setEditBio(false); setTimeout(() => setBioMsg(""), 2000); }
  }

  async function addWP(e: React.FormEvent) {
    e.preventDefault(); setWPLoad(true);
    const res = await fetch("/api/profile/barber/workplaces", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wpForm),
    });
    const data = await res.json();
    setWPLoad(false);
    if (res.ok) { setWP((p) => [data.workplace, ...p]); setWPForm({ salonName:"", city:"", role:"", startYear:"", endYear:"", isCurrent:false }); setWPF(false); }
  }

  async function deleteWP(id: string) {
    await fetch(`/api/profile/barber/workplaces/${id}`, { method: "DELETE" });
    setWP((p) => p.filter((w) => w.id !== id));
  }

  async function addCert(e: React.FormEvent) {
    e.preventDefault(); setCertLoad(true);
    const res = await fetch("/api/profile/barber/certificates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(certForm),
    });
    const data = await res.json();
    setCertLoad(false);
    if (res.ok) { setCerts((p) => [data.cert, ...p]); setCertForm({ name:"", issuer:"", year:"", description:"" }); setShowCF(false); }
  }

  async function deleteCert(id: string) {
    await fetch(`/api/profile/barber/certificates/${id}`, { method: "DELETE" });
    setCerts((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-5">

      {/* ── Masteryn Kariyer Karnesi ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #111008 0%, #0e0e0e 40%, #100e06 100%)", border: "1px solid rgba(201,169,110,0.14)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 100 100">
              <defs><linearGradient id="cv" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#DFC28A"/><stop offset="100%" stopColor="#A8894E"/></linearGradient></defs>
              <path d="M29,4 L71,4 L96,29 L96,71 L71,96 L29,96 L4,71 L4,29 Z" fill="url(#cv)"/>
              <path d="M32,50 L44,63 L68,37" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Masteryn Kariyer Karnesi</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y" style={{ borderColor: "rgba(201,169,110,0.08)" }}>
          {[
            { icon: "👥", label: "Memnun Müşteri", value: `${profile.reviewCount}+` },
            { icon: "📷", label: "Portfolyo",       value: `${profile.postCount}` },
            { icon: "✦",  label: "Doğrulanmış İş", value: `${verifiedCount}` },
            { icon: "🎓", label: "Sertifika",       value: `${certs.length}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="px-5 py-4 text-center" style={{ borderColor: "rgba(201,169,110,0.08)" }}>
              <div className="text-base mb-1">{icon}</div>
              <div className="text-white text-xl font-black">{value}</div>
              <div className="text-zinc-600 text-[10px] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        {(totalYears > 0 || profile.memberYears > 0 || profile.overallScore >= 8) && (
          <div className="px-5 py-3 flex flex-wrap gap-2" style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
            {totalYears > 0 && (
              <span className="text-[10px] px-2.5 py-1 rounded-xl" style={{ background:"var(--gold-subtle)", color:"var(--gold)", border:"1px solid var(--gold-border)" }}>
                {totalYears}+ yıl deneyim
              </span>
            )}
            {profile.overallScore >= 8 && (
              <span className="text-[10px] px-2.5 py-1 rounded-xl text-green-400" style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)" }}>
                Masteryn Onaylı Usta
              </span>
            )}
            {profile.memberYears >= 1 && (
              <span className="text-[10px] px-2.5 py-1 rounded-xl text-zinc-400" style={{ background:"#161616", border:"1px solid #252525" }}>
                {profile.memberYears} yıldır Masteryn'de
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Zanaatkarın Hikayesi (Bio) ── */}
      <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold text-sm">Zanaatkarın Hikayesi</p>
          <button onClick={() => setEditBio(!editBio)}
            className="text-xs px-3 py-1.5 rounded-xl transition-colors text-zinc-400 hover:text-white"
            style={{ background:"#161616", border:"1px solid #252525" }}>
            {editBio ? "İptal" : "✏ Düzenle"}
          </button>
        </div>

        {editBio ? (
          <div className="space-y-3">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5}
              placeholder="Kaç yıldır bu iştesin? Hangi tekniklerde uzmanlaştın? Seni diğerlerinden ayıran nedir?"
              className={`${inputCls} resize-none`} style={inputStyle} />
            <div className="flex items-center gap-3">
              <button onClick={saveBio} disabled={savingBio}
                className="bg-white text-zinc-900 font-semibold text-sm px-5 py-2 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50">
                {savingBio ? "Kaydediliyor..." : "Kaydet"}
              </button>
              {bioMsg && <span className="text-green-400 text-sm">{bioMsg}</span>}
            </div>
          </div>
        ) : bio ? (
          <p className="text-zinc-400 text-sm leading-relaxed">{bio}</p>
        ) : (
          <div className="text-center py-6">
            <p className="text-zinc-600 text-sm">Henüz hikaye yazılmamış.</p>
            <button onClick={() => setEditBio(true)} className="text-xs mt-2 underline" style={{ color:"var(--gold)" }}>
              Hikayeni anlat →
            </button>
          </div>
        )}
      </div>

      {/* ── İş Geçmişi ── */}
      <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-white font-semibold text-sm">İş Geçmişi</p>
          <div className="flex gap-2">
            <Link href="/dashboard/barber/edit"
              className="text-[10px] px-2.5 py-1.5 rounded-xl text-zinc-500 hover:text-white transition-colors"
              style={{ background:"#161616", border:"1px solid #252525" }}>
              Doğrulama İste
            </Link>
            <button onClick={() => setWPF(!showWPForm)}
              className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
              style={{ background:"#161616", border:"1px solid #252525" }}>
              {showWPForm ? "İptal" : "+ Ekle"}
            </button>
          </div>
        </div>

        {showWPForm && (
          <form onSubmit={addWP} className="rounded-xl p-4 mb-5 space-y-3" style={{ background:"#161616", border:"1px solid #252525" }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Salon Adı *</label>
                <input value={wpForm.salonName} onChange={(e) => setWPForm((p) => ({ ...p, salonName: e.target.value }))} required placeholder="Kaya Kuaför" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Şehir</label>
                <input value={wpForm.city} onChange={(e) => setWPForm((p) => ({ ...p, city: e.target.value }))} placeholder="İstanbul" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Pozisyon</label>
                <input value={wpForm.role} onChange={(e) => setWPForm((p) => ({ ...p, role: e.target.value }))} placeholder="Kuaför Ustası" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Başlangıç *</label>
                <input type="number" value={wpForm.startYear} onChange={(e) => setWPForm((p) => ({ ...p, startYear: e.target.value }))} required placeholder="2018" min={1990} max={new Date().getFullYear()} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Bitiş</label>
                <input type="number" value={wpForm.endYear} onChange={(e) => setWPForm((p) => ({ ...p, endYear: e.target.value }))} disabled={wpForm.isCurrent} placeholder={wpForm.isCurrent ? "Hâlâ burada" : "2022"} min={1990} max={new Date().getFullYear()} className={`${inputCls} disabled:opacity-40`} style={inputStyle} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={wpForm.isCurrent} onChange={(e) => setWPForm((p) => ({ ...p, isCurrent: e.target.checked, endYear:"" }))} className="accent-amber-400 w-4 h-4" />
              <span className="text-zinc-400 text-sm">Hâlâ burada çalışıyorum</span>
            </label>
            <button type="submit" disabled={wpLoad}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-zinc-900 disabled:opacity-50 transition-colors"
              style={{ background:"var(--gold)" }}>
              {wpLoad ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        )}

        {workplaces.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-600 text-sm">Henüz iş geçmişi eklenmedi</p>
            <button onClick={() => setWPF(true)} className="text-xs mt-2 underline" style={{ color:"var(--gold)" }}>
              İlk işyerini ekle →
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {workplaces.map((w, i) => (
              <div key={w.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className={`w-3 h-3 rounded-full border-2 ${w.isVerified ? "border-blue-400 bg-blue-400/25" : w.isCurrent ? "border-amber-400 bg-amber-400/15" : "border-zinc-700 bg-zinc-900"}`}
                    style={w.isVerified ? { boxShadow:"0 0 8px rgba(59,130,246,0.4)" } : {}} />
                  {i < workplaces.length-1 && <div className="w-px min-h-[2.5rem] mt-1" style={{ background:"#1e1e1e" }} />}
                </div>
                <div className={`flex-1 group ${i < workplaces.length-1 ? "pb-5" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-sm font-medium">{w.salonName}</p>
                        {w.isVerified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold text-blue-400" style={{ background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.25)" }}>
                            ✓ Doğrulandı
                          </span>
                        )}
                        {w.isCurrent && !w.isVerified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-lg text-amber-400/70" style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.18)" }}>Aktif</span>
                        )}
                      </div>
                      {w.role && <p className="text-zinc-500 text-xs mt-0.5">{w.role}</p>}
                      <p className="text-zinc-600 text-xs mt-0.5">
                        {w.city && `${w.city} · `}
                        {w.startYear} – {w.isCurrent ? <span style={{ color:"var(--gold-dark)" }}>Günümüz</span> : w.endYear}
                      </p>
                      {w.isVerified && w.verifierName && (
                        <p className="text-blue-400/40 text-[10px] mt-0.5">{w.verifierName} tarafından onaylandı</p>
                      )}
                    </div>
                    <button onClick={() => deleteWP(w.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all text-xs px-2 py-1 flex-shrink-0">
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sertifikalar & Eğitimler ── */}
      <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-white font-semibold text-sm">Sertifikalar & Eğitimler</p>
          <button onClick={() => setShowCF(!showCF)}
            className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
            style={{ background:"#161616", border:"1px solid #252525" }}>
            {showCF ? "İptal" : "+ Ekle"}
          </button>
        </div>

        {showCF && (
          <form onSubmit={addCert} className="rounded-xl p-4 mb-5 space-y-3" style={{ background:"#161616", border:"1px solid #252525" }}>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Sertifika / Kurs Adı *</label>
              <input value={certForm.name} onChange={(e) => setCertForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Profesyonel Saç Boyama Kursu" className={inputCls} style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Veren Kurum</label>
                <input value={certForm.issuer} onChange={(e) => setCertForm((p) => ({ ...p, issuer: e.target.value }))} placeholder="Wella Professionals" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Yıl</label>
                <input type="number" value={certForm.year} onChange={(e) => setCertForm((p) => ({ ...p, year: e.target.value }))} placeholder={String(new Date().getFullYear())} min={1990} max={new Date().getFullYear()} className={inputCls} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
              <input value={certForm.description} onChange={(e) => setCertForm((p) => ({ ...p, description: e.target.value }))} placeholder="Kısa açıklama..." className={inputCls} style={inputStyle} />
            </div>
            <button type="submit" disabled={certLoad}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-zinc-900 disabled:opacity-50"
              style={{ background:"var(--gold)" }}>
              {certLoad ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        )}

        {certs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-600 text-sm">Henüz sertifika eklenmedi</p>
            <button onClick={() => setShowCF(true)} className="text-xs mt-2 underline" style={{ color:"var(--gold)" }}>
              İlk sertifikayı ekle →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {certs.map((c) => (
              <div key={c.id} className="flex items-start gap-3 group p-3 rounded-xl hover:bg-white/2 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"var(--gold-subtle)", border:"1px solid var(--gold-border)" }}>
                  <span className="text-base">🎓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {c.issuer && <span className="text-zinc-500 text-xs">{c.issuer}</span>}
                    {c.year   && <span className="text-zinc-600 text-xs">· {c.year}</span>}
                  </div>
                  {c.description && <p className="text-zinc-600 text-xs mt-0.5">{c.description}</p>}
                </div>
                <button onClick={() => deleteCert(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all text-xs px-2 py-1 flex-shrink-0">
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Uzmanlık Becerileri ── */}
      <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold text-sm">Uzmanlık Becerileri</p>
          <Link href="/dashboard/barber/edit"
            className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
            style={{ background:"#161616", border:"1px solid #252525" }}>
            Düzenle
          </Link>
        </div>
        {profile.specialties.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-zinc-600 text-sm">Henüz uzmanlık eklenmedi</p>
            <Link href="/dashboard/barber/edit" className="text-xs mt-2 underline block" style={{ color:"var(--gold)" }}>
              Uzmanlıklarını ekle →
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((s) => (
              <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background:"var(--gold-subtle)", border:"1px solid var(--gold-border)" }}>
                <span className="text-xs font-medium" style={{ color:"var(--gold)", letterSpacing:"0.02em" }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
