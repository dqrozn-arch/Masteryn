export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedPageClient from "./FeedPageClient";

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const LIMIT = 12;

  const [initialPosts, profile] = await Promise.all([
    prisma.post.findMany({
      take: LIMIT,
      orderBy: { createdAt: "desc" },
      where: { barber: { status: "APPROVED" } },
      include: {
        images: { orderBy: { order: "asc" } },
        customer: { select: { id: true, name: true, surname: true, avatar: true } },
        barber: { select: { id: true, name: true, surname: true, salonName: true, avatar: true } },
        _count: { select: { likes: true } },
      },
    }),
    session.userType === "CUSTOMER"
      ? prisma.customerProfile.findUnique({ where: { userId: session.id }, select: { id: true, name: true, avatar: true } })
      : prisma.barberProfile.findUnique({ where: { userId: session.id }, select: { id: true, name: true, avatar: true } }),
  ]);

  if (!profile) redirect("/login");

  const nextCursor = initialPosts.length === LIMIT ? initialPosts[initialPosts.length - 1].id : null;

  return (
    <FeedPageClient
      initialPosts={initialPosts as never}
      nextCursor={nextCursor}
      userType={session.userType}
      profile={profile}
    />
  );
}
