"use client";

import { useState, useMemo, useRef } from "react";
import BarberCard from "@/components/barbers/BarberCard";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import MasterynEmblem from "@/components/shared/MasterynEmblem";
import BarberGalleryHero from "@/components/home/BarberGalleryHero";
import LiveTicker from "@/components/home/LiveTicker";

type Barber = {
  id: string; name: string; surname: string; salonName?: string | null;
  city: string; district?: string | null; avatar?: string | null;
  specialties: string[]; overallScore: number; reviewCount: number;
  avgVisualFidelity?: number; avgTechnical?: number; avgTransparency?: number;
  avgExpectation?: number; avgCompensation?: number;
  posts: { images: { url: string }[] }[];
  _count: { receivedReviews: number; posts: number };
};

const ALL_SPECIALTIES = [
  "Saç Kesimi", "Klasik Kesim", "Modern Kesim", "Çocuk Kesimi", "Stilist", "Perma",
  "Saç Boyama", "Balayage", "Ombre", "Röfle",
  "Saç Bakımı", "Keratin", "Nem Bakımı",
];

const PRINCIPLES = [
  {
    title: "%100 Filtresiz Portfolyo",
    desc: "Instagram filtrelerine son. Sadece salondan çıkan ham ve gerçek sonuçları görürsünüz. Aynada ne görecekseniz ekranınızda da onu görürsünüz.",
    accent: "#ef4444",
    icon: "camera",
  },
  {
    title: "8/10 Kalite Barajı",
    desc: "Burada vasatlığa yer yok. Sadece gerçek kullanıcı deneyimlerine dayalı 8/10 barajını aşan ustalar öne çıkarılır.",
    accent: "#f59e0b",
    icon: "scale",
  },
  {
    title: "Şeffaf Denetim ve İnceleme",
    desc: "Puanı barajın altına düşen ustaları gizlemiyoruz. “İnceleme Altında” etiketiyle işaretliyoruz ki kararı riskleri bilerek verin.",
    accent: "#3b82f6",
    icon: "eye",
  },
  {
    title: "\"İşimin Arkasındayım\" Garantisi",
    desc: "Bir aksaklık yaşandığında muhatapsız kalmazsınız. “Telafi Edildi” sistemiyle hatasını kabul eden dürüst zanaatkarı ön plana çıkarıyoruz.",
    accent: "#22c55e",
    icon: "shield",
  },
  {
    title: "Usta Odaklı İtibar Karnesi",
    desc: "Dükkanın dekoruna değil, ustanın el becerisine ödeme yapıyorsunuz. Her zanaatkarın silinemez ve devredilemez Başarı Karnesi vardır.",
    accent: "#a855f7",
    icon: "doc",
  },
  {
    title: "%100 Doğrulanmış Deneyim",
    desc: "Gerçekten o koltuğa oturmuş ve hizmeti tamamlamış kişilerin yorumları. Sahte övgülere kapalı bir güven ağı.",
    accent: "#06b6d4",
    icon: "badge",
  },
];

const EMPLOYER_STEPS = [
  { n: "01", title: "Salonunu Kaydet", desc: "Salonunu ve ustalarını platforma ekle. Her usta kendi bağımsız itibar karnesine sahip olur." },
  { n: "02", title: "Ustalarını Doğrula", desc: "Ustalarınızın iş geçmişini işveren olarak onaylayın. Mavi tik güveni artırır, müşteri çeker." },
  { n: "03", title: "Liyakatli Kadrolar Kurun", desc: "Ekibinizin ve yeni alacağınız zanaatkarların gerçek yeteneklerini şeffaf portfolyoları üzerinden görün. Personel performansını net verilerle izleyerek salonunuzu liyakat esasına göre kolayca yönetin." },
  { n: "04", title: "Salon İtibarınızı Kurumsallaştırın", desc: "Bireysel başarıları salonunuzun ortak gücüne dönüştürün. Müşterilerinizin şeffaf değerlendirmeleri sayesinde salon markanızın kalitesi tescillensin; bölgenizde güvenin ve prestijin ilk adresi olun." },
  { n: "05", title: "Masteryn Ekosistemi", desc: "Pazarlama bütçenizi koruyun, bütçeyi tabelanıza değil zanaatınıza yatırın. Masteryn'in şeffaf yapısı sayesinde salonunuzdan mutlu ayrılan her misafir en etkili reklam yüzünüz olur; bırakın reklamınızı siz değil, müşterileriniz yapsın." },
];

const CUSTOMER_STEPS = [
  { n: "01", title: "Gerçeği Gör", desc: "Ustaların filtresiz ve gerçek portfolyolarını incele." },
  { n: "02", title: "Veriye Güven", desc: "Ustanın şeffaf puanını ve güncel başarı oranını gör." },
  { n: "03", title: "Güvenle Otur", desc: "Ne alacağını ve ne ödeyeceğini bilerek koltuğa otur." },
  { n: "04", title: "Deneyimini Belgele", desc: "Aldığın hizmeti dürüstçe puanla, topluluğun güven duvarına bir tuğla da sen koy." },
  { n: "05", title: "Sadakat Puanı Kazan", desc: "Masteryn'de sadece iyi hizmet almazsın, liyakate verdiğin destekle ödüllendirilirsin." },
  { n: "06", title: "Digital Arşivin Seninle", desc: "Masteryn; boya kodunu, kesim detayını ve ustanın notlarını senin için arşivler. Detaylar asla unutulmaz." },
];

const BARBER_STEPS = [
  { n: "01", title: "Zanaatını Sergile", desc: "Ham ve gerçek fotoğraflarınla yeteneğini kanıtla." },
  { n: "02", title: "İtibarını İnşa Et", desc: "Her başarılı işleminle dijital kimliğini şeffafça büyüt. Müşterilerinin memnuniyeti senin en güçlü referansın olsun." },
  { n: "03", title: "Hatanı Telafi Et", desc: "Bir sorun olduğunda \"Telafi\" butonunu kullan; şeffaf iletişiminle puanını, itibarını ve müşterini koru." },
  { n: "04", title: "Kariyerini Güvenceye Al", desc: "Puanlarını ve başarılarını gittiğin her yere götürebileceğin dijital tapuna sahip ol." },
  { n: "05", title: "Masteryn Ekosistemi", desc: "Pazarlama bütçelerine değil, ustalığına güven. Reklamını sen değil, müşterin yapsın." },
];

