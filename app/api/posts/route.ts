export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const formData = await req.formData();
  const barberId = formData.get("barberId") as string;
  const caption  = formData.get("caption") as string;
  const files    = formData.getAll("images") as File[];

  const CRITERIA = ["visualFidelity","technicalSkill","processTransparency","expectationMgmt","compensationScore"] as const;
  const scores = Object.fromEntries(CRITERIA.map((k) => [k, parseInt(formData.get(k) as string) || 0])) as Record<typeof CRITERIA[number], number>;
  const hasRating = CRITERIA.every((k) => scores[k] >= 1 && scores[k] <= 5);

  if (!barberId) return NextResponse.json({ error: "Usta seçilmedi" }, { status: 400 });
  if (files.length === 0) return NextResponse.json({ error: "En az bir fotoğraf ekle" }, { status: 400 });

  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return NextResponse.json({ error: "Usta bulunamadı" }, { status: 404 });

  // Fotoğrafları kaydet
  const imageUrls: string[] = [];
  for (const file of files.slice(0, 5)) {
    const bytes = await file.arrayBuffer();
    const ext   = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fname = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(join(process.cwd(), "public", "uploads", fname), Buffer.from(bytes));
    imageUrls.push(`/uploads/${fname}`);
  }

  const post = await prisma.$transaction(async (tx) => {
    const newPost = await tx.post.create({
      data: {
        customerId: customer.id,
        barberId:   barber.id,
        caption:    caption || null,
        images: { create: imageUrls.map((url, i) => ({ url, order: i })) },
      },
      include: { images: true, barber: true, customer: true },
    });

    // Eğer puan verilmişse ve daha önce değerlendirme yapılmamışsa review oluştur
    if (hasRating) {
      const existing = await tx.customerToBarberReview.findUnique({
        where: { customerId_barberId: { customerId: customer.id, barberId } },
      });

      if (!existing) {
        await tx.customerToBarberReview.create({
          data: { customerId: customer.id, barberId, comment: caption || null, ...scores },
        });

        const allReviews = await tx.customerToBarberReview.findMany({ where: { barberId } });
        const count = allReviews.length;
        const avgF = (f: keyof typeof scores) => allReviews.reduce((s: number, r) => s + (r[f] as number), 0) / count;
        const avgs = {
          avgVisualFidelity: avgF("visualFidelity"), avgTechnical: avgF("technicalSkill"),
          avgTransparency: avgF("processTransparency"), avgExpectation: avgF("expectationMgmt"),
          avgCompensation: avgF("compensationScore"),
        };
        await tx.barberProfile.update({
          where: { id: barberId },
          data: { ...avgs, overallScore: (Object.values(avgs).reduce((s: number, v: number)=>s+v,0)/5)*2, reviewCount: count },
        });
      }
    }

    return newPost;
  });

  return NextResponse.json({ success: true, post });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const barberId   = searchParams.get("barberId");

  const posts = await prisma.post.findMany({
    where: customerId ? { customerId } : barberId ? { barberId } : {},
    orderBy: { createdAt: "desc" },
    include: {
      images:   { orderBy: { order: "asc" } },
      customer: true,
      barber:   true,
    },
  });

  return NextResponse.json(posts);
}
