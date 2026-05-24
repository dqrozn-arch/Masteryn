import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const barbers = await prisma.barberProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      posts: {
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { images: { take: 1, orderBy: { order: "asc" } } },
      },
      _count: { select: { receivedReviews: true, posts: true } },
    },
    orderBy: [{ reviewCount: "desc" }, { overallScore: "desc" }],
  });
  return NextResponse.json(barbers);
}
