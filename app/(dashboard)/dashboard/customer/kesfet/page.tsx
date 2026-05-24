export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import DiscoverClient from "./DiscoverClient";

export default async function DiscoverPage() {
  const barbers = await prisma.barberProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      posts: { take: 1, orderBy: { createdAt: "desc" }, include: { images: { take: 1, orderBy: { order: "asc" } } } },
      _count: { select: { receivedReviews: true, posts: true } },
    },
    orderBy: [{ reviewCount: "desc" }, { overallScore: "desc" }],
  });

  return <DiscoverClient barbers={barbers as never} />;
}
