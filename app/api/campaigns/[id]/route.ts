export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH /api/campaigns/[id] — güncelle veya kapat
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.userType !== "BARBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const campaign = await prisma.barberCampaign.findUnique({
    where: { id },
    include: { barber: { select: { userId: true } } },
  });

  if (!campaign || campaign.barber.userId !== session.id) {
    return NextResponse.json({ error: "Bulunamadı veya yetkisiz" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.barberCampaign.update({
    where: { id },
    data: {
      ...(body.title     !== undefined ? { title: body.title }         : {}),
      ...(body.body      !== undefined ? { body: body.body }           : {}),
      ...(body.service   !== undefined ? { service: body.service }     : {}),
      ...(body.discount  !== undefined ? { discount: body.discount }   : {}),
      ...(body.validUntil !== undefined ? { validUntil: body.validUntil ? new Date(body.validUntil) : null } : {}),
      ...(body.isActive  !== undefined ? { isActive: body.isActive }   : {}),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/campaigns/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.userType !== "BARBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const campaign = await prisma.barberCampaign.findUnique({
    where: { id },
    include: { barber: { select: { userId: true } } },
  });

  if (!campaign || campaign.barber.userId !== session.id) {
    return NextResponse.json({ error: "Bulunamadı veya yetkisiz" }, { status: 404 });
  }

  await prisma.barberCampaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