function PrincipleIcon({ icon, color }: { icon: string; color: string }) {
  const cls = "w-5 h-5";
  const props = { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: cls };
  if (icon === "camera") return (
    <svg {...props}>
      <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.802.113-1.2.18-1.45.256-2.486 1.509-2.486 2.985V19.5a3 3 0 003 3h15a3 3 0 003-3V10.395c0-1.476-1.036-2.729-2.487-2.986a47.515 47.515 0 00-1.199-.18 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      <line x1="4" y1="4" x2="20" y2="20" strokeWidth={1.8} />
    </svg>
  );
  if (icon === "scale") return (
    <svg {...props}>
      <path d="M12 3v18M3 9l9-6 9 6M5 21h14M8 21l-3-12M16 21l3-12M5 9h14" />
    </svg>
  );
  if (icon === "eye") return (
    <svg {...props}>
      <path d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5S20.5 7.5 21.75 12C20.5 16.5 16.5 19.5 12 19.5S3.5 16.5 2.25 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 10l-2 2 2 2" strokeWidth={1.2} />
    </svg>
  );
  if (icon === "shield") return (
    <svg {...props}>
      <path d="M12 2.25l-8.25 3v5.25c0 5.25 3.75 9.75 8.25 11.25 4.5-1.5 8.25-6 8.25-11.25V5.25L12 2.25z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
  if (icon === "doc") return (
    <svg {...props}>
      <path d="M9 12h6M9 15h6M9 18h4M6 3h9l3 3v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M15 3v4h3" />
      <circle cx="8.5" cy="12" r="0.5" fill={color} />
    </svg>
  );
  // badge
  return (
    <svg {...props}>
      <path d="M9 12.75L11.25 15 15 9.75" />
      <path d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}

// Rose Gold palette
const RG = {
  primary:  "#C4856E",
  light:    "#DDA896",
  dark:     "#8B4A3A",
  glow:     "rgba(31,64,104,0.22)",
  border:   "rgba(31,64,104,0.2)",
  subtle:   "rgba(31,64,104,0.06)",
};

const MANIFESTO_CARDS = [
  {
    id: "transparency",
    title: "Şeffaflık",
    sub: "Filtresiz Gerçeklik",
    short: "Aynada ne görecekseniz ekranınızda da onu görürsünüz.",
    long: "Instagram filtrelerine son. Platformumuzda sadece salondan çıkan ham ve gerçek sonuçları görürsünüz. Ustalarımız filtresiz paylaşım taahhüdü imzalar. Bir fotoğraf sahte görünüyorsa sistem onu işaretler. Burada göründüğünüz gibi olursunuz.",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={RG.primary} strokeWidth="1">
        <circle cx="20" cy="20" r="14" />
        <circle cx="20" cy="20" r="8" />
        <circle cx="20" cy="20" r="2" fill={RG.primary} />
        <line x1="20" y1="4" x2="20" y2="8" strokeWidth="1.5" />
        <line x1="20" y1="32" x2="20" y2="36" strokeWidth="1.5" />
        <line x1="4" y1="20" x2="8" y2="20" strokeWidth="1.5" />
        <line x1="32" y1="20" x2="36" y2="20" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "merit",
    title: "Liyakat",
    sub: "8/10 Kalite Barajı",
    short: "Sadece reklam bütçesi olanlar değil, gerçekten işinin ehli olanlar öne çıkar.",
    long: "Platformumuzda sıralama reklam parasıyla satın alınamaz. Gerçek kullanıcı deneyimlerine dayalı 8/10 barajını aşan her usta Masteryn Onaylı statüsü kazanır. Puanı düşen usta şeffafça 'İnceleme Altında' ibaresiyle işaretlenir. Zanaatkarlık burada gerçek değerini bulur.",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={RG.primary} strokeWidth="1">
        <line x1="20" y1="4" x2="20" y2="36" strokeWidth="1.5" />
        <path d="M8 12 L20 6 L32 12" strokeLinejoin="round" />
        <path d="M6 13 L14 13 Q8 22 6 28 Q4 35 14 35 Q22 32 14 28 Q6 24 6 13Z" />
        <path d="M34 13 L26 13 Q32 22 34 28 Q36 35 26 35 Q18 32 26 28 Q34 24 34 13Z" />
        <line x1="6" y1="35" x2="34" y2="35" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "privacy",
    title: "Güvenli & Gizli",
    sub: "Veri Gizliliği Sözü",
    short: "Bilgileriniz asla üçüncü taraflarla paylaşılmaz.",
    long: "Şeffaflık ve dürüstlük ilkesiyle çıktığımız bu yolda, bilgilerinizin en büyük sermayeniz olduğunu biliyoruz. Hiçbir kullanıcı verisini satmıyoruz, reklamcılara sunmuyoruz. Platform içi tüm yazışmalar Masteryn Güvencesi kapsamında kayıt altındadır ve yalnızca anlaşmazlık durumunda hakemlik amacıyla erişilebilir.",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={RG.primary} strokeWidth="1">
        <path d="M20 3 L33 8 L33 20 Q33 32 20 37 Q7 32 7 20 L7 8 Z" />
        <path d="M20 9 L27 12 L27 20 Q27 27 20 30 Q13 27 13 20 L13 12 Z" fill={RG.subtle} />
        <path d="M15 19 L19 23 L25 16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke={RG.light} />
      </svg>
    ),
  },
  {
    id: "justice",
    title: "Adalet Hareketi",
    sub: "Güçlünün Değil, Hak Edenin Yanında",
    short: "Sırf reklam bütçesi var diye parlatılan yapay güçlerin, gerçek emeği gölgelemesine izin verme.",
    long: "Sırf reklam bütçesi var diye parlatılan yapay güçlerin, gerçek emeği gölgelemesine izin verme. Şeffaf değerlendirmelerinle bu adalet hareketine omuz ver; gücü hak edene birlikte teslim edelim.",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke={RG.primary} strokeWidth="1">
        <line x1="20" y1="4" x2="20" y2="10" strokeWidth="1.5" />
        <line x1="20" y1="10" x2="20" y2="36" strokeWidth="1" />
        <line x1="8" y1="10" x2="32" y2="10" strokeWidth="1.5" />
        <line x1="8" y1="10" x2="4" y2="22" />
        <line x1="4" y1="22" x2="12" y2="22" />
        <line x1="12" y1="22" x2="8" y2="10" />
        <line x1="32" y1="10" x2="36" y2="22" />
        <line x1="36" y1="22" x2="28" y2="22" />
        <line x1="28" y1="22" x2="32" y2="10" />
        <line x1="2" y1="36" x2="38" y2="36" strokeWidth="1.5" />
      </svg>
    ),
  },
];

