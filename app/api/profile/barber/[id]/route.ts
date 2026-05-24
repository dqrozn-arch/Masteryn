export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const barber = await prisma.barberProfile.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { order: "asc" } }, customer: true },
      },
      receivedReviews: {
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      },
    },
  });

  if (!barber) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(barber);
}
