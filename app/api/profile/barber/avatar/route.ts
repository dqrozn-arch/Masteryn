export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar") as File;
  if (!file || !file.type.startsWith("image/"))
    return NextResponse.json({ error: "Geçerli bir görsel yükle" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const ext   = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fname = `avatar-${session.id}.${ext}`;
  await writeFile(join(process.cwd(), "public", "uploads", "avatars", fname), Buffer.from(bytes));
  const url = `/uploads/avatars/${fname}`;

  await prisma.barberProfile.update({ where: { userId: session.id }, data: { avatar: url } });
  return NextResponse.json({ success: true, url });
}
