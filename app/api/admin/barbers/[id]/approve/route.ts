export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const barber = await prisma.barberProfile.findUnique({ where: { id } });
  if (!barber) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await prisma.barberProfile.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
