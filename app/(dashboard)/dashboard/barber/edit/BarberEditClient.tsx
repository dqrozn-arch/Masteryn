"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Certificate {
  id: string; name: string; issuer?: string | null; year?: number | null; description?: string | null;
}

interface Workplace {
  id: string; salonName: string; city?: string | null; role?: string | null;
  startYear: number; endYear?: number | null; isCurrent: boolean;
  isVerified?: boolean; verificationToken?: string | null;
  employerEmail?: string | null; employerName?: string | null; verifierName?: string | null;
}
interface Profile {
  id: string; name: string; surname: string; salonName?: string | null;
  city: string; district?: string | null; address?: string | null;
  phone?: string | null; bio?: string | null; avatar?: string | null;
  specialties: string[]; workplaces: Workplace[];
  certificates: Certificate[];
  username?: string | null; email: string;
}

function WorkplaceRow({ workplace: w, onDelete, onVerified }: {
  workplace: Workplace;
  onDelete: () => void;
  onVerified: (url: string) => void;
}) {
  const [showVerify, setShowVerify] = useState(false);
  const [email,      setEmail]      = useState(w.employerEmail ?? "");
  const [empName,    setEmpName]    = useState(w.employerName ?? "");
  const [loading,    setLoading]    = useState(false);
  const [verifyUrl,  setVerifyUrl]  = useState(w.verificationToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${w.verificationToken}`
    : "");
  const [copied,     setCopied]     = useState(false);

  async function requestVerification() {
    setLoading(true);
    const res = await fetch(`/api/profile/barber/workplaces/${w.id}/verify-request`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employerEmail: email, employerName: empName }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setVerifyUrl(data.verifyUrl); onVerified(data.verifyUrl); setShowVerify(false); }
  }

  function copyUrl() {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-white/5 rounded-2xl p-4 group">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center pt-1 flex-shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${w.isCurrent ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-zinc-700"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-medium">{w.salonName}</p>
                {w.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] px-2 py-0.5 rounded-lg font-semibold">
                    ✓ Doğrulandı
                  </span>
                )}
              </div>
              {w.role && <p className="text-zinc-400 text-xs">{w.role}</p>}
              <p className="text-zinc-600 text-xs mt-0.5">
                {w.city && `${w.city} · `}
                {w.startYear} – {w.isCurrent ? "Günümüz" : w.endYear}
              </p>
            </div>
            <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all text-xs px-2 py-1">Sil</button>
          </div>

          {/* Doğrulama durumu */}
          {!w.isVerified && (
            <div className="mt-3">
              {verifyUrl ? (
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                  <p className="text-blue-300/80 text-xs mb-2 font-medium">Doğrulama linki oluşturuldu</p>
                  <div className="flex gap-2">
                    <input value={verifyUrl} readOnly className="flex-1 bg-transparent text-zinc-400 text-xs truncate focus:outline-none" />
                    <button onClick={copyUrl}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"}`}>
                      {copied ? "Kopyalandı!" : "Kopyala"}
                    </button>
                  </div>
                  <p className="text-zinc-700 text-xs mt-2">Bu linki işvereninize gönderin. Tıkladıklarında onaylayabilirler.</p>
                </div>
              ) : showVerify ? (
                <div className="bg-white/3 rounded-xl p-3 space-y-2">
                  <input value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="İşveren e-postası (bilgi için)" className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-white/20" />
                  <input value={empName} onChange={(e) => setEmpName(e.target.value)}
                    placeholder="İşveren adı (isteğe bağlı)" className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-white/20" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowVerify(false)} className="flex-1 text-zinc-500 text-xs py-2 rounded-lg hover:text-zinc-300 transition-colors">İptal</button>
                    <button onClick={requestVerification} disabled={loading}
                      className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                      {loading ? "..." : "Link Oluştur"}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowVerify(true)}
                  className="mt-1 text-xs text-zinc-600 hover:text-blue-400 transition-colors flex items-center gap-1">
                  <span className="text-blue-500/50">✓</span> İşveren doğrulaması iste
                </button>
              )}
            </div>
          )}
          {w.isVerified && w.verifierName && (
            <p className="text-zinc-600 text-xs mt-1">{w.verifierName} tarafından onaylandı</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordSection() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ text: "Yeni şifreler eşleşmiyor", ok: false }); return;
    }
    if (form.newPassword.length < 6) {
      setMsg({ text: "Yeni şifre en az 6 karakter olmalı", ok: false }); return;
    }
    setLoading(true); setMsg({ text: "", ok: false });
    const res = await fetch("/api/profile/password", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ text: "Şifre başarıyla güncellendi ✓", ok: true });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMsg({ text: "", ok: false }), 3000);
    } else {
      setMsg({ text: data.error, ok: false });
    }
  }

  const ic = "w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all";

  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="text-white font-semibold mb-1">Şifre Değiştir</h2>
      <p className="text-zinc-600 text-xs mb-5">Hesabınızın güvenliği için güçlü bir şifre kullanın</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Mevcut Şifre</label>
          <input type="password" value={form.currentPassword}
            onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
            placeholder="••••••••" required className={ic} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Yeni Şifre</label>
          <input type="password" value={form.newPassword}
            onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
            placeholder="En az 6 karakter" required className={ic} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Yeni Şifre Tekrar</label>
          <input type="password" value={form.confirmPassword}
            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="••••••••" required className={ic} />
          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-red-400 text-xs mt-1.5">Şifreler eşleşmiyor</p>
          )}
          {form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword && form.newPassword.length >= 6 && (
            <p className="text-green-400 text-xs mt-1.5">✓ Şifreler eşleşiyor</p>
          )}
        </div>
        {msg.text && (
          <div className={`rounded-2xl px-4 py-3 text-sm ${msg.ok ? "bg-green-950/40 border border-green-800/40 text-green-400" : "bg-red-950/40 border border-red-800/40 text-red-400"}`}>
            {msg.text}
          </div>
        )}
        <button type="submit" disabled={loading}
          className="bg-white text-zinc-900 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50">
          {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </section>
  );
}

