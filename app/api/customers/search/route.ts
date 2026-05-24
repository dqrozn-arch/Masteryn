import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const customers = await prisma.customerProfile.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { surname: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, surname: true, avatar: true, city: true },
    take: 8,
  });

  return NextResponse.json(customers);
}