function ManifestoSection({ barberCount }: { barberCount: number }) {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden" style={{ background: "#020202" }}>

      {/* -- Coming Soon banner -- */}
      <div className="relative z-50 flex items-center justify-center gap-4 py-4 px-6 text-center"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.18) 40%, rgba(201,169,110,0.22) 50%, rgba(201,169,110,0.18) 60%, transparent 100%)", borderBottom: "1px solid rgba(201,169,110,0.35)", boxShadow: "0 2px 20px rgba(201,169,110,0.1)" }}>
        <span className="inline-block w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "#C9A96E", boxShadow: "0 0 8px rgba(201,169,110,0.8)" }} />
        <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: "#C9A96E", letterSpacing: "0.2em" }}>
          🕐 Yakında Açılıyor — Beta sürecindeyiz, çok yakında hizmetinizdeyiz
        </p>
        <span className="inline-block w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "#C9A96E", boxShadow: "0 0 8px rgba(201,169,110,0.8)" }} />
      </div>

      {/* -- Arka plan: karbon fiber benzeri çok ince doku -- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Çok ince diagonal desen — dijital ızgara yok */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 12px)", opacity: 0.6 }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.008) 0px, rgba(255,255,255,0.008) 1px, transparent 1px, transparent 12px)", opacity: 0.5 }} />
        {/* Merkez radyal ışık */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 20%, rgba(31,64,104,0.06) 0%, transparent 65%)" }} />
        {/* Üst ve alt ince çizgiler */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent 5%, rgba(31,64,104,0.35) 50%, transparent 95%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent 5%, rgba(31,64,104,0.2) 50%, transparent 95%)" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-36">

        {/* -- Amblem -- */}
        <div className="flex justify-center mb-14">
          <div className="relative">
            {/* Güçlü ambient glow */}
            <div className="absolute inset-[-20%] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(31,64,104,0.3) 0%, rgba(201,169,110,0.1) 40%, transparent 70%)", filter: "blur(20px)" }} />
            <MasterynEmblem size={148} className="relative z-10" />
          </div>
        </div>

        {/* -- Başlık bloğu -- */}
        <div className="text-center mb-20">
          {/* "MANİFESTO" — ultra ince, çok geniş tracking */}
          <p className="mb-6" style={{
            fontWeight: 300,
            fontSize: "11px",
            letterSpacing: "0.45em",
            color: "rgba(175,115,90,0.5)",
            textTransform: "uppercase",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}>
            Manifesto
          </p>

          {/* "Masteryn" — keskin serif, rose gold metalik */}
          <h2 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: "clamp(42px, 7vw, 72px)",
            fontWeight: 700,
            fontStyle: "italic",
            letterSpacing: "0.04em",
            lineHeight: 1.1,
            marginBottom: "28px",
            background: `linear-gradient(160deg, ${RG.light} 0%, ${RG.primary} 35%, #9E5A42 65%, ${RG.dark} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: `drop-shadow(0 0 20px ${RG.glow})`,
          }}>
            Masteryn
          </h2>

          {/* Açıklama — daha koyu gri, bakır vurgu */}
          <p style={{
            color: "#5a5a5a",
            fontSize: "clamp(14px, 2vw, 17px)",
            maxWidth: "500px",
            margin: "0 auto",
            lineHeight: 1.75,
            letterSpacing: "0.015em",
          }}>
            Sadece bir uygulama değil,{" "}
            <span style={{ color: RG.primary, fontStyle: "italic" }}>kuaförlükte zanaatı ve liyakati parlatan şeffaf</span>
            {" "}bir adalet mekanizmasıyız.
          </p>

          {/* İstatistikler — zarif, ince font */}
          <div className="flex items-center justify-center gap-14 mt-14">
            {[
              { n: `${barberCount}+`, label: "Doğrulanmış Usta", rg: true },
              { n: "8/10",            label: "Kalite Barajı",    rg: true },
              { n: "%100",            label: "Filtresiz",        rg: false },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <div style={{
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  color: i === 2 ? "var(--gold)" : RG.primary,
                  fontFamily: "var(--font-geist-sans), system-ui",
                }}>{s.n}</div>
                <div style={{
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  color: "#3a3a3a",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  fontWeight: 400,
                }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Dekoratif ayırıcı */}
          <div className="flex items-center justify-center gap-4 mt-14">
            <div className="h-px w-24" style={{ background: `linear-gradient(to right, transparent, ${RG.border})` }} />
            <div className="w-1 h-1 rounded-full" style={{ background: RG.primary, opacity: 0.5 }} />
            <div className="h-px w-24" style={{ background: `linear-gradient(to left, transparent, ${RG.border})` }} />
          </div>
        </div>

        {/* -- 3 Kart -- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-16">
          {MANIFESTO_CARDS.map((card) => {
            const isActive = activeCard === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setActiveCard(isActive ? null : card.id)}
                className="text-left focus:outline-none group transition-all duration-400"
                style={{
                  borderRadius: "18px",
                  padding: "28px",
                  background: isActive
                    ? `linear-gradient(135deg, #0e0b09 0%, #0a0908 100%)`
                    : "linear-gradient(135deg, #0a0a0a 0%, #080808 100%)",
                  // Ultra ince rose gold filaman kenarlık
                  border: `1px solid ${isActive ? `${RG.primary}40` : "rgba(255,255,255,0.05)"}`,
                  boxShadow: isActive
                    ? `0 0 40px ${RG.glow}, 0 8px 32px rgba(0,0,0,0.6), inset 0 0 0 0.5px ${RG.border}`
                    : "0 2px 16px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.02)",
                  transform: isActive ? "translateY(-5px)" : "translateY(0)",
                }}>

                {/* İkon — rose gold metalik SVG */}
                <div className="mb-6" style={{
                  filter: isActive
                    ? `drop-shadow(0 0 10px ${RG.glow})`
                    : "none",
                  opacity: isActive ? 1 : 0.65,
                  transition: "all 0.3s ease",
                }}>
                  {card.icon}
                </div>

                {/* Başlık */}
                <p style={{
                  color: isActive ? "#e8e8e8" : "#888",
                  fontSize: "15px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                  transition: "color 0.3s",
                }}>{card.title}</p>

                {/* Alt başlık */}
                <p style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isActive ? RG.primary : "#3a3a3a",
                  marginBottom: "16px",
                  fontWeight: 400,
                  transition: "color 0.3s",
                }}>{card.sub}</p>

                {/* Metin */}
                <p style={{
                  color: isActive ? "#5a5a5a" : "#3a3a3a",
                  fontSize: "13px",
                  lineHeight: 1.7,
                  letterSpacing: "0.01em",
                  transition: "color 0.3s",
                }}>
                  {isActive ? card.long : card.short}
                </p>

                {/* Ok ikonu (OKU yazısı yok) */}
                <div className="flex justify-end mt-6">
                  <div style={{
                    width: "28px", height: "28px",
                    borderRadius: "50%",
                    border: `1px solid ${isActive ? `${RG.primary}50` : "rgba(255,255,255,0.06)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                  }}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none"
                      stroke={isActive ? RG.primary : "#3a3a3a"} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d={isActive ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* -- Manipülesiz İtibar kapanış -- */}
        <div className="relative rounded-3xl text-center overflow-hidden"
          style={{
            padding: "clamp(36px, 6vw, 56px) clamp(24px, 5vw, 48px)",
            background: "linear-gradient(160deg, #080604 0%, #060504 100%)",
            border: `1px solid ${RG.border}`,
            boxShadow: `0 0 60px rgba(31,64,104,0.05), inset 0 0 0 0.5px rgba(255,255,255,0.02)`,
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(31,64,104,0.04) 0%, transparent 70%)" }} />
          <div className="relative">
            <p style={{
              fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(31,64,104,0.4)", marginBottom: "20px", fontWeight: 300,
            }}>
              Manipülesiz İtibar
            </p>
            <p style={{
              color: "#4a4a4a",
              fontSize: "clamp(15px, 2.5vw, 20px)",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.8,
              letterSpacing: "0.015em",
              fontStyle: "italic",
            }}>
              Burada puanlar{" "}
              <span style={{ color: RG.primary, fontStyle: "normal", fontWeight: 500 }}>satın alınamaz</span>,
              sadece{" "}
              <span style={{ color: RG.primary, fontStyle: "normal", fontWeight: 500 }}>hak edilir</span>.
              Filtresiz fotoğraflar ve doğrulanmış iş geçmişi ile
              sadece gerçeği yansıtıyoruz.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

interface GalleryPost {
  id: string; images: { url: string }[];
  barber: { id: string; name: string; surname: string; salonName?: string | null; overallScore: number; specialties: string[] };
}

export default function HomeClient({
  barbers,
  galleryPosts = [],
  topBarber,
}: {
  barbers: Barber[];
  galleryPosts?: GalleryPost[];
  topBarber?: Barber | null;
}) {
  const [query, setQuery]    = useState("");
  const [specialty, setSpec] = useState("");
  const searchRef            = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    // Türkçe karaktere duyarlı normalize
    const norm = (s: string) => s.toLocaleLowerCase("tr-TR").trim();

    // Çağrıştırıcı arama — sinonim haritası
    const SYNONYMS: Record<string, string[]> = {
      "boya":       ["boyama", "balayage", "ombre", "röfle"],
      "renk":       ["boyama", "balayage", "ombre", "röfle"],
      "highlight":  ["röfle", "balayage"],
      "perm":       ["perma"],
      "kıvırcık":   ["perma"],
      "saç":        ["saç kesimi", "saç boyama", "saç bakımı"],
      "bakım":      ["saç bakımı", "keratin", "nem bakımı"],
      "nem":        ["nem bakımı"],
      "çocuk":      ["çocuk kesimi"],
      "klasik":     ["klasik kesim"],
      "modern":     ["modern kesim"],
      "ist":        ["istanbul"],
      "ank":        ["ankara"],
      "izm":        ["izmir"],
      "brs":        ["bursa"],
    };

    const q = norm(query);
    if (!q) return barbers.filter(b => !specialty || b.specialties.includes(specialty));

    // Sorguyu sinonimlerle genişlet
    const terms = new Set<string>([q]);
    for (const [key, vals] of Object.entries(SYNONYMS)) {
      if (norm(key).includes(q) || q.includes(norm(key))) {
        vals.forEach(v => terms.add(norm(v)));
      }
    }

    return barbers.filter((b) => {
      const fields = [b.name, b.surname, b.salonName ?? "", b.city, b.district ?? "", ...b.specialties]
        .map(norm);
      const matchQ = [...terms].some(term => fields.some(f => f.includes(term)));
      const matchS = !specialty || b.specialties.includes(specialty);
      return matchQ && matchS;
    });
  }, [barbers, query, specialty]);

  function scrollToSearch() {
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* ══════════════════════════════════════════
          NAV — Referans tasarım
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 border-b bg-[#080808]/95 backdrop-blur-xl"
        style={{ borderColor: "rgba(201,169,110,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo + tagline */}
          <div className="flex items-center gap-2.5 group">
            <div>
              <Logo size="sm" href="/" />
              <p className="text-[9px] leading-none -mt-0.5" style={{ color:"rgba(201,169,110,0.45)", letterSpacing:"0.18em" }}>
                USTALIĞIN DİGİTAL SERTİFİKASI.
              </p>
            </div>
          </div>

          {/* Sağ nav */}
          <nav className="flex items-center gap-5">
            <button onClick={() => scrollToSearch()}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <span className="text-xs hidden sm:block" style={{ letterSpacing:"0.05em" }}>Ara</span>
            </button>
            <Link href="/login" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Giriş</Link>
            <Link href="/register"
              className="text-zinc-900 font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              style={{ background: "#fff", letterSpacing:"0.03em" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 16px rgba(201,169,110,0.5)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}>
              Kayıt Ol
            </Link>
          </nav>
        </div>
      </header>

      {/* -- Coming Soon banner (2) -- */}
      <div className="relative z-50 flex items-center justify-center gap-4 py-4 px-6 text-center"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.18) 40%, rgba(201,169,110,0.22) 50%, rgba(201,169,110,0.18) 60%, transparent 100%)", borderBottom: "1px solid rgba(201,169,110,0.35)", boxShadow: "0 2px 20px rgba(201,169,110,0.1)" }}>
        <span className="inline-block w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "#C9A96E", boxShadow: "0 0 8px rgba(201,169,110,0.8)" }} />
        <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: "#C9A96E", letterSpacing: "0.2em" }}>
          🕐 Yakında Açılıyor — Beta sürecindeyiz, çok yakında hizmetinizdeyiz
        </p>
        <span className="inline-block w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "#C9A96E", boxShadow: "0 0 8px rgba(201,169,110,0.8)" }} />
      </div>

      {/* ══════════════════════════════════════════
          HERO — Artemis tarzı: merkez metin,
          kenarlarda floating barber görselleri
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "#080806", minHeight: "88vh" }}>

        {/* Radyal ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,169,110,0.055) 0%, transparent 70%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(201,169,110,0.2), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(201,169,110,0.12), transparent)" }} />

        {/* -- Floating görseller -- */}
        {(() => {
          const STATIC = [4, 6, 7, 8, 15, 16, 17, 18, 19, 20, 21].map((n) => `/images/barber${n}.jpg`);
          const pick = (i: number) => {
            const dbUrl = galleryPosts[i]?.images[0]?.url;
            // Sadece /uploads ile başlayan (kendi sunucumuzdan) URL'leri kullan
            return (dbUrl && dbUrl.startsWith("/uploads")) ? dbUrl : STATIC[i];
          };
          const L1 = pick(0);
          const L2 = pick(1);
          const L3 = pick(2);
          const R1 = pick(3);
          const R2 = pick(4);
          const R3 = pick(5);

          const card = (
            url: string, rot: number, x: string, y: string,
            w: string, zIndex: number, opacity: number,
            extraStyle: React.CSSProperties = {},
            label?: string
          ) => (
            <div style={{
              position: "absolute", width: w, height: `calc(${w} * 1.25)`,
              transform: `rotate(${rot}deg)`, left: x, top: y,
              ...extraStyle, zIndex,
              borderRadius: "18px",
              overflow: "hidden",
              opacity,
              boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.12)",
              border: "1px solid rgba(201,169,110,0.15)",
            }}>
              <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,8,6,0.45) 0%, transparent 60%)" }} />
              {label && <div style={{ position:"absolute", bottom:8, left:8, fontSize:"8px", padding:"2px 6px", borderRadius:"4px", background:"rgba(0,0,0,0.65)", color:"rgba(201,169,110,0.7)", border:"1px solid rgba(201,169,110,0.2)", letterSpacing:"0.1em" }}>{label}</div>}
            </div>
          );

          const cardStyle = (rot: number, x: string, y: string, w: string, zIndex: number, opacity: number, extra: React.CSSProperties = {}) => ({
            position: "absolute" as const,
            width: w, height: `calc(${w} * 1.25)`,
            transform: `rotate(${rot}deg)`, left: x, top: y,
            ...extra, zIndex, opacity,
            borderRadius: "18px", overflow: "hidden" as const,
            boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.12)",
            border: "1px solid rgba(201,169,110,0.15)",
          });

          return (
            <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 10 }}>

              {/* ── Masaüstü: büyük floating kartlar ── */}
              <div className="hidden md:block">
                {card(L1, -7, "3%",   "6%",  "190px", 8, 0.85, {}, "FİLTRESİZ")}
                {card(L2,  5, "7%",  "52%",  "175px", 7, 0.80)}
                {card(L3, -3, "-2%", "32%",  "150px", 6, 0.65)}
                <div style={cardStyle(6, "auto", "8%", "192px", 8, 0.88, { right:"4%", left:"auto" })}>
                  <video src="/videos/hero.mp4" autoPlay loop muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,8,6,0.45) 0%, transparent 60%)" }} />
                  <div style={{ position:"absolute", bottom:8, left:8, fontSize:"8px", padding:"2px 6px", borderRadius:"4px", background:"rgba(0,0,0,0.65)", color:"rgba(201,169,110,0.7)", border:"1px solid rgba(201,169,110,0.2)", letterSpacing:"0.1em" }}>▶ CANLI</div>
                </div>
                {card(R2, -5, "auto","50%",  "172px", 7, 0.78, { right:"6%", left:"auto" })}
                {card(R3,  3, "auto","28%",  "148px", 6, 0.60, { right:"1%", left:"auto" })}
              </div>

              {/* ── Mobil: küçük, kenara yaslanmış kartlar ── */}
              <div className="md:hidden">
                {/* Sol — üst */}
                {card(L1, -6, "-14px", "8%",  "100px", 8, 0.75, {}, "FİLTRESİZ")}
                {/* Sol — alt */}
                {card(L2,  4, "-14px", "55%", "88px",  7, 0.55)}
                {/* Sağ — üst video */}
                <div style={{ ...cardStyle(5, "auto", "8%", "100px", 8, 0.75, { right:"-14px", left:"auto" }) }}>
                  <video src="/videos/hero.mp4" autoPlay loop muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,8,6,0.45) 0%, transparent 60%)" }} />
                  <div style={{ position:"absolute", bottom:6, left:6, fontSize:"7px", padding:"1px 5px", borderRadius:"3px", background:"rgba(0,0,0,0.65)", color:"rgba(201,169,110,0.7)", border:"1px solid rgba(201,169,110,0.2)", letterSpacing:"0.1em" }}>▶ CANLI</div>
                </div>
                {/* Sağ — alt */}
                {card(R2, -4, "auto", "55%", "88px",  7, 0.55, { right:"-14px", left:"auto" })}
              </div>

            </div>
          );
        })()}

        {/* -- Merkez içerik -- */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-24 md:px-6 py-24" style={{ minHeight: "88vh" }}>

          {/* Logo + tagline */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="text-left">
              <Logo size="sm" href={undefined as never} />
              <p className="text-[9px] -mt-0.5" style={{ color:"rgba(201,169,110,0.38)", letterSpacing:"0.2em" }}>
                USTALIĞIN DİGİTAL SERTİFİKASI.
              </p>
            </div>
          </div>

          {/* "This is Masteryn" label */}
          <p className="mb-4 text-[11px] uppercase" style={{ color:"rgba(201,169,110,0.4)", letterSpacing:"0.25em", fontWeight:300 }}>
            Türkiye'nin İlk Şeffaf Kuaför Platformu
          </p>

          {/* Ana slogan — büyük, italic serif */}
          <h1 className="mb-5 leading-[1.05]" style={{ maxWidth:"680px" }}>
            <span className="font-black text-white block" style={{ fontSize:"clamp(38px,5.5vw,68px)", letterSpacing:"-0.01em" }}>
              Koltukta Sürpriz İstemeyenlerin
            </span>
            <span className="block" style={{
              fontSize: "clamp(38px,5.5vw,68px)",
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              background: "linear-gradient(135deg, #E8D09A 0%, #C9A96E 45%, #A8894E 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              filter: "drop-shadow(0 0 20px rgba(201,169,110,0.25))",
              letterSpacing: "-0.01em",
            }}>Buluşma Noktası.</span>
          </h1>

          {/* Alt metin */}
          <p style={{ color:"#4a4a4a", fontSize:"clamp(13px,1.3vw,15px)", maxWidth:"460px", lineHeight:1.7, letterSpacing:"0.01em", marginBottom:"32px" }}>
            Filtresiz kuaförlük fotoğrafları, şeffaf puanlama sistemi ve gerçek hizmetle
            Ustalığın dijital sertifikası.
          </p>

          {/* CTA */}
          <button onClick={() => scrollToSearch()}
            className="inline-flex items-center gap-2.5 font-semibold rounded-2xl transition-all"
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              color: "#0a0a0a", fontSize:"14px", letterSpacing:"0.04em",
              boxShadow: "0 4px 24px var(--gold-glow), 0 1px 0 rgba(255,255,255,0.12) inset",
            }}>
            Kuaförleri Keşfet
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>

          {/* Scroll göstergesi */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30">
            <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.6))" }} />
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.8)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* -- Canlı liyakat ticker -- */}
      <LiveTicker barbers={barbers as never} />


      {/* -- KUAFÖRLER -------------------------------- */}
      <section ref={searchRef} className="max-w-6xl mx-auto px-4 py-16">

        {/* -- Masteryn Onaylı — Carousel -- */}
        {!query && !specialty && (() => {
          const approved = barbers.filter((b) => b.overallScore >= 8);
          if (approved.length === 0) return null;
          return (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#DFC28A"/>
                        <stop offset="100%" stopColor="#A8894E"/>
                      </linearGradient>
                    </defs>
                    <path d="M29,4 L71,4 L96,29 L96,71 L71,96 L29,96 L4,71 L4,29 Z" fill="url(#cg2)"/>
                    <path d="M34,50 L44,62 L66,38" fill="none" stroke="#0a0a0a" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M34,50 L44,62 L66,38" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h2 className="text-white font-semibold text-sm" style={{ letterSpacing: "0.02em" }}>
                    Masteryn Onaylı
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                    style={{ background: "var(--gold-subtle)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}>
                    8/10+
                  </span>
                </div>
                <span className="text-zinc-600 text-xs">{approved.length} kuaför</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                {approved.map((b) => {
                  const raw = b.posts[0]?.images[0]?.url ?? null;
                  const coverImg = (raw && raw.startsWith("/uploads")) ? raw : `/images/barber${(b.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 21) + 1}.jpg`;
                  return (
                    <a key={b.id} href={`/profile/barber/${b.id}`}
                      className="flex-shrink-0 w-28 group">
                      <div className="relative w-28 h-36 rounded-2xl overflow-hidden mb-2 transition-transform group-hover:-translate-y-1"
                        style={{ border: "1px solid var(--gold-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                        <img src={coverImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
                        <div className="absolute bottom-2 left-2">
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg"
                            style={{ background: "rgba(0,0,0,0.7)", border: "1px solid var(--gold-border)" }}>
                            <span className="text-[9px] font-black" style={{ color: "var(--gold)" }}>
                              {b.overallScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-[10px] text-center truncate leading-tight group-hover:text-zinc-200 transition-colors"
                        style={{ letterSpacing: "0.02em" }}>
                        {b.salonName ?? b.name}
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* -- Uzmanlık Şeritleri (Carousel) -- */}
        {!query && !specialty && (() => {
          const specialtyGroups = [
            { label: "Saç Kesimi Ustaları", keys: ["Saç Kesimi","Klasik Kesim","Modern Kesim","Çocuk Kesimi","Stilist","Perma"] },
            { label: "Boya Uzmanları",       keys: ["Saç Boyama","Balayage","Ombre","Röfle"] },
            { label: "Bakım Uzmanları",      keys: ["Saç Bakımı","Keratin","Nem Bakımı"] },
          ];
          return specialtyGroups.map(({ label, keys }) => {
            const group = barbers.filter((b) => b.specialties.some((s) => keys.includes(s)));
            if (group.length < 2) return null;
            return (
              <div key={label} className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-zinc-400 text-xs font-semibold uppercase"
                    style={{ letterSpacing: "0.1em" }}>{label}</h3>
                  <span className="text-zinc-700 text-xs">{group.length}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
                  {group.slice(0, 8).map((b) => {
                    const raw = b.posts[0]?.images[0]?.url ?? null;
                    const coverImg = (raw && raw.startsWith("/uploads")) ? raw : `/images/barber${(b.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 21) + 1}.jpg`;
                    return (
                      <a key={b.id} href={`/profile/barber/${b.id}`}
                        className="flex-shrink-0 w-24 group">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-1.5 transition-transform group-hover:-translate-y-0.5"
                          style={{ border: "1px solid #222", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                          <img src={coverImg} alt="" className="w-full h-full object-cover" />
                          {b.overallScore >= 8 && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: "var(--gold)", boxShadow: "0 0 6px rgba(201,169,110,0.5)" }}>
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-zinc-500 text-[10px] text-center truncate group-hover:text-zinc-300 transition-colors">
                          {b.salonName ?? b.name}
                        </p>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}

        {/* Arama çubuğu */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kuaför adı, şehir veya uzmanlık ara..."
            className="w-full pl-11 pr-10 py-3 text-sm rounded-2xl outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,169,110,0.2)",
              color: "#e4e4e7",
              caretColor: "#C9A96E",
            }}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(201,169,110,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onBlur={(e)  => { e.currentTarget.style.border = "1px solid rgba(201,169,110,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          />
          {query && (
            <button onClick={() => setQuery("")}
              className="absolute inset-y-0 right-3 flex items-center px-1"
              style={{ color: "rgba(201,169,110,0.5)" }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Bölüm başlığı — minimal */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(201,169,110,0.2))" }} />
          <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(201,169,110,0.4)", letterSpacing: "0.2em" }}>
            {query ? `"${query}" sonuçları` : "Tüm Kuaförler"}
          </p>
          <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(201,169,110,0.2))" }} />
        </div>

        {filtered.length === 0 && query ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">&ldquo;{query}&rdquo; için sonuç bulunamadı</p>
            <button onClick={() => setQuery("")}
              className="mt-3 text-zinc-600 hover:text-zinc-400 text-xs underline transition-colors">
              Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((b) => <BarberCard key={b.id} barber={b as never} />)}
          </div>
        )}
      </section>

      {/* -- MANİFESTO & NEDEN BİZ -------------------- */}
      <ManifestoSection barberCount={barbers.length} />

      {/* -- NASIL ÇALIŞIR? ------------------------- */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-400/80 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">Nasıl Çalışır?</h2>
          </div>

          {/* Kim için? — 3 kart */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-16">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
                  </svg>
                ),
                title: "KUAFÖRLER",
                desc: "Filtresiz kuaförlük portföyünle öne çık. Gerçek müşteri puanlarıyla itibarını inşa et, ustalığını hakettiği değerle sun.",
                href: "/register?type=barber",
                accent: "rgba(201,169,110,0.1)",
                borderHover: "rgba(201,169,110,0.25)",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                    <path d="M3 21h18M3 7v14M21 7v14M6 21V11m4 10V11m4 10V11m4 10V11M3 7l9-4 9 4M12 3v4"/>
                  </svg>
                ),
                title: "ATÖLYE SAHİPLERİ",
                desc: "Salonunun gerçek yeteneğini vitrine taşı. Ustalarının bireysel itibar karnesiyle müşteri güvenini kazanarak salon doluluk oranını artır.",
                href: "/register?type=barber",
                accent: "rgba(168,137,78,0.08)",
                borderHover: "rgba(168,137,78,0.2)",
              },
              {
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                ),
                title: "ÜYELER",
                desc: "Koltukta sürpriz istemiyor musun? Filtresiz gerçek sonuçlara bak, doğrulanmış ustayı seç, deneyimini kayıt altında tut.",
                href: "/register",
                accent: "rgba(201,169,110,0.06)",
                borderHover: "rgba(201,169,110,0.18)",
              },
            ].map(({ icon, title, desc, href, accent, borderHover }) => (
              <a key={title} href={href}
                className="flex items-start gap-3.5 p-5 rounded-2xl transition-all duration-200 group"
                style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = accent;
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = borderHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#0d0d0d";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1a1a1a";
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)", color: "rgba(201,169,110,0.65)" }}>
                  {icon}
                </div>
                <div>
                  <p className="text-white text-xs font-bold mb-1.5" style={{ letterSpacing: "0.1em" }}>{title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#444" }}>{desc}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Müşteri */}
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-500/15 border border-green-500/25 rounded-2xl flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Müşteri İçin</h3>
                  <p className="text-zinc-500 text-xs">Güvenle otur, dürüstçe değerlendir</p>
                </div>
              </div>
              <div className="space-y-6">
                {CUSTOMER_STEPS.map((step, i) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-black">{step.n}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-semibold">{step.title}</p>
                        {i < CUSTOMER_STEPS.length - 1 && (
                          <div className="flex-1 h-px bg-white/5" />
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register?type=customer"
                className="mt-8 w-full flex items-center justify-center bg-white text-zinc-900 font-semibold py-3.5 rounded-2xl hover:bg-zinc-100 transition-all text-sm">
                Müşteri Olarak Kayıt Ol →
              </Link>
            </div>

            {/* Usta */}
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/25 rounded-2xl flex items-center justify-center">
                  <span className="text-lg">✂️</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Kuaför İçin</h3>
                  <p className="text-zinc-500 text-xs">İtibarını inşa et, kariyerini güvenceye al</p>
                </div>
              </div>
              <div className="space-y-6">
                {BARBER_STEPS.map((step, i) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/8 border border-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-black">{step.n}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-semibold">{step.title}</p>
                        {i < BARBER_STEPS.length - 1 && (
                          <div className="flex-1 h-px bg-white/5" />
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register?type=barber"
                className="mt-8 w-full flex items-center justify-center bg-amber-400 text-zinc-900 font-bold py-3.5 rounded-2xl hover:bg-amber-300 transition-all text-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                Kuaför Olarak Başvur →
              </Link>
            </div>

            {/* İşverenler */}
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(168,137,78,0.15)", border: "1px solid rgba(168,137,78,0.25)" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.8)" strokeWidth={1.5} strokeLinecap="round">
                    <path d="M3 21h18M3 7v14M21 7v14M6 21V11m4 10V11m4 10V11m4 10V11M3 7l9-4 9 4M12 3v4"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Kuaför Salonları İçin</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Salonunu büyüt, liyakatla kazan</p>
                </div>
              </div>
              <div className="space-y-6">
                {EMPLOYER_STEPS.map((step, i) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(168,137,78,0.1)", border: "1px solid rgba(168,137,78,0.2)" }}>
                      <span className="text-xs font-black" style={{ color: "var(--gold-dark)" }}>{step.n}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-semibold">{step.title}</p>
                        {i < EMPLOYER_STEPS.length - 1 && (
                          <div className="flex-1 h-px bg-white/5" />
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register?type=barber"
                className="mt-8 w-full flex items-center justify-center font-bold py-3.5 rounded-2xl transition-all text-sm"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                  color: "#0a0a0a",
                  boxShadow: "0 4px 16px var(--gold-glow)",
                }}>
                Salon Olarak Katıl →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* -- FOOTER --------------------------------- */}
      <footer className="border-t border-white/5 py-14">
        <div className="max-w-6xl mx-auto px-4">
          {/* Manifesto */}
          <div className="relative rounded-3xl p-10 mb-12 text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #111008 0%, #0e0e0e 40%, #100e06 100%)",
              border: "1px solid rgba(201,169,110,0.14)",
              boxShadow: "0 0 60px rgba(201,169,110,0.06), inset 0 1px 0 rgba(201,169,110,0.08)",
            }}>
            {/* Arka plan deri/dokulu gradyan katmanı */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,169,110,0.06) 0%, transparent 70%)",
            }} />
            {/* Çapraz ışık çizgileri */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{ background: "repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(201,169,110,0.03) 40px, rgba(201,169,110,0.03) 41px)" }} />

            <div className="relative z-10">
              {/* Büyük tırnak — dekoratif, düşük opaklık */}
              <div className="relative mb-6">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-black leading-none select-none pointer-events-none"
                  style={{
                    fontSize: "clamp(80px, 12vw, 140px)",
                    color: "rgba(201,169,110,0.07)",
                    fontFamily: "Georgia, serif",
                    lineHeight: 1,
                  }}>"</span>
              </div>

              {/* Manifesto metni */}
              <p className="relative text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
                style={{ color: "#c8c8c8", letterSpacing: "0.01em" }}>
                Sadece bir uygulama değil,{" "}
                <span style={{ color: "var(--gold)" }}>kuaförlükte zanaatı ve liyakati parlatan</span>{" "}
                şeffaf bir{" "}
                <span style={{ color: "var(--gold-light)" }}>adalet mekanizmasıyız.</span>
              </p>

              {/* Kapanış tırnağı */}
              <span className="block mt-6 mb-4 select-none pointer-events-none"
                style={{
                  fontSize: "clamp(40px, 6vw, 60px)",
                  color: "rgba(201,169,110,0.08)",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                }}>"</span>

              {/* İmza */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(201,169,110,0.3))" }} />
                <p style={{
                  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "14px",
                  color: "rgba(201,169,110,0.55)",
                  letterSpacing: "0.08em",
                }}>— masteryn manifestosu</p>
                <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(201,169,110,0.3))" }} />
              </div>
            </div>
          </div>

          {/* Alt grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Logo + açıklama */}
            <div>
              <Logo size="md" href="/" />
              <p className="text-zinc-600 text-xs mt-3 leading-relaxed max-w-[200px]">
                Kuaförlükte güven ve şeffaflık için inşa edildi.
              </p>
            </div>

            {/* Hukuki */}
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Hukuki</p>
              <ul className="space-y-2">
                {["KVKK Aydınlatma Metni", "Kullanım Koşulları", "Çerez Politikası", "Hizmet ve Telafi Standartları"].map((t) => (
                  <li key={t}>
                    <span className="text-zinc-600 hover:text-zinc-400 text-sm cursor-pointer transition-colors">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">İletişim</p>
              <ul className="space-y-2">
                {["Destek Merkezi", "Usta Başvuru Hattı"].map((t) => (
                  <li key={t}>
                    <span className="text-zinc-600 hover:text-zinc-400 text-sm cursor-pointer transition-colors">{t}</span>
                  </li>
                ))}
                <li>
                  <Link href="/admin/login" className="text-zinc-700 hover:text-zinc-500 text-xs transition-colors">Admin →</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-700 text-xs">© 2026 masteryn. Tüm hakları saklıdır.</p>
            <p className="text-zinc-700 text-xs">Türkiye'nin İlk Şeffaf Kuaför Platformu</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
