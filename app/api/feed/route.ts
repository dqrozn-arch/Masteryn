import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit  = 12;

  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    where: { barber: { status: "APPROVED" } },
    include: {
      images:   { orderBy: { order: "asc" }, take: 1 },
      customer: true,
      barber:   true,
    },
  });

  const hasMore   = posts.length > limit;
  const data      = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({ posts: data, nextCursor });
}
