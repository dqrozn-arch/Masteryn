import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/barbers/[id]/campaigns — Aktif kampanyaları herkese aç
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const campaigns = await prisma.barberCampaign.findMany({
    where: {
      barberId: id,
      isActive: true,
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

// POST /api/barbers/[id]/campaigns — Usta kampanya oluşturur
export async function POST(
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

  const { title, body, service, discount, validUntil, imageUrl } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Başlık zorunlu" }, { status: 400 });
  }

  const campaign = await prisma.barberCampaign.create({
    data: {
      barberId: id,
      title: title.trim(),
      body: body?.trim() || null,
      service: service?.trim() || null,
      discount: discount ? Number(discount) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
