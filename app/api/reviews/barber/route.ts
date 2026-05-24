export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

const CRITERIA = ["visualFidelity", "technicalSkill", "processTransparency", "expectationMgmt", "compensationScore"] as const;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const formData = await req.formData();
  const barberId           = formData.get("barberId") as string;
  const comment            = formData.get("comment") as string;
  const files              = formData.getAll("images") as File[];

  const scores = Object.fromEntries(
    CRITERIA.map((k) => [k, parseInt(formData.get(k) as string) || 0])
  ) as Record<(typeof CRITERIA)[number], number>;

  if (!barberId) return NextResponse.json({ error: "Usta seçilmedi" }, { status: 400 });
  if (CRITERIA.some((k) => scores[k] < 1 || scores[k] > 5))
    return NextResponse.json({ error: "Tüm kriterler 1-5 arasında olmalı" }, { status: 400 });

  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const existing = await prisma.customerToBarberReview.findUnique({
    where: { customerId_barberId: { customerId: customer.id, barberId } },
  });
  if (existing) return NextResponse.json({ error: "Bu ustayı zaten değerlendirdiniz" }, { status: 409 });

  // Görseller
  const imageUrls: string[] = [];
  for (const file of files.slice(0, 5)) {
    const bytes = await file.arrayBuffer();
    const ext   = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fname = `rv-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(join(process.cwd(), "public", "uploads", fname), Buffer.from(bytes));
    imageUrls.push(`/uploads/${fname}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.customerToBarberReview.create({
      data: {
        customerId: customer.id, barberId, comment: comment || null,
        ...scores,
        images: { create: imageUrls.map((url, i) => ({ url, order: i })) },
      },
    });

    // Ortalama güncelle
    const all = await tx.customerToBarberReview.findMany({ where: { barberId } });
    const count = all.length;
    const avg = (f: (typeof CRITERIA)[number]) =>
      all.reduce((s: number, r) => s + (r[f] as number), 0) / count;

    const avgs = {
      avgVisualFidelity: avg("visualFidelity"),
      avgTechnical:      avg("technicalSkill"),
      avgTransparency:   avg("processTransparency"),
      avgExpectation:    avg("expectationMgmt"),
      avgCompensation:   avg("compensationScore"),
    };
    const overall = (Object.values(avgs).reduce((s: number, v: number) => s + v, 0) / 5) * 2; // 0-10 skala

    await tx.barberProfile.update({
      where: { id: barberId },
      data: { ...avgs, overallScore: overall, reviewCount: count },
    });
  });

  return NextResponse.json({ success: true });
}
