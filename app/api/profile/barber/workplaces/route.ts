import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { salonName, city, role, startYear, endYear, isCurrent } = await req.json();
  if (!salonName || !startYear)
    return NextResponse.json({ error: "Salon adı ve başlangıç yılı zorunlu" }, { status: 400 });

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const count = await prisma.barberWorkplace.count({ where: { barberId: barber.id } });
  const workplace = await prisma.barberWorkplace.create({
    data: {
      barberId: barber.id,
      salonName,
      city: city || null,
      role: role || null,
      startYear: parseInt(startYear),
      endYear:   isCurrent ? null : endYear ? parseInt(endYear) : null,
      isCurrent: !!isCurrent,
      order: count,
    },
  });
  return NextResponse.json({ success: true, workplace });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) return NextResponse.json([]);

  const workplaces = await prisma.barberWorkplace.findMany({
    where: { barberId: barber.id },
    orderBy: [{ isCurrent: "desc" }, { startYear: "desc" }],
  });
  return NextResponse.json(workplaces);
}
