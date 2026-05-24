export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/barbers/[id]/availability?date=2026-05-20
// Belirli bir tarihteki müsait slotları döner
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) {
    return NextResponse.json({ error: "date parametresi gerekli" }, { status: 400 });
  }

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0=Pazar

  // Ustanın bu güne ait müsaitliğini al
  const avail = await prisma.barberAvailability.findUnique({
    where: { barberId_dayOfWeek: { barberId: id, dayOfWeek } },
  });

  if (!avail || !avail.isActive) {
    return NextResponse.json({ slots: [] });
  }

  // O güne ait mevcut randevuları al
  const dayStart = new Date(dateStr + "T00:00:00.000Z");
  const dayEnd   = new Date(dateStr + "T23:59:59.999Z");

  const existing = await prisma.appointment.findMany({
    where: {
      barberId: id,
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { date: true, duration: true },
  });

  // 60 dakikalık slotlar üret
  const slots: string[] = [];
  const [sh, sm] = avail.startTime.split(":").map(Number);
  const [eh, em] = avail.endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;

  for (let m = startMin; m + 60 <= endMin; m += 60) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    const slotTime = `${hh}:${mm}`;

    // Bu slota çakışan randevu var mı?
    const slotDate = new Date(`${dateStr}T${slotTime}:00.000Z`);
    const conflict = existing.some((a) => {
      const aStart = a.date.getTime();
      const aEnd   = aStart + a.duration * 60000;
      const sStart = slotDate.getTime();
      const sEnd   = sStart + 60 * 60000;
      return sStart < aEnd && sEnd > aStart;
    });

    if (!conflict) slots.push(slotTime);
  }

  return NextResponse.json({ slots, startTime: avail.startTime, endTime: avail.endTime });
}

// PUT /api/barbers/[id]/availability — usta kendi müsaitliğini günceller
export async function PUT(
  req: NextRequest,
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

  const body: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[] = await req.json();

  await Promise.all(
    body.map((item) =>
      prisma.barberAvailability.upsert({
        where: { barberId_dayOfWeek: { barberId: id, dayOfWeek: item.dayOfWeek } },
        update: { startTime: item.startTime, endTime: item.endTime, isActive: item.isActive },
        create: { barberId: id, ...item },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
