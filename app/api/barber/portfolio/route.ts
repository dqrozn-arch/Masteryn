export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const barber = await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!barber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const formData = await req.formData();
  const files = formData.getAll("images") as File[];
  if (files.length === 0) return NextResponse.json({ error: "Fotoğraf seçilmedi" }, { status: 400 });

  // Admin adına yükleme için sistem müşterisi
  const systemCustomer = await prisma.customerProfile.findFirst({ orderBy: { id: "asc" } });
  if (!systemCustomer) return NextResponse.json({ error: "Sistem hatası" }, { status: 500 });

  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const imageUrls: string[] = [];
  for (const file of files.slice(0, 5)) {
    const bytes = await file.arrayBuffer();
    const ext   = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fname = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(join(uploadsDir, fname), Buffer.from(bytes));
    imageUrls.push(`/uploads/${fname}`);
  }

  const post = await prisma.post.create({
    data: {
      barberId:   barber.id,
      customerId: systemCustomer.id,
      caption:    (formData.get("caption") as string) || null,
      images:     { create: imageUrls.map((url, i) => ({ url, order: i })) },
    },
  });

  return NextResponse.json({ success: true, post });
}
