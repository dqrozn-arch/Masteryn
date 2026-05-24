export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function AdminPostsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      customer: true,
      barber: true,
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Paylaşımlar</h1>
        <p className="text-zinc-400 text-sm mt-1">{posts.length} paylaşım</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {p.images[0] && (
              <div className="relative aspect-video bg-zinc-800">
                <Image src={p.images[0].url} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <Link href={`/profile/customer/${p.customer.id}`} target="_blank"
                    className="text-white text-sm font-medium hover:underline">
                    {p.customer.name} {p.customer.surname}
                  </Link>
                  <p className="text-zinc-500 text-xs">→ <Link href={`/profile/barber/${p.barber.id}`}
                    target="_blank" className="hover:underline">
                    {p.barber.salonName ?? `${p.barber.name} ${p.barber.surname}`}
                  </Link></p>
                </div>
                <p className="text-zinc-600 text-xs flex-shrink-0">
                  {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              {p.caption && (
                <p className="text-zinc-400 text-xs line-clamp-2">{p.caption}</p>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <p className="text-zinc-500">Henüz paylaşım yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
