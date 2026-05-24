export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/posts/[id]/like — toggle beğeni
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: id, userId: session.id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    const count = await prisma.postLike.count({ where: { postId: id } });
    return NextResponse.json({ liked: false, count });
  } else {
    await prisma.postLike.create({ data: { postId: id, userId: session.id } });
    const count = await prisma.postLike.count({ where: { postId: id } });
    return NextResponse.json({ liked: true, count });
  }
}

// GET /api/posts/[id]/like — beğeni sayısı ve durum
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  const count = await prisma.postLike.count({ where: { postId: id } });
  const liked = session
    ? !!(await prisma.postLike.findUnique({
        where: { postId_userId: { postId: id, userId: session.id } },
      }))
    : false;

  return NextResponse.json({ liked, count });
}
