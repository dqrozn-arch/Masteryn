import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const cert = await prisma.barberCertificate.findUnique({ where: { id } });
  if (!cert || cert.barberId !== barber.id)
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await prisma.barberCertificate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
