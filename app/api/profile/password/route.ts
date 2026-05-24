export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });

  if (newPassword.length < 6)
    return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalı" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid)
    return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: session.id }, data: { password: hashed } });

  // Diğer oturumları kapat (güvenlik)
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = cookieHeader.match(/session_token=([^;]+)/)?.[1];
  await prisma.session.deleteMany({
    where: { userId: session.id, NOT: { token: token ?? "" } },
  });

  return NextResponse.json({ success: true });
}
