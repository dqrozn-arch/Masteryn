import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function Home() {
  let barbers: Awaited<ReturnType<typeof prisma.barberProfile.findMany>> = [];
  let galleryPosts: Awaited<ReturnType<typeof prisma.post.findMany>> = [];

  try {
    [barbers, galleryPosts] = await Promise.all([
      prisma.barberProfile.findMany({
        where: { status: "APPROVED" },
        include: {
          posts: { take: 4, orderBy: { createdAt: "desc" }, include: { images: { take: 1, orderBy: { order: "asc" } } } },
          _count: { select: { receivedReviews: true, posts: true } },
        },
        orderBy: [{ reviewCount: "desc" }, { overallScore: "desc" }],
      }),
      prisma.post.findMany({
        where: { barber: { status: "APPROVED" }, images: { some: {} } },
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          barber: { select: { id: true, name: true, surname: true, salonName: true, overallScore: true, specialties: true } },
        },
        orderBy: [{ barber: { overallScore: "desc" } }, { createdAt: "desc" }],
        take: 12,
      }),
    ]);
  } catch {
    // DB unavailable — render with empty data
  }

  // En yüksek puanlı onaylı usta (hero kart için)
  const topBarber = barbers.find((b) => b.overallScore >= 8) ?? barbers[0] ?? null;

  return <HomeClient barbers={barbers as never} galleryPosts={galleryPosts as never} topBarber={topBarber as never} />;
}
