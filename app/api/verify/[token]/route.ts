export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const wp = await prisma.barberWorkplace.findUnique({
    where: { verificationToken: token },
    include: { barber: true },
  });
  if (!wp) return NextResponse.json({ error: "Geçersiz veya süresi dolmuş link" }, { status: 404 });
  return NextResponse.json({
    workplace: {
      id: wp.id, salonName: wp.salonName, city: wp.city,
      role: wp.role, startYear: wp.startYear, endYear: wp.endYear, isCurrent: wp.isCurrent,
      isVerified: wp.isVerified, employerEmail: wp.employerEmail, employerName: wp.employerName,
    },
    barber: {
      name: wp.barber.name, surname: wp.barber.surname,
      salonName: wp.barber.salonName, avatar: wp.barber.avatar,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { action, verifierName } = await req.json();

  if (!["approve", "reject"].includes(action))
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });

  const wp = await prisma.barberWorkplace.findUnique({ where: { verificationToken: token } });
  if (!wp) return NextResponse.json({ error: "Geçersiz link" }, { status: 404 });
  if (wp.isVerified) return NextResponse.json({ error: "Zaten onaylanmış" }, { status: 409 });

  if (action === "approve") {
    await prisma.barberWorkplace.update({
      where: { id: wp.id },
      data: { isVerified: true, verifiedAt: new Date(), verifierName: verifierName || wp.employerName || "İşveren" },
    });
  } else {
    // Reddetme durumunda token'ı temizle
    await prisma.barberWorkplace.update({
      where: { id: wp.id },
      data: { verificationToken: null, employerEmail: null },
    });
  }

  return NextResponse.json({ success: true, action });
}
