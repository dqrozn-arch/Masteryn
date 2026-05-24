export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { username } = await req.json();

  if (!username)
    return NextResponse.json({ error: "Kullanıcı adı zorunlu" }, { status: 400 });

  // Sadece harf, rakam, alt çizgi, nokta — 3-30 karakter
  if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username))
    return NextResponse.json({ error: "3-30 karakter, sadece harf/rakam/nokta/alt çizgi" }, { status: 400 });

  const existing = await prisma.barberProfile.findUnique({ where: { username } });
  if (existing && existing.userId !== session.id)
    return NextResponse.json({ error: "Bu kullanıcı adı zaten alınmış" }, { status: 409 });

  await prisma.barberProfile.update({ where: { userId: session.id }, data: { username } });
  return NextResponse.json({ success: true, username });
}
