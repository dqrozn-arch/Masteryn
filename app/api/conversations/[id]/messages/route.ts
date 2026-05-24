import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const conv = await prisma.conversation.findUnique({ where: { id } });
  if (!conv) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { customer: { select: { userId: true } }, barber: { select: { userId: true } } },
  });
  if (!conv) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  // Konuşma bu kullanıcıya ait mi?
  const isCustomer = session.userType === "CUSTOMER" && conv.customer.userId === session.id;
  const isBarber   = session.userType === "BARBER"   && conv.barber.userId === session.id;
  if (!isCustomer && !isBarber) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const senderType = isCustomer ? "CUSTOMER" : "BARBER";
  const formData   = await req.formData();
  const type       = formData.get("type") as string ?? "TEXT";
  const text       = formData.get("text") as string ?? "";
  const imageFile  = formData.get("image") as File | null;

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes  = await imageFile.arrayBuffer();
    const ext    = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const fname  = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(join(process.cwd(), "public", "uploads", fname), Buffer.from(bytes));
    imageUrl = `/uploads/${fname}`;
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderType,
      type: type as "TEXT" | "IMAGE" | "AGREEMENT",
      text: text || null,
      imageUrl: imageUrl || null,
      ...(type === "AGREEMENT" ? {
        agreementService:  formData.get("service") as string,
        agreementPrice:    parseInt(formData.get("price") as string) || 0,
        agreementDuration: parseInt(formData.get("duration") as string) || 0,
        agreementStatus:   "PENDING" as const,
      } : {}),
    },
  });
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ success: true, message });
}
