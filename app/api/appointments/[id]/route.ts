export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH /api/appointments/[id] — durumu güncelle (usta veya müşteri)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      barber:   { select: { userId: true } },
      customer: { select: { userId: true } },
    },
  });

  if (!appointment) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const isBarber   = appointment.barber.userId   === session.id;
  const isCustomer = appointment.customer.userId === session.id;

  if (!isBarber && !isCustomer) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { status, cancelNote } = await req.json();

  // İzin kuralları
  const allowed: Record<string, string[]> = {
    BARBER:   ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"],
    CUSTOMER: ["CANCELLED"],
  };

  const role = isBarber ? "BARBER" : "CUSTOMER";
  if (!allowed[role].includes(status)) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status, ...(cancelNote ? { cancelNote } : {}) },
    include: {
      barber:   { select: { name: true, surname: true, salonName: true } },
      customer: { select: { name: true, surname: true } },
    },
  });

  return NextResponse.json(updated);
}

// GET /api/appointments/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      barber:   { select: { id: true, name: true, surname: true, salonName: true, avatar: true, userId: true } },
      customer: { select: { id: true, name: true, surname: true, avatar: true, userId: true } },
    },
  });

  if (!appointment) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const hasAccess =
    appointment.barber.userId === session.id ||
    appointment.customer.userId === session.id;

  if (!hasAccess) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  return NextResponse.json(appointment);
}
