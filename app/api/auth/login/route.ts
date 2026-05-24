export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password)
      return NextResponse.json({ error: "Kullanıcı adı/e-posta ve şifre zorunludur" }, { status: 400 });

    // E-posta mı kullanıcı adı mı?
    const isEmail = emailOrUsername.includes("@");

    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: emailOrUsername },
        include: { barberProfile: { select: { status: true } } },
      });
    } else {
      // Kullanıcı adıyla usta ara
      const barber = await prisma.barberProfile.findUnique({
        where: { username: emailOrUsername },
        include: {
          user: {
            include: { barberProfile: { select: { status: true } } },
          },
        },
      });
      user = barber?.user ?? null;
    }

    if (!user || !(await verifyPassword(password, user.password)))
      return NextResponse.json({ error: "Kullanıcı adı/e-posta veya şifre hatalı" }, { status: 401 });

    // Usta onay kontrolü
    if (user.userType === "BARBER") {
      const status = user.barberProfile?.status;
      if (status === "PENDING")
        return NextResponse.json({ error: "Hesabınız henüz admin tarafından onaylanmadı.", pending: true }, { status: 403 });
      if (status === "REJECTED")
        return NextResponse.json({ error: "Hesabınız reddedildi. Bizimle iletişime geçin.", rejected: true }, { status: 403 });
    }

    const token     = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

    const response = NextResponse.json({ success: true, userType: user.userType });
    response.cookies.set("session_token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", expires: expiresAt, path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
