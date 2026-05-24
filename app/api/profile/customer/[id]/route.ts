import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customerProfile.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { order: "asc" } }, barber: true },
      },
      receivedReviews: {
        orderBy: { createdAt: "desc" },
        include: { barber: true },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(customer);
}
