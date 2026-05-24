"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const emailOrUsername = (formData.get("emailOrUsername") as string)?.trim();
  const password = formData.get("password") as string;

  if (!emailOrUsername || !password)
    return { error: "E-posta/kullanıcı adı ve şifre zorunludur" };

  const isEmail = emailOrUsername.includes("@");

  let user;
  if (isEmail) {
    user = await prisma.user.findUnique({
      where: { email: emailOrUsername },
      include: { barberProfile: { select: { status: true } } },
    });
  } else {
    const barber = await prisma.barberProfile.findUnique({
      where: { username: emailOrUsername },
      include: { user: { include: { barberProfile: { select: { status: true } } } } },
    });
    user = barber?.user ?? null;
  }

  if (!user || !(await verifyPassword(password, user.password)))
    return { error: "Kullanıcı adı/e-posta veya şifre hatalı" };

  if (user.userType === "BARBER") {
    const status = user.barberProfile?.status;
    if (status === "PENDING")
      return { error: "Hesabınız henüz admin tarafından onaylanmadı." };
    if (status === "REJECTED")
      return { error: "Hesabınız reddedildi. Bizimle iletişime geçin." };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  redirect(user.userType === "BARBER" ? "/dashboard/barber" : "/dashboard/customer");
}
