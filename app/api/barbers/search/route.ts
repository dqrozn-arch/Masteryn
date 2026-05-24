import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q         = searchParams.get("q") ?? "";
  const specialty = searchParams.get("specialty") ?? "";
  const city      = searchParams.get("city") ?? "";

  const where: Record<string, unknown> = { status: "APPROVED" };

  if (q.length >= 2) {
    where.OR = [
      { name:      { contains: q, mode: "insensitive" } },
      { surname:   { contains: q, mode: "insensitive" } },
      { salonName: { contains: q, mode: "insensitive" } },
      { city:      { contains: q, mode: "insensitive" } },
      { district:  { contains: q, mode: "insensitive" } },
      { specialties: { has: q } },
    ];
  }

  if (specialty) {
    where.specialties = { has: specialty };
  }

  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  const barbers = await prisma.barberProfile.findMany({
    where,
    include: {
      posts: {
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { images: { take: 1, orderBy: { order: "asc" } } },
      },
      _count: { select: { receivedReviews: true, posts: true } },
    },
    orderBy: [
      { reviewCount: "desc" },
      { overallScore: "desc" },
    ],
    take: 50,
  });

  return NextResponse.json(barbers);
}
