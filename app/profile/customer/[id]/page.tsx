import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostCard from "@/components/posts/PostCard";
import Link from "next/link";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customerProfile.findUnique({
    where: { id },
    include: {
      posts: { orderBy: { createdAt: "desc" }, include: { images: { orderBy: { order: "asc" } }, customer: true, barber: true } },
      receivedReviews: { orderBy: { createdAt: "desc" }, include: { barber: true } },
    },
  });
  if (!customer) notFound();

  const reviews = customer.receivedReviews;
  const avg4 = (r: typeof reviews[0]) =>
    (r.appointmentLoyalty + r.processCooperation + r.communicationRespect + r.feedbackHonesty) / 4;

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/4 to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-400 text-xs mb-6 transition-colors">← Ana Sayfa</Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              {customer.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{customer.name} {customer.surname}</h1>
              {customer.city && <p className="text-zinc-500 text-sm">{customer.city}</p>}
              <p className="text-zinc-700 text-xs mt-1">{customer.posts.length} paylaşım · {reviews.length} usta yorumu</p>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="glass rounded-2xl p-4 mt-5">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Usta Değerlendirmeleri</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Randevu", vals: reviews.map(r => r.appointmentLoyalty) },
                  { label: "İş Birliği", vals: reviews.map(r => r.processCooperation) },
                  { label: "Nezaket", vals: reviews.map(r => r.communicationRespect) },
                  { label: "Dürüstlük", vals: reviews.map(r => r.feedbackHonesty) },
                ].map((item) => {
                  const avg = item.vals.reduce((s,v)=>s+v,0)/item.vals.length;
                  return (
                    <div key={item.label}>
                      <div className={`text-lg font-bold ${avg >= 4 ? "text-green-400" : avg >= 3 ? "text-amber-400" : "text-red-400"}`}>
                        {avg.toFixed(1)}
                      </div>
                      <div className="text-zinc-600 text-[10px] mt-0.5">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        <section>
          <h2 className="text-white font-semibold mb-4">Paylaşımlar <span className="text-zinc-600 font-normal text-sm">({customer.posts.length})</span></h2>
          {customer.posts.length === 0
            ? <div className="glass rounded-2xl p-8 text-center"><p className="text-zinc-600 text-sm">Henüz paylaşım yok.</p></div>
            : <div className="grid grid-cols-2 gap-3">{customer.posts.map((p) => <PostCard key={p.id} post={p as never} showCustomer={false} showBarber />)}</div>
          }
        </section>

        <section>
          <h2 className="text-white font-semibold mb-4">Usta Yorumları <span className="text-zinc-600 font-normal text-sm">({reviews.length})</span></h2>
          {reviews.length === 0
            ? <div className="glass rounded-2xl p-8 text-center"><p className="text-zinc-600 text-sm">Henüz yorum yok.</p></div>
            : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="glass rounded-2xl p-4 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <Link href={`/profile/barber/${r.barber.id}`} className="text-white text-sm font-medium hover:underline">
                        {r.barber.salonName ?? `${r.barber.name} ${r.barber.surname}`}
                      </Link>
                      <span className={`text-sm font-bold ${avg4(r) >= 4 ? "text-green-400" : avg4(r) >= 3 ? "text-amber-400" : "text-red-400"}`}>
                        {avg4(r).toFixed(1)}/5
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {([["Randevu", r.appointmentLoyalty],["İş Birliği",r.processCooperation],["Nezaket",r.communicationRespect],["Dürüstlük",r.feedbackHonesty]] as [string,number][]).map(([l,v]) => (
                        <div key={l} className="flex items-center justify-between bg-white/3 rounded-lg px-2 py-1">
                          <span className="text-zinc-600 text-xs">{l}</span>
                          <span className="text-amber-400 text-xs">{"★".repeat(v)}<span className="text-zinc-800">{"★".repeat(5-v)}</span></span>
                        </div>
                      ))}
                    </div>
                    {r.comment && <p className="text-zinc-500 text-xs leading-relaxed">"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            )
          }
        </section>
      </div>
    </div>
  );
}
