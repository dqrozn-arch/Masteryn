export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const C_LABELS: Record<string, string> = {
  visualFidelity: "Görsel Sadakat", technicalSkill: "Teknik",
  processTransparency: "Şeffaflık", expectationMgmt: "Beklenti", compensationScore: "Telafi",
};
const B_LABELS: Record<string, string> = {
  appointmentLoyalty: "Randevu Sadakati", processCooperation: "Süreç İş Birliği",
  communicationRespect: "İletişim Nezaketi", feedbackHonesty: "Geri Bildirim",
};

export default async function MyReviewsPage() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.id },
    include: {
      givenReviews: { orderBy: { createdAt: "desc" }, include: { barber: true } },
      receivedReviews: { orderBy: { createdAt: "desc" }, include: { barber: true } },
    },
  });
  if (!profile) redirect("/login");

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">Yorumlarım</h1>

      {/* Verdiğim yorumlar */}
      <section className="mb-10">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          Ustalara Verdiğim Puanlar
          <span className="text-zinc-600 font-normal text-sm">({profile.givenReviews.length})</span>
        </h2>
        {profile.givenReviews.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-zinc-600 text-sm">Henüz bir usta değerlendirmediniz.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.givenReviews.map((r) => {
              const avg = ((r.visualFidelity + r.technicalSkill + r.processTransparency + r.expectationMgmt + r.compensationScore) / 5 * 2).toFixed(1);
              return (
                <div key={r.id} className="glass rounded-2xl p-4 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        {r.barber.name[0]}
                      </div>
                      <div>
                        <Link href={`/profile/barber/${r.barber.id}`} className="text-white text-sm font-medium hover:underline">
                          {r.barber.salonName ?? `${r.barber.name} ${r.barber.surname}`}
                        </Link>
                        <p className="text-zinc-600 text-xs">{new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 font-black">{avg}</span>
                      <span className="text-zinc-600 text-xs">/10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {Object.entries(C_LABELS).map(([key, label]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs font-semibold text-amber-400">{"★".repeat((r as never)[key])}</div>
                        <div className="text-zinc-700 text-[10px] leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                  {r.comment && <p className="text-zinc-500 text-xs leading-relaxed">"{r.comment}"</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ustalardan aldığım yorumlar */}
      <section>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          Ustalardan Gelen Yorumlar
          <span className="text-zinc-600 font-normal text-sm">({profile.receivedReviews.length})</span>
        </h2>
        {profile.receivedReviews.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-zinc-600 text-sm">Henüz bir usta sizi değerlendirmedi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.receivedReviews.map((r) => {
              const avg = ((r.appointmentLoyalty + r.processCooperation + r.communicationRespect + r.feedbackHonesty) / 4).toFixed(1);
              return (
                <div key={r.id} className="glass rounded-2xl p-4 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        {r.barber.name[0]}
                      </div>
                      <div>
                        <Link href={`/profile/barber/${r.barber.id}`} className="text-white text-sm font-medium hover:underline">
                          {r.barber.salonName ?? `${r.barber.name} ${r.barber.surname}`}
                        </Link>
                        <p className="text-zinc-600 text-xs">{new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-sm">{avg} <span className="text-zinc-600 text-xs font-normal">/5</span></span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {Object.entries(B_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between bg-white/3 rounded-lg px-2.5 py-1.5">
                        <span className="text-zinc-500 text-xs">{label}</span>
                        <span className="text-amber-400 text-xs">{"★".repeat((r as never)[key])}<span className="text-zinc-800">{"★".repeat(5-(r as never)[key])}</span></span>
                      </div>
                    ))}
                  </div>
                  {r.comment && <p className="text-zinc-500 text-xs mt-1 leading-relaxed">"{r.comment}"</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
