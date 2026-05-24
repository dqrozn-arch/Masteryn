import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const isCustomer = session.userType === "CUSTOMER";
  const profile = isCustomer
    ? await prisma.customerProfile.findUnique({ where: { userId: session.id } })
    : await prisma.barberProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return NextResponse.json([]);

  const convs = await prisma.conversation.findMany({
    where: isCustomer ? { customerId: profile.id } : { barberId: profile.id },
    include: {
      customer: { select: { id: true, name: true, surname: true, avatar: true } },
      barber:   { select: { id: true, name: true, surname: true, salonName: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(convs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { barberId, initialMessage } = await req.json();
  if (!barberId) return NextResponse.json({ error: "Usta seçilmedi" }, { status: 400 });

  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  // Mevcut konuşma varsa getir, yoksa oluştur
  let conv = await prisma.conversation.findUnique({
    where: { customerId_barberId: { customerId: customer.id, barberId } },
  });

  if (!conv) {
    conv = await prisma.conversation.create({
      data: { customerId: customer.id, barberId },
    });
  }

  // İlk mesajı gönder
  if (initialMessage?.trim()) {
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderType: "CUSTOMER",
        type: "TEXT",
        text: initialMessage.trim(),
      },
    });
    await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });
  }

  return NextResponse.json({ success: true, conversationId: conv.id });
}
