import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const { messageId, action } = await req.json();

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { customer: { select: { userId: true } } },
  });
  if (!conv || conv.customer.userId !== session.id)
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const status = action === "approve" ? "APPROVED" : "REJECTED";
  await prisma.message.update({
    where: { id: messageId },
    data: { agreementStatus: status },
  });

  // Sistem mesajı ekle
  const statusText = status === "APPROVED"
    ? "✓ Müşteri bu teklifi onayladı. Masteryn Güvencesi kapsamında kayıt altına alındı."
    : "✕ Müşteri bu teklifi reddetti.";

  await prisma.message.create({
    data: { conversationId: id, senderType: "SYSTEM", type: "SYSTEM", text: statusText },
  });
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ success: true, status });
}
