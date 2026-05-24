export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [totalUsers, totalBarbers, totalCustomers, totalPosts, totalReviews, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.barberProfile.count(),
      prisma.customerProfile.count(),
      prisma.post.count(),
      prisma.customerToBarberReview.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { customerProfile: true, barberProfile: true },
      }),
    ]);
  return { totalUsers, totalBarbers, totalCustomers, totalPosts, totalReviews, recentUsers };
}

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const stats = await getStats();

  const statCards = [
    { label: "Toplam Kullanıcı", value: stats.totalUsers, color: "text-blue-400", href: null },
    { label: "Ustalar", value: stats.totalBarbers, color: "text-purple-400", href: "/admin/barbers" },
    { label: "Müşteriler", value: stats.totalCustomers, color: "text-green-400", href: "/admin/customers" },
    { label: "Paylaşımlar", value: stats.totalPosts, color: "text-yellow-400", href: "/admin/posts" },
    { label: "Değerlendirmeler", value: stats.totalReviews, color: "text-pink-400", href: null },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Hoş geldin, {session.name}</p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}</div>
            <div className="text-zinc-400 text-sm">{card.label}</div>
            {card.href && (
              <Link href={card.href} className="text-zinc-600 text-xs hover:text-zinc-400 mt-2 inline-block underline">
                Görüntüle →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Son kayıt olan kullanıcılar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-white font-semibold">Son Kayıt Olanlar</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {stats.recentUsers.length === 0 && (
            <p className="px-6 py-6 text-zinc-500 text-sm">Henüz kayıt yok.</p>
          )}
          {stats.recentUsers.map((u) => {
            const profile = u.customerProfile ?? u.barberProfile;
            const name = profile ? `${profile.name} ${profile.surname}` : "—";
            return (
              <div key={u.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                    {name[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{name}</p>
                    <p className="text-zinc-500 text-xs">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                    u.userType === "BARBER"
                      ? "bg-purple-950 text-purple-300 border border-purple-800"
                      : "bg-green-950 text-green-300 border border-green-800"
                  }`}>
                    {u.userType === "BARBER" ? "Usta" : "Müşteri"}
                  </span>
                  <p className="text-zinc-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
