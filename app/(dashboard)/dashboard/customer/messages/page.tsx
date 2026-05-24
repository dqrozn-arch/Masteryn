import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function CustomerMessagesPage() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");

  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) redirect("/login");

  const convs = await prisma.conversation.findMany({
    where: { customerId: customer.id },
    include: {
      barber:   { select: { id: true, name: true, surname: true, salonName: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Mesajlar</h1>
      <p className="text-zinc-600 text-xs mb-6">Masteryn Güvenli Kanal — tüm görüşmeler kayıt altında</p>

      {convs.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-zinc-400 font-medium">Henüz mesaj yok</p>
          <p className="text-zinc-600 text-xs mt-1">Bir ustanın profilinden danışma başlatabilirsin.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((c) => {
            const lastMsg = c.messages[0];
            const preview = lastMsg?.type === "AGREEMENT" ? "🛡 Resmi Teklif"
              : lastMsg?.type === "IMAGE" ? "📷 Görsel"
              : lastMsg?.type === "SYSTEM" ? "🔔 Sistem bildirimi"
              : lastMsg?.text ?? "Konuşma başladı";
            return (
              <Link key={c.id} href={`/messages/${c.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl hover:border-white/10 transition-all group"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid #252525" }}>
                  {c.barber.avatar ? (
                    <Image src={c.barber.avatar} alt="" width={44} height={44} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-sm"
                      style={{ background: "linear-gradient(135deg,var(--gold-dark),var(--copper))" }}>
                      {c.barber.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-amber-100 transition-colors">
                    {c.barber.salonName ?? `${c.barber.name} ${c.barber.surname}`}
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
