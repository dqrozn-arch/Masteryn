export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostCard from "@/components/posts/PostCard";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import ConsultationButton from "./ConsultationButton";
import AppointmentBooking from "./AppointmentBooking";
import CampaignCard from "./CampaignCard";
import ProfileQRButton from "@/components/barbers/ProfileQRButton";

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="text-2xl font-bold text-white mb-0.5">{value > 0 ? value.toFixed(1) : "—"}</div>
      <div className="flex justify-center gap-0.5 mb-1">
        {[1,2,3,4,5].map((s) => (
          <span key={s} className={Math.round(value) >= s ? "text-amber-400 text-xs star-glow" : "text-zinc-800 text-xs"}>★</span>
        ))}
      </div>
      <div className="text-zinc-500 text-xs">{label}</div>
    </div>
  );
}

export default async function BarberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const barber = await prisma.barberProfile.findUnique({
    where: { id },
    include: {
      posts:          { orderBy: { createdAt: "desc" }, include: { images: { orderBy: { order: "asc" } }, customer: true, barber: true } },
      receivedReviews: { orderBy: { createdAt: "desc" }, include: { customer: true, images: { orderBy: { order: "asc" } } } },
      workplaces:     { orderBy: [{ isCurrent: "desc" }, { startYear: "desc" }] },
      certificates:   { orderBy: { year: "desc" } },
      campaigns:      { where: { isActive: true, OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!barber) notFound();

  return (
    <>
    <div className="min-h-screen bg-[#080808]">
      {/* Hero */}
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-400 text-xs mb-6 transition-colors">← Ana Sayfa</Link>

          {/* Profil kartı */}
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              {barber.avatar && /\.(mp4|mov|webm)$/i.test(barber.avatar) ? (
                <video src={barber.avatar} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : barber.avatar ? (
                <Image src={barber.avatar} alt={barber.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl font-black text-white">
                  {barber.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white tracking-tight">{barber.name} {barber.surname}</h1>
              {barber.salonName && <p className="text-amber-400/80 text-sm font-medium mt-0.5">{barber.salonName}</p>}
              <p className="text-zinc-500 text-sm mt-1">{barber.city}{barber.district ? `, ${barber.district}` : ""}</p>
              {barber.address && <p className="text-zinc-600 text-xs mt-0.5">{barber.address}</p>}
                  {barber.phone && (
                <a href={`tel:${barber.phone}`} className="text-zinc-400 hover:text-white text-xs mt-1 inline-block transition-colors">
                  {barber.phone}
                </a>
              )}
            </div>
          </div>

          {/* Inline sadece giriş yapılmamışsa göster */}
          {!session && (
            <div className="mt-5 flex gap-2">
              <a href="/login" className="flex-1 text-center py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: "var(--gold)", color: "#0a0a0a" }}>
                Danışma Başlatmak İçin Giriş Yap
              </a>
            </div>
          )}

          {/* Bio */}
          {barber.bio && (
            <p className="text-zinc-400 text-sm leading-relaxed mt-5 border-t border-white/5 pt-5">{barber.bio}</p>
          )}

          {/* Uzmanlık alanları */}
          {barber.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {barber.specialties.map((s) => (
                <span key={s} className="bg-amber-400/8 border border-amber-400/20 text-amber-300/80 text-xs px-3 py-1 rounded-xl">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Bileşik skor */}
          {barber.reviewCount > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Bileşik Skor</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-black ${barber.overallScore >= 8 ? "text-amber-400" : "text-amber-700"}`}>
                    {barber.overallScore.toFixed(1)}
                  </span>
                  <span className="text-zinc-600 text-sm">/10</span>
                  {barber.overallScore >= 8 && (
                    <span className="bg-green-500/15 border border-green-500/25 text-green-400 text-xs px-2 py-0.5 rounded-lg font-semibold">8/10 ✓</span>
                  )}
                  {barber.overallScore > 0 && barber.overallScore < 8 && (
                    <span className="bg-amber-900/30 border border-amber-700/30 text-amber-600 text-xs px-2 py-0.5 rounded-lg">İnceleme Altında</span>
                  )}
                </div>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(barber.overallScore / 10) * 100}%`, background: barber.overallScore >= 8 ? "linear-gradient(to right, #f59e0b, #fbbf24)" : "#92400e" }} />
              </div>
            </div>
          )}
          {/* 5 kriter ortalama */}
          {barber.reviewCount > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[
                { label: "Görsel Sadakat",  value: barber.avgVisualFidelity },
                { label: "Teknik",          value: barber.avgTechnical },
                { label: "Şeffaflık",       value: barber.avgTransparency },
                { label: "Beklenti",        value: barber.avgExpectation },
                { label: "Telafi",          value: barber.avgCompensation },
              ].map((item) => (
                <div key={item.label} className="glass rounded-xl p-2.5 text-center">
                  <div className="text-base font-bold text-white">{item.value > 0 ? item.value.toFixed(1) : "—"}</div>
                  <div className="text-zinc-600 text-[10px] mt-0.5 leading-tight">{item.label}</div>
                </div>
              ))}
            </div>
          )}
          <p className="text-zinc-700 text-xs text-center mt-2">{barber.reviewCount} değerlendirme</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

        {/* ── Aktif Kampanyalar ── */}
        {barber.campaigns.length > 0 && (
          <section>
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-base">⚡</span> Anlık Kampanyalar
            </h2>
            <div className="space-y-3">
              {barber.campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c as never} />
              ))}
            </div>
          </section>
        )}

        {/* Çalıştığı Yerler */}
        {barber.workplaces.length > 0 && (
          <section>
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              Çalıştığı Yerler
              <span className="text-zinc-600 font-normal text-sm">({barber.workplaces.length})</span>
            </h2>
            <div className="glass rounded-2xl p-5">
              <div className="space-y-0">
                {barber.workplaces.map((w, i) => (
                  <div key={w.id} className="flex items-start gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-1">
                      <div className={`w-3 h-3 rounded-full border-2 ${w.isCurrent ? "border-amber-400 bg-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "border-zinc-700 bg-zinc-900"}`} />
                      {i < barber.workplaces.length - 1 && <div className="w-px h-full min-h-[2.5rem] bg-zinc-800 mt-1" />}
                    </div>
                    {/* İçerik */}
                    <div className={`flex-1 ${i < barber.workplaces.length - 1 ? "pb-5" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white text-sm font-semibold">{w.salonName}</p>
                          {w.role && <p className="text-zinc-400 text-xs mt-0.5">{w.role}</p>}
                          <p className="text-zinc-600 text-xs mt-1">
                            {w.city && `${w.city} · `}
                            {w.startYear} – {w.isCurrent ? <span className="text-amber-400/70 font-medium">Günümüz</span> : w.endYear}
                          </p>
                        </div>
                        {w.isCurrent && (
                          <span className="bg-amber-400/10 border border-amber-400/20 text-amber-400/80 text-xs px-2 py-0.5 rounded-lg flex-shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Özgeçmiş — Çalıştığı Yerler + Sertifikalar */}
        {(barber.workplaces.length > 0 || barber.certificates.length > 0) && (
          <section>
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">Özgeçmiş</h2>
            <div className="glass rounded-2xl p-5 space-y-6">

              {barber.workplaces.length > 0 && (
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium mb-4">İş Deneyimi</p>
                  <div className="space-y-0">
                    {barber.workplaces.map((w, i) => (
                      <div key={w.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            w.isVerified
                              ? "border-blue-400 bg-blue-400/30 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                              : w.isCurrent
                              ? "border-amber-400 bg-amber-400/20"
                              : "border-zinc-700 bg-zinc-900"
                          }`} />
                          {i < barber.workplaces.length - 1 && (
                            <div className="w-px h-full min-h-[2.5rem] bg-zinc-800 mt-1" />
                          )}
                        </div>
                        <div className={`flex-1 ${i < barber.workplaces.length - 1 ? "pb-5" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-white text-sm font-semibold">{w.salonName}</p>
                                {w.isVerified && (
                                  <span className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] px-2 py-0.5 rounded-lg font-semibold">
                                    ✓ Doğrulandı
                                  </span>
                                )}
                                {w.isCurrent && (
                                  <span className="bg-amber-400/10 border border-amber-400/20 text-amber-400/80 text-[11px] px-2 py-0.5 rounded-lg">Aktif</span>
                                )}
                              </div>
                              {w.role && <p className="text-zinc-400 text-xs mt-0.5">{w.role}</p>}
                              <p className="text-zinc-600 text-xs mt-0.5">
                                {w.city && `${w.city} · `}
                                {w.startYear} – {w.isCurrent ? <span className="text-amber-400/70">Günümüz</span> : w.endYear}
                              </p>
                              {w.isVerified && w.verifierName && (
                                <p className="text-blue-400/50 text-xs mt-0.5">{w.verifierName} tarafından onaylandı</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {barber.workplaces.length > 0 && barber.certificates.length > 0 && (
                <div className="border-t border-white/5" />
              )}

              {barber.certificates.length > 0 && (
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium mb-4">Sertifikalar</p>
                  <div className="grid grid-cols-1 gap-3">
                    {barber.certificates.map((c) => (
                      <div key={c.id} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-base">🎓</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{c.name}</p>
                          {c.issuer && <p className="text-zinc-400 text-xs">{c.issuer}</p>}
                          {c.year && <p className="text-zinc-600 text-xs">{c.year}</p>}
                          {c.description && <p className="text-zinc-600 text-xs mt-0.5">{c.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Müşteri Paylaşımları */}
        <section>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            Müşteri Paylaşımları
            <span className="text-zinc-600 font-normal text-sm">({barber.posts.length})</span>
          </h2>
          {barber.posts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center"><p className="text-zinc-600 text-sm">Henüz paylaşım yok.</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {barber.posts.map((p) => <PostCard key={p.id} post={p as never} showCustomer showBarber={false} />)}
            </div>
          )}
        </section>

        {/* Değerlendirmeler */}
        <section>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            Müşteri Değerlendirmeleri
            <span className="text-zinc-600 font-normal text-sm">({barber.receivedReviews.length})</span>
          </h2>
          {barber.receivedReviews.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center"><p className="text-zinc-600 text-sm">Henüz değerlendirme yok.</p></div>
          ) : (
            <div className="space-y-4">
              {barber.receivedReviews.map((r) => (
                <div key={r.id} className="glass rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                  {r.images.length > 0 && (
                    <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
                      {r.images.map((img) => (
                        <div key={img.id} className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                          <Image src={img.url} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {r.customer.name[0]}
                        </div>
                        <div>
                          <Link href={`/profile/customer/${r.customer.id}`} className="text-white text-sm font-medium hover:underline">
                            {r.customer.name} {r.customer.surname}
                          </Link>
                          <p className="text-zinc-600 text-xs">{new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-2">
                      {([
                        ["Görsel",    r.visualFidelity],
                        ["Teknik",    r.technicalSkill],
                        ["Şeffaflık", r.processTransparency],
                        ["Beklenti",  r.expectationMgmt],
                        ["Telafi",    r.compensationScore],
                      ] as [string, number][]).map(([l, v]) => (
                        <span key={l} className="text-zinc-500">
                          {l}: <span className="text-amber-400">{"★".repeat(v)}</span><span className="text-zinc-800">{"★".repeat(5-v)}</span>
                        </span>
                      ))}
                    </div>
                    {r.comment && <p className="text-zinc-400 text-sm leading-relaxed">"{r.comment}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Sticky İletişim + Randevu Çubuğu (sadece müşteriler için) ── */}
      {session?.userType === "CUSTOMER" && (
        <ConsultationButton
          barberId={barber.id}
          barberName={barber.salonName ?? `${barber.name} ${barber.surname}`}
          phone={barber.phone}
          specialties={barber.specialties}
          overallScore={barber.overallScore}
          reviewCount={barber.reviewCount}
          appointmentSlot={
            <AppointmentBooking
              barberId={barber.id}
              barberName={barber.salonName ?? `${barber.name} ${barber.surname}`}
            />
          }
        />
      )}

      {/* Sticky bar için alt padding */}
      {session?.userType === "CUSTOMER" && <div className="h-36" />}
    </div>

    {/* Ustanın kendi profilinde QR butonu — wrapper dışında, iOS fixed sorununu önler */}
    {session?.userType === "BARBER" && session.id === barber.userId && (
      <ProfileQRButton
        barberId={barber.id}
        barberName={barber.salonName ?? `${barber.name} ${barber.surname}`}
      />
    )}
    </>
  );
}
