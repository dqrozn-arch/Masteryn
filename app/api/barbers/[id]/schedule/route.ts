import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/barbers/[id]/schedule — usta tam haftalık takvimini alır
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.userType !== "BARBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber || barber.id !== id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const schedule = await prisma.barberAvailability.findMany({
    where: { barberId: id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ schedule });
}
