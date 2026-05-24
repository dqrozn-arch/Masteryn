export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminVerificationsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const pending = await prisma.barberWorkplace.findMany({
    where: { verificationToken: { not: null }, isVerified: false },
    include: { barber: { select: { name: true, surname: true, salonName: true, id: true } } },
    orderBy: { id: "desc" },
  });

  const verified = await prisma.barberWorkplace.findMany({
    where: { isVerified: true },
    include: { barber: { select: { name: true, surname: true, salonName: true, id: true } } },
    orderBy: { verifiedAt: "desc" },
    take: 20,
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">İşveren Doğrulamaları</h1>
        <p className="text-zinc-400 text-sm mt-1">
          <span className="text-amber-400 font-semibold">{pending.length}</span> bekliyor ·{" "}
          <span className="text-blue-400 font-semibold">{verified.length}</span> onaylı
        </p>
      </div>

      {/* Bekleyenler */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-amber-500/5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-white font-medium text-sm">Onay Bekleyen Doğrulama Talepleri</h2>
          <span className="text-amber-400 text-sm font-bold ml-auto">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-zinc-600 text-sm text-center">Bekleyen doğrulama talebi yok</p>
        ) : (
          <div className="divide-y divide-white/5">
            {pending.map((w) => (
              <div key={w.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400/80 text-xs font-bold">{w.barber.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/profile/barber/${w.barber.id}`} target="_blank" className="text-white text-sm font-medium hover:underline">
                      {w.barber.name} {w.barber.surname}
                    </Link>
                    <span className="text-zinc-600 text-xs">→</span>
                    <span className="text-zinc-300 text-sm">{w.salonName}</span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {w.role && `${w.role} · `}
                    {w.startYear} – {w.isCurrent ? "Günümüz" : w.endYear}
                    {w.city && ` · ${w.city}`}
                  </p>
                  {w.employerEmail && (
                    <p className="text-zinc-600 text-xs mt-0.5">İşveren: {w.employerName || w.employerEmail}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {w.verificationToken && (
                    <Link href={`/verify/${w.verificationToken}`} target="_blank"
                      className="text-xs bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded-xl transition-colors">
                      Doğrulama Linki
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onaylananlar */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-white font-medium text-sm">Onaylanmış Doğrulamalar</h2>
          <span className="text-blue-400 text-sm font-bold ml-auto">{verified.length}</span>
        </div>
        {verified.length === 0 ? (
          <p className="px-5 py-8 text-zinc-600 text-sm text-center">Henüz onaylanmış doğrulama yok</p>
        ) : (
          <div className="divide-y divide-white/5">
            {verified.map((w) => (
              <div key={w.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/profile/barber/${w.barber.id}`} target="_blank" className="text-white text-sm font-medium hover:underline">
                      {w.barber.name} {w.barber.surname}
                    </Link>
                    <span className="text-zinc-600 text-xs">→</span>
                    <span className="text-zinc-300 text-sm">{w.salonName}</span>
                    <span className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] px-2 py-0.5 rounded-lg font-semibold">
                      ✓ Doğrulandı
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {w.startYear} – {w.isCurrent ? "Günümüz" : w.endYear}
                    {w.verifierName && ` · ${w.verifierName} tarafından onaylandı`}
                  </p>
                </div>
                {w.verifiedAt && (
                  <p className="text-zinc-700 text-xs flex-shrink-0">
                    {new Date(w.verifiedAt).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
