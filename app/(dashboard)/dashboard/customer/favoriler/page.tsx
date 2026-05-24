export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BarberCard from "@/components/barbers/BarberCard";

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");

  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) redirect("/login");

  const favorites = await prisma.customerFavorite.findMany({
    where: { customerId: customer.id },
    include: {
      barber: {
        include: {
          posts: { take: 4, orderBy: { createdAt: "desc" }, include: { images: { take: 1, orderBy: { order: "asc" } } } },
          _count: { select: { receivedReviews: true, posts: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Favorilerim</h1>
        <p className="text-zinc-600 text-sm mt-1">Takip ettiğin dürüst ustalar</p>
      </div>

      {favorites.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-4xl mb-4">🤍</p>
          <p className="text-zinc-400 font-medium">Henüz favori usta yok</p>
          <p className="text-zinc-600 text-sm mt-1">Usta kartındaki kalp ikonuna tıklayarak ekleyebilirsin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((f) => (
            <BarberCard key={f.id} barber={f.barber as never} isFavorite />
          ))}
        </div>
      )}
    </div>
  );
}
