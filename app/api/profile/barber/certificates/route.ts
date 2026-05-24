export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { name, issuer, year, description } = await req.json();
  if (!name) return NextResponse.json({ error: "Sertifika adı zorunlu" }, { status: 400 });

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const cert = await prisma.barberCertificate.create({
    data: {
      barberId: barber.id, name,
      issuer: issuer || null,
      year: year ? parseInt(year) : null,
      description: description || null,
    },
  });
  return NextResponse.json({ success: true, cert });
}
