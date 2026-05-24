export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const customers = await prisma.customerProfile.findMany({
    orderBy: { user: { createdAt: "desc" } },
    include: {
      user: { select: { email: true, createdAt: true } },
      _count: { select: { posts: true, receivedReviews: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Müşteriler</h1>
        <p className="text-zinc-400 text-sm mt-1">{customers.length} müşteri kayıtlı</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">Ad Soyad</th>
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">E-posta</th>
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">Şehir</th>
                <th className="text-center px-6 py-3 text-zinc-400 font-medium">Paylaşım</th>
                <th className="text-center px-6 py-3 text-zinc-400 font-medium">Usta Yorumu</th>
                <th className="text-left px-6 py-3 text-zinc-400 font-medium">Kayıt</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{c.name} {c.surname}</p>
                    {c.phone && <p className="text-zinc-500 text-xs">{c.phone}</p>}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">{c.user.email}</td>
                  <td className="px-6 py-4 text-zinc-300">{c.city ?? "—"}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{c._count.posts}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{c._count.receivedReviews}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">
                    {new Date(c.user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/profile/customer/${c.id}`} target="_blank"
                      className="text-zinc-400 hover:text-white text-xs underline">
                      Profil
                    </Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-zinc-500">
                    Henüz müşteri yok.
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
