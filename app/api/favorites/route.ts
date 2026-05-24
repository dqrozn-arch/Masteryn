export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) return NextResponse.json([]);

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

  return NextResponse.json(favorites.map((f) => f.barber));
}