const SUGGESTED_SPECIALTIES = [
  "Deri Kesim", "Klasik Kesim", "Saç Boyama", "Röfle",
  "Keratin", "Çocuk Kesimi", "Afro Kesim", "Skin Fade",
  "Saç Bakımı", "Kaş Alma", "Ombre", "Balayage", "Saç Uzatma",
];

const inputClass = "w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all";

export default function BarberEditClient({ profile: initial }: { profile: Profile }) {
  const router = useRouter();

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string>(initial.avatar ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Temel bilgiler
  const [info, setInfo] = useState({
    name: initial.name, surname: initial.surname, salonName: initial.salonName ?? "",
    city: initial.city, district: initial.district ?? "", address: initial.address ?? "",
    phone: initial.phone ?? "", bio: initial.bio ?? "",
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  // Uzmanlık alanları
  const [specialties, setSpecialties] = useState<string[]>(initial.specialties);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [specLoading, setSpecLoading] = useState(false);
  const [specMsg, setSpecMsg] = useState("");

  // Sertifikalar
  const [certs,      setCerts]     = useState<Certificate[]>(initial.certificates);
  const [certForm,   setCertForm]  = useState({ name: "", issuer: "", year: "", description: "" });
  const [certLoading,setCertLoad]  = useState(false);
  const [showCertF,  setShowCertF] = useState(false);

  // Kullanıcı adı
  const [username,    setUsername]  = useState(initial.username ?? "");
  const [unameLoading, setUnameLoading] = useState(false);
  const [unameMsg,    setUnameMsg]  = useState({ text: "", ok: false });

  // İş geçmişi
  const [workplaces, setWorkplaces] = useState<Workplace[]>(initial.workplaces);
  const [wpForm, setWpForm] = useState({ salonName: "", city: "", role: "", startYear: "", endYear: "", isCurrent: false });
  const [wpLoading, setWpLoading] = useState(false);
  const [wpMsg, setWpMsg] = useState("");
  const [showWpForm, setShowWpForm] = useState(false);

  // ── Avatar ──────────────────────────────────────────────
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const r = new FileReader();
    r.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    r.readAsDataURL(file);
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    setAvatarLoading(true);
    const fd = new FormData();
    fd.append("avatar", avatarFile);
    const res = await fetch("/api/profile/barber/avatar", { method: "POST", body: fd });
    setAvatarLoading(false);
    if (res.ok) setAvatarFile(null);
  }

  // ── Temel Bilgiler ──────────────────────────────────────
  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoLoading(true); setInfoMsg("");
    const res = await fetch("/api/profile/barber/info", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    setInfoLoading(false);
    setInfoMsg(res.ok ? "Kaydedildi ✓" : "Hata oluştu");
    if (res.ok) setTimeout(() => setInfoMsg(""), 2000);
  }

  // ── Uzmanlık ────────────────────────────────────────────
  function toggleSpecialty(s: string) {
    setSpecialties((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  }

  function addCustom() {
    const t = customSpecialty.trim();
    if (!t || specialties.includes(t)) return;
    setSpecialties((p) => [...p, t]);
    setCustomSpecialty("");
  }

  async function saveSpecialties() {
    setSpecLoading(true); setSpecMsg("");
    const res = await fetch("/api/profile/barber/specialties", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specialties }),
    });
    setSpecLoading(false);
    setSpecMsg(res.ok ? "Kaydedildi ✓" : "Hata oluştu");
    if (res.ok) setTimeout(() => setSpecMsg(""), 2000);
  }

  // ── İş Geçmişi ──────────────────────────────────────────
  async function addWorkplace(e: React.FormEvent) {
    e.preventDefault();
    setWpLoading(true); setWpMsg("");
    const res = await fetch("/api/profile/barber/workplaces", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wpForm),
    });
    const data = await res.json();
    setWpLoading(false);
    if (res.ok) {
      setWorkplaces((p) => [data.workplace, ...p]);
      setWpForm({ salonName: "", city: "", role: "", startYear: "", endYear: "", isCurrent: false });
      setShowWpForm(false);
    } else setWpMsg(data.error);
  }

  async function deleteWorkplace(id: string) {
    await fetch(`/api/profile/barber/workplaces/${id}`, { method: "DELETE" });
    setWorkplaces((p) => p.filter((w) => w.id !== id));
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">

      {/* ── Avatar ── */}
      <section className="glass rounded-3xl p-6">
        <h2 className="text-white font-semibold mb-5">Profil Fotoğrafı</h2>
        <div className="flex items-center gap-5">
          <div
            onClick={() => avatarRef.current?.click()}
            className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group"
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl font-black text-white">
                {initial.name[0]}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Değiştir</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-zinc-400 text-sm mb-3">JPG veya PNG · Max 5MB</p>
            {avatarFile ? (
              <button onClick={uploadAvatar} disabled={avatarLoading}
                className="bg-amber-400 text-zinc-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
                {avatarLoading ? "Yükleniyor..." : "Fotoğrafı Kaydet"}
              </button>
            ) : (
              <button onClick={() => avatarRef.current?.click()}
                className="glass border border-white/10 text-zinc-300 hover:text-white text-sm px-5 py-2.5 rounded-xl transition-colors">
                Fotoğraf Seç
              </button>
            )}
          </div>
        </div>
        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </section>

      {/* ── Temel Bilgiler ── */}
      <section className="glass rounded-3xl p-6">
        <h2 className="text-white font-semibold mb-5">Temel Bilgiler</h2>
        <form onSubmit={saveInfo} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Ad</label>
              <input value={info.name} onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Soyad</label>
              <input value={info.surname} onChange={(e) => setInfo((p) => ({ ...p, surname: e.target.value }))} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Salon Adı</label>
            <input value={info.salonName} onChange={(e) => setInfo((p) => ({ ...p, salonName: e.target.value }))} placeholder="Kaya Erkek Kuaförü" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Şehir</label>
              <input value={info.city} onChange={(e) => setInfo((p) => ({ ...p, city: e.target.value }))} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">İlçe</label>
              <input value={info.district} onChange={(e) => setInfo((p) => ({ ...p, district: e.target.value }))} placeholder="Kadıköy" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Adres</label>
            <input value={info.address} onChange={(e) => setInfo((p) => ({ ...p, address: e.target.value }))} placeholder="Moda Cad. No:47" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Telefon</label>
            <input value={info.phone} onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))} placeholder="05xx xxx xx xx" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Hakkında</label>
            <textarea value={info.bio} onChange={(e) => setInfo((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Kendinizi kısaca tanıtın..." rows={3}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm resize-none transition-all" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={infoLoading}
              className="bg-white text-zinc-900 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50">
              {infoLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {infoMsg && <span className="text-green-400 text-sm">{infoMsg}</span>}
          </div>
        </form>
      </section>

      {/* ── Uzmanlık Alanları ── */}
      <section className="glass rounded-3xl p-6">
        <h2 className="text-white font-semibold mb-2">Uzmanlık Alanları</h2>
        <p className="text-zinc-600 text-xs mb-4">Seç ya da özel ekle · max 15</p>

        {/* Seçili olanlar */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {specialties.map((s) => (
              <button key={s} onClick={() => toggleSpecialty(s)}
                className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs px-3 py-1.5 rounded-xl hover:bg-red-950/30 hover:border-red-800/30 hover:text-red-400 transition-all">
                {s} <span className="opacity-60">✕</span>
              </button>
            ))}
          </div>
        )}

        {/* Öneri listesi */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_SPECIALTIES.filter((s) => !specialties.includes(s)).map((s) => (
            <button key={s} onClick={() => toggleSpecialty(s)}
              className="glass border border-white/8 hover:border-amber-400/30 hover:text-amber-300 text-zinc-400 text-xs px-3 py-1.5 rounded-xl transition-all">
              + {s}
            </button>
          ))}
        </div>

        {/* Özel ekle */}
        <div className="flex gap-2 mb-4">
          <input value={customSpecialty} onChange={(e) => setCustomSpecialty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="Özel alan ekle..." className={`${inputClass} flex-1`} />
          <button onClick={addCustom} type="button"
            className="glass border border-white/8 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl transition-colors text-sm">
            Ekle
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveSpecialties} disabled={specLoading}
            className="bg-white text-zinc-900 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50">
            {specLoading ? "Kaydediliyor..." : "Uzmanlıkları Kaydet"}
          </button>
          {specMsg && <span className="text-green-400 text-sm">{specMsg}</span>}
        </div>
      </section>

      {/* ── İş Geçmişi ── */}
      <section className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Çalıştığı Yerler</h2>
            <p className="text-zinc-600 text-xs mt-0.5">İş geçmişini ekle</p>
          </div>
          <button onClick={() => setShowWpForm(!showWpForm)}
            className={`glass border text-sm px-4 py-2 rounded-xl transition-all ${showWpForm ? "border-white/15 text-white" : "border-white/8 text-zinc-400 hover:text-white"}`}>
            {showWpForm ? "İptal" : "+ Ekle"}
          </button>
        </div>

        {/* Yeni iş geçmişi formu */}
        {showWpForm && (
          <form onSubmit={addWorkplace} className="bg-white/3 rounded-2xl p-4 mb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Salon Adı *</label>
                <input value={wpForm.salonName} onChange={(e) => setWpForm((p) => ({ ...p, salonName: e.target.value }))}
                  placeholder="Kaya Kuaför" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Şehir</label>
                <input value={wpForm.city} onChange={(e) => setWpForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="İstanbul" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Pozisyon</label>
              <input value={wpForm.role} onChange={(e) => setWpForm((p) => ({ ...p, role: e.target.value }))}
                placeholder="Kuaför Ustası" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Başlangıç Yılı *</label>
                <input type="number" value={wpForm.startYear} onChange={(e) => setWpForm((p) => ({ ...p, startYear: e.target.value }))}
                  placeholder={String(currentYear - 2)} min={1990} max={currentYear} required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Bitiş Yılı</label>
                <input type="number" value={wpForm.isCurrent ? "" : wpForm.endYear}
                  onChange={(e) => setWpForm((p) => ({ ...p, endYear: e.target.value }))}
                  placeholder={wpForm.isCurrent ? "Devam ediyor" : String(currentYear)}
                  disabled={wpForm.isCurrent} min={1990} max={currentYear} className={`${inputClass} disabled:opacity-40`} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={wpForm.isCurrent}
                onChange={(e) => setWpForm((p) => ({ ...p, isCurrent: e.target.checked, endYear: "" }))}
                className="w-4 h-4 rounded accent-amber-400" />
              <span className="text-zinc-400 text-sm">Hâlâ burada çalışıyorum</span>
            </label>
            {wpMsg && <p className="text-red-400 text-xs">{wpMsg}</p>}
            <button type="submit" disabled={wpLoading}
              className="w-full bg-amber-400 text-zinc-900 font-semibold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
              {wpLoading ? "Ekleniyor..." : "İş Geçmişi Ekle"}
            </button>
          </form>
        )}

        {/* İş geçmişi listesi */}
        {workplaces.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-600 text-sm">Henüz iş geçmişi eklenmedi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workplaces.map((w) => (
              <WorkplaceRow key={w.id} workplace={w} onDelete={() => deleteWorkplace(w.id)}
                onVerified={(url) => setWorkplaces((p) => p.map((x) => x.id === w.id ? { ...x, verificationToken: url } : x))} />
            ))}
          </div>
        )}
      </section>

      {/* ── Sertifikalar ── */}
      <section className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Sertifikalar</h2>
            <p className="text-zinc-600 text-xs mt-0.5">Aldığın kurslar ve belgeler</p>
          </div>
          <button onClick={() => setShowCertF(!showCertF)}
            className={`glass border text-sm px-4 py-2 rounded-xl transition-all ${showCertF ? "border-white/15 text-white" : "border-white/8 text-zinc-400 hover:text-white"}`}>
            {showCertF ? "İptal" : "+ Ekle"}
          </button>
        </div>

        {showCertF && (
          <form onSubmit={async (e) => {
            e.preventDefault(); setCertLoad(true);
            const res = await fetch("/api/profile/barber/certificates", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(certForm),
            });
            const data = await res.json();
            setCertLoad(false);
            if (res.ok) { setCerts((p) => [data.cert, ...p]); setCertForm({ name: "", issuer: "", year: "", description: "" }); setShowCertF(false); }
          }} className="bg-white/3 rounded-2xl p-4 mb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Sertifika / Kurs Adı *</label>
                <input value={certForm.name} onChange={(e) => setCertForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Profesyonel Saç Boyama Kursu" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Veren Kurum</label>
                <input value={certForm.issuer} onChange={(e) => setCertForm((p) => ({ ...p, issuer: e.target.value }))}
                  placeholder="Wella Professionals" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Yıl</label>
                <input type="number" value={certForm.year} onChange={(e) => setCertForm((p) => ({ ...p, year: e.target.value }))}
                  placeholder={String(new Date().getFullYear())} min={1990} max={new Date().getFullYear()} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <input value={certForm.description} onChange={(e) => setCertForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Kısa bir açıklama..." className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={certLoading}
              className="w-full bg-amber-400 text-zinc-900 font-semibold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
              {certLoading ? "Ekleniyor..." : "Sertifika Ekle"}
            </button>
          </form>
        )}

        {certs.length === 0 ? (
          <div className="text-center py-8"><p className="text-zinc-600 text-sm">Henüz sertifika eklenmedi</p></div>
        ) : (
          <div className="space-y-3">
            {certs.map((c) => (
              <div key={c.id} className="flex items-start gap-3 group p-3 rounded-2xl hover:bg-white/3 transition-colors">
                <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 text-sm">🎓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{c.name}</p>
                  {c.issuer && <p className="text-zinc-400 text-xs">{c.issuer}</p>}
                  {c.year && <p className="text-zinc-600 text-xs">{c.year}</p>}
                  {c.description && <p className="text-zinc-600 text-xs mt-0.5">{c.description}</p>}
                </div>
                <button onClick={async () => {
                  await fetch(`/api/profile/barber/certificates/${c.id}`, { method: "DELETE" });
                  setCerts((p) => p.filter((x) => x.id !== c.id));
                }} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all text-xs px-2 py-1">
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Hesap Bilgileri (kullanıcı adı) ── */}
      <section className="glass rounded-3xl p-6">
        <h2 className="text-white font-semibold mb-1">Hesap Bilgileri</h2>
        <p className="text-zinc-600 text-xs mb-5">Giriş yaparken kullanacağınız bilgiler</p>

        {/* E-posta (salt okunur) */}
        <div className="mb-4">
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">E-posta</label>
          <div className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 text-sm flex items-center justify-between">
            <span>{initial.email}</span>
            <span className="text-zinc-700 text-xs">Değiştirilemez</span>
          </div>
        </div>

        {/* Kullanıcı adı */}
        <div className="mb-4">
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Kullanıcı Adı</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm select-none">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                placeholder="kullanici_adi"
                maxLength={30}
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all"
              />
            </div>
            <button
              type="button"
              disabled={unameLoading || username.length < 3}
              onClick={async () => {
                setUnameLoading(true); setUnameMsg({ text: "", ok: false });
                const res = await fetch("/api/profile/barber/username", {
                  method: "PUT", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username }),
                });
                const data = await res.json();
                setUnameLoading(false);
                if (res.ok) {
                  setUnameMsg({ text: "Kaydedildi ✓", ok: true });
                  setTimeout(() => setUnameMsg({ text: "", ok: false }), 2000);
                } else setUnameMsg({ text: data.error, ok: false });
              }}
              className="bg-white text-zinc-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              {unameLoading ? "..." : "Kaydet"}
            </button>
          </div>
          <p className="text-zinc-700 text-xs mt-1.5">Giriş yaparken e-posta yerine kullanabilirsin · 3-30 karakter</p>
          {unameMsg.text && (
            <p className={`text-xs mt-1.5 ${unameMsg.ok ? "text-green-400" : "text-red-400"}`}>{unameMsg.text}</p>
          )}
        </div>

        {/* Nasıl giriş yaparsın */}
        {username.length >= 3 && (
          <div className="bg-amber-400/5 border border-amber-400/15 rounded-2xl px-4 py-3 mt-2">
            <p className="text-amber-300/80 text-xs">
              Giriş adresi: <span className="font-medium text-amber-300">@{username}</span> veya <span className="font-medium text-amber-300">{initial.email}</span>
            </p>
          </div>
        )}
      </section>

      {/* ── Şifre Değiştir ── */}
      <PasswordSection />

      {/* Dashboard'a Dön */}
      <button onClick={() => router.push("/dashboard/barber")}
        className="w-full glass border border-white/8 text-zinc-400 hover:text-white py-3.5 rounded-2xl transition-colors text-sm">
        ← Dashboard'a Dön
      </button>
    </div>
  );
}
