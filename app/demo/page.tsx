import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

const BARBER_ID  = "cmon8f4gz0001oklpkbgwc3lz";
const CUSTOMER_ID = "cmon8f4jh0003oklpixs366wb";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? "text-amber-400 star-glow" : "text-zinc-800"}>★</span>
      ))}
    </span>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-3.5 text-center">
      <div className="text-xl font-bold text-white">{value > 0 ? value.toFixed(1) : "—"}</div>
      <Stars value={value} />
      <div className="text-zinc-600 text-xs mt-1">{label}</div>
    </div>
  );
}

export default async function DemoPage() {
  const [barber, customer] = await Promise.all([
    prisma.barberProfile.findUnique({
      where: { id: BARBER_ID },
      include: {
        posts: { orderBy: { createdAt: "desc" }, include: { images: { orderBy: { order: "asc" } }, customer: true } },
        receivedReviews: { orderBy: { createdAt: "desc" }, include: { customer: true, images: { orderBy: { order: "asc" } } } },
      },
    }),
    prisma.customerProfile.findUnique({
      where: { id: CUSTOMER_ID },
      include: {
        posts: { orderBy: { createdAt: "desc" }, include: { images: { orderBy: { order: "asc" } }, barber: true } },
        receivedReviews: { orderBy: { createdAt: "desc" }, include: { barber: true } },
      },
    }),
  ]);

  if (!barber || !customer) return <div className="text-white p-8">Demo verisi bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Demo Banner */}
      <div className="border-b border-amber-500/10 bg-amber-500/5 px-4 py-3 text-center">
        <p className="text-amber-400/80 text-xs">Demo — Bu profiller tamamen hayalidir</p>
      </div>

      {/* Hero */}
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-64 bg-amber-500/4 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/3 w-96 h-64 bg-white/2 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center relative">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-zinc-600 hover:text-zinc-400 text-xs transition-colors">← Ana Sayfa</Link>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">masteryn</span>{" "}
            <span className="text-white">nasıl çalışır?</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Usta ve müşteri profilleri yan yana — iki taraflı şeffaflık
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── USTA PROFİLİ ─────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Usta Profili</span>
            </div>

            {/* Usta kartı */}
            <div className="glass rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-[0_0_24px_rgba(245,158,11,0.25)]">
                    {barber.name[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{barber.name} {barber.surname}</h2>
                    <p className="text-amber-400/80 text-sm">{barber.salonName}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{barber.city}, {barber.district}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-3xl font-black ${barber.overallScore >= 8 ? "text-amber-400" : "text-zinc-500"}`}>
                      {barber.overallScore > 0 ? barber.overallScore.toFixed(1) : "—"}
                    </span>
                    {barber.overallScore > 0 && <span className="text-zinc-600 text-sm ml-1">/10</span>}
                  </div>
                  {barber.overallScore >= 8 && <span className="bg-green-500/15 border border-green-500/25 text-green-400 text-xs px-2 py-0.5 rounded-lg">8/10 ✓</span>}
                </div>
                <p className="text-zinc-700 text-xs text-center mt-2">{barber.reviewCount} değerlendirme</p>
              </div>

              {/* Müşteri paylaşımları grid */}
              <div className="p-4 border-b border-white/5">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Müşteri Paylaşımları</p>
                <div className="grid grid-cols-3 gap-2">
                  {barber.posts.slice(0, 6).map((p) => p.images[0] && (
                    <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image src={p.images[0].url} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-white text-xs font-medium leading-tight">{p.customer.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-zinc-700 text-xs mt-3">Müşteriler paylaşınca usta profilinde de görünür</p>
              </div>

              {/* Değerlendirmeler */}
              <div className="p-4">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Müşteri Yorumları</p>
                <div className="space-y-3">
                  {barber.receivedReviews.map((r) => (
                    <div key={r.id} className="bg-white/3 rounded-2xl overflow-hidden">
                      {r.images.length > 0 && (
                        <div className="flex gap-2 p-3 pb-0">
                          {r.images.map((img) => (
                            <div key={img.id} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                              <Image src={img.url} alt="" fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-white text-xs font-semibold">{r.customer.name} {r.customer.surname}</p>
                          <span className="text-amber-400 text-xs font-bold">
                            {(((r as any).visualFidelity+(r as any).technicalSkill+(r as any).processTransparency+(r as any).expectationMgmt+(r as any).compensationScore)/5*2).toFixed(1)}/10
                          </span>
                        </div>
                        {r.comment && <p className="text-zinc-500 text-xs leading-relaxed">"{r.comment}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── MÜŞTERİ PROFİLİ ──────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Müşteri Profili</span>
            </div>

            <div className="glass rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-[0_0_24px_rgba(34,197,94,0.15)]">
                    {customer.name[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{customer.name} {customer.surname}</h2>
                    <p className="text-zinc-500 text-sm">{customer.city}</p>
                    <p className="text-zinc-700 text-xs mt-0.5">{customer.posts.length} paylaşım</p>
                  </div>
                </div>

                {/* Güven skoru */}
                <div className="bg-white/3 rounded-2xl p-4">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Usta Değerlendirmeleri</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Randevu", ok: customer.receivedReviews.filter((r: any) => r.appointmentLoyalty >= 4).length },
                      { label: "İş Birliği", ok: customer.receivedReviews.filter((r: any) => r.processCooperation >= 4).length },
                      { label: "Nezaket", ok: customer.receivedReviews.filter((r: any) => r.communicationRespect >= 4).length },
                    ].map((item) => {
                      const pct = item.ok / customer.receivedReviews.length;
                      return (
                        <div key={item.label}>
                          <div className={`text-xl font-bold ${pct === 1 ? "text-green-400" : pct >= 0.6 ? "text-amber-400" : "text-red-400"}`}>
                            {item.ok}/{customer.receivedReviews.length}
                          </div>
                          <div className="text-zinc-600 text-xs mt-0.5">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Paylaşımlar */}
              <div className="p-4 border-b border-white/5">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Paylaşımları</p>
                <div className="grid grid-cols-2 gap-2">
                  {customer.posts.slice(0, 4).map((p) => p.images[0] && (
                    <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image src={p.images[0].url} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2.5">
                        <p className="text-white text-xs font-medium">
                          {p.barber.salonName ?? `${p.barber.name} ${p.barber.surname}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usta yorumları */}
              <div className="p-4">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Usta Yorumları</p>
                <div className="space-y-3">
                  {customer.receivedReviews.map((r) => (
                    <div key={r.id} className="bg-white/3 rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white text-xs font-semibold">{r.barber.salonName ?? `${r.barber.name} ${r.barber.surname}`}</p>
                        <span className="text-amber-400 font-bold text-xs">
                          {((((r as any).appointmentLoyalty+(r as any).processCooperation+(r as any).communicationRespect+(r as any).feedbackHonesty)/4)).toFixed(1)}/5
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="bg-green-950/40 border border-green-800/30 text-green-400 text-xs px-2 py-0.5 rounded-lg">✓ Değerlendirildi</span>
                      </div>
                      {r.comment && <p className="text-zinc-500 text-xs mt-1.5">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="glass rounded-3xl p-8 max-w-lg mx-auto">
            <h2 className="text-white font-bold text-xl mb-2">Platforma Katıl</h2>
            <p className="text-zinc-500 text-sm mb-6">Şeffaf bir deneyim için hemen kayıt ol</p>
            <div className="flex gap-3 justify-center">
              <Link href="/register?type=customer"
                className="bg-white text-zinc-900 font-semibold px-6 py-3 rounded-2xl hover:bg-zinc-100 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-sm">
                Müşteri Olarak Kayıt Ol
              </Link>
              <Link href="/register?type=barber"
                className="glass border border-white/10 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/5 transition-all text-sm">
                Usta Olarak Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
