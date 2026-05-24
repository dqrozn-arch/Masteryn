import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminBarbersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const barbers = await prisma.barberProfile.findMany({
    orderBy: { user: { createdAt: "desc" } },
    include: {
      user: { select: { email: true, createdAt: true } },
      _count: { select: { posts: true, receivedReviews: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ustalar</h1>
          <p className="text-zinc-400 text-sm mt-1">{barbers.length} usta kayıtlı</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">Ad / Salon</th>
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">Konum</th>
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">E-posta</th>
                <th className="text-center px-6 py-3 text-zinc-400 font-medium">Paylaşım</th>
                <th className="text-center px-6 py-3 text-zinc-400 font-medium">Değ.</th>
                <th className="text-center px-6 py-3 text-zinc-400 font-medium">Skor</th>
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {barbers.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/profile/barber/${b.id}`} target="_blank"
                      className="text-white font-medium hover:underline">
                      {b.name} {b.surname}
                    </Link>
                    {b.salonName && <p className="text-zinc-500 text-xs">{b.salonName}</p>}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {b.city}{b.district ? `, ${b.district}` : ""}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">{b.user.email}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{b._count.posts}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{b._count.receivedReviews}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={b.overallScore >= 8 ? "text-amber-400 font-bold" : b.overallScore > 0 ? "text-amber-700" : "text-zinc-600"}>
                      {b.overallScore > 0 ? `${b.overallScore.toFixed(1)}/10` : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">
                    {new Date(b.user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
              {barbers.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-zinc-500">
                    Henüz usta yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
