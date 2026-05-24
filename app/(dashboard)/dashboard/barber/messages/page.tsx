export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function BarberMessagesPage() {
  const session = await getSession();
  if (!session || session.userType !== "BARBER") redirect("/login");

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) redirect("/login");

  const convs = await prisma.conversation.findMany({
    where: { barberId: barber.id },
    include: {
      customer: { select: { id: true, name: true, surname: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Bekleyen teklif sayısı
  const pendingAgreements = await prisma.message.count({
    where: { conversation: { barberId: barber.id }, type: "AGREEMENT", agreementStatus: "PENDING" },
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Danışma Talepleri</h1>
        {pendingAgreements > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-xl font-semibold text-zinc-900"
            style={{ background: "var(--gold)" }}>
            {pendingAgreements} bekliyor
          </span>
        )}
      </div>
      <p className="text-zinc-600 text-xs mb-6">Masteryn Güvenli Kanal — resmi teklifleriniz burada kayıtlıdır</p>

      {convs.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-zinc-400 font-medium">Henüz danışma talebi yok</p>
          <p className="text-zinc-600 text-xs mt-1">Müşteriler usta profilinizden size ulaşabilir.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((c: typeof convs[number]) => {
            const lastMsg = c.messages[0];
            const preview = lastMsg?.type === "AGREEMENT" ? "🛡 Resmi Teklif"
              : lastMsg?.type === "SYSTEM" ? "🔔 Sistem bildirimi"
              : lastMsg?.text ?? "Danışma başladı";
            return (
              <Link key={c.id} href={`/messages/${c.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl hover:border-white/10 transition-all group"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid #252525" }}>
                  {c.customer.avatar ? (
                    <Image src={c.customer.avatar} alt="" width={44} height={44} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: "#1e1e1e" }}>
                      {c.customer.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium group-hover:text-amber-100 transition-colors">
                    {c.customer.name} {c.customer.surname}
                  </p>
                  <p className="text-zinc-600 text-xs truncate mt-0.5">{preview}</p>
                </div>
                <p className="text-zinc-700 text-[10px] flex-shrink-0">
                  {new Date(c.updatedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
