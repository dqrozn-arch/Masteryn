export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { customerId, appointmentLoyalty, processCooperation, communicationRespect, feedbackHonesty, comment } = await req.json();

  if (!customerId) return NextResponse.json({ error: "Müşteri seçilmedi" }, { status: 400 });

  const scores = [appointmentLoyalty, processCooperation, communicationRespect, feedbackHonesty];
  if (scores.some((v) => !v || v < 1 || v > 5))
    return NextResponse.json({ error: "Tüm kriterler 1-5 arasında olmalı" }, { status: 400 });

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const existing = await prisma.barberToCustomerReview.findUnique({
    where: { barberId_customerId: { barberId: barber.id, customerId } },
  });
  if (existing) return NextResponse.json({ error: "Bu müşteriyi zaten değerlendirdiniz" }, { status: 409 });

  await prisma.barberToCustomerReview.create({
    data: {
      barberId: barber.id, customerId,
      appointmentLoyalty, processCooperation, communicationRespect, feedbackHonesty,
      comment: comment || null,
    },
  });

  return NextResponse.json({ success: true });
}
