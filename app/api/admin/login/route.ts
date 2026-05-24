export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ error: "Kullanıcı adı ve şifre zorunludur" }, { status: 400 });

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await verifyPassword(password, admin.password)))
    return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8); // 8 saat

  await prisma.adminSession.create({ data: { adminId: admin.id, token, expiresAt } });

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return response;
}
