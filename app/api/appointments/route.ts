import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/appointments — randevu oluştur (müşteri)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const { barberId, service, date, duration = 60, price, note } = await req.json();

  if (!barberId || !service || !date) {
    return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  }

  // Çakışma kontrolü
  const appointmentDate = new Date(date);
  const endDate = new Date(appointmentDate.getTime() + duration * 60000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      barberId,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { lt: endDate },
      AND: [{ date: { gte: new Date(appointmentDate.getTime() - duration * 60000) } }],
    },
  });

  if (conflict) {
    return NextResponse.json({ error: "Bu saat dolu, lütfen başka bir saat seçin" }, { status: 409 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      barberId,
      customerId: customer.id,
      service,
      date: appointmentDate,
      duration,
      price,
      note,
    },
    include: {
      barber: { select: { name: true, surname: true, salonName: true } },
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}

// GET /api/appointments — oturumdaki kullanıcının randevuları
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    if (session.userType === "CUSTOMER") {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
      if (!customer) return NextResponse.json({ appointments: [] });

      const appointments = await prisma.appointment.findMany({
        where: {
          customerId: customer.id,
          ...(status ? { status: status as never } : {}),
        },
        include: {
          barber: { select: { id: true, name: true, surname: true, salonName: true, avatar: true, city: true } },
        },
        orderBy: { date: "asc" },
      });
      return NextResponse.json({ appointments });
    }

    if (session.userType === "BARBER") {
      const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
      if (!barber) return NextResponse.json({ appointments: [] });

      const appointments = await prisma.appointment.findMany({
        where: {
          barberId: barber.id,
          ...(status ? { status: status as never } : {}),
        },
        include: {
          customer: { select: { id: true, name: true, surname: true, avatar: true, phone: true } },
        },
        orderBy: { date: "asc" },
      });
      return NextResponse.json({ appointments });
    }

    return NextResponse.json({ error: "Geçersiz kullanıcı tipi" }, { status: 400 });
  } catch (err) {
    console.error("[GET /api/appointments]", err);
    return NextResponse.json({ error: "Sunucu hatası", detail: String(err) }, { status: 500 });
  }
}
