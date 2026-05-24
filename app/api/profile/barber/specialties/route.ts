export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { specialties } = await req.json();
  if (!Array.isArray(specialties))
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const clean = specialties
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0 && s.length <= 40)
    .slice(0, 15);

  await prisma.barberProfile.update({ where: { userId: session.id }, data: { specialties: clean } });
  return NextResponse.json({ success: true, specialties: clean });
}
