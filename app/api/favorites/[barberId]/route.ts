export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ barberId: string }> }) {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { barberId } = await params;
  const customer = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!customer) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const existing = await prisma.customerFavorite.findUnique({
    where: { customerId_barberId: { customerId: customer.id, barberId } },
  });

  if (existing) {
    await prisma.customerFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.customerFavorite.create({ data: { customerId: customer.id, barberId } });
    return NextResponse.json({ favorited: true });
  }
}
