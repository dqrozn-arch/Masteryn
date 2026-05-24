export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const { employerEmail, employerName } = await req.json();

  if (!employerEmail) return NextResponse.json({ error: "İşveren e-postası zorunlu" }, { status: 400 });

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const wp = await prisma.barberWorkplace.findUnique({ where: { id } });
  if (!wp || wp.barberId !== barber.id)
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  // Benzersiz doğrulama tokeni oluştur
  const token = `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 48);

  await prisma.barberWorkplace.update({
    where: { id },
    data: { employerEmail, employerName: employerName || null, verificationToken: token },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${token}`;
  return NextResponse.json({ success: true, verifyUrl, token });
}
