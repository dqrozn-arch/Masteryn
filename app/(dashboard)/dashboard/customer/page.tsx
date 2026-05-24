export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedClient from "./FeedClient";

export default async function CustomerHome() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.id },
    select: { id: true, name: true },
  });
  if (!profile) redirect("/login");

  const [initialPosts, featuredBarbers] = await Promise.all([
    prisma.post.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      where: { barber: { status: "APPROVED" } },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, customer: true, barber: true },
    }),
    prisma.barberProfile.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ reviewCount: "desc" }, { overallScore: "desc" }],
      include: {
        posts: { take: 4, orderBy: { createdAt: "desc" }, include: { images: { take: 1, orderBy: { order: "asc" } } } },
        _count: { select: { receivedReviews: true, posts: true } },
      },
    }),
  ]);

  return (
    <FeedClient
      customerName={profile.name}
      customerId={profile.id}
      initialPosts={initialPosts as never}
      featuredBarbers={featuredBarbers as never}
    />
  );
}
