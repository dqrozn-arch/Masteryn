export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "BARBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { name, surname, salonName, city, district, address, phone, bio } = await req.json();
  if (!name || !surname || !city)
    return NextResponse.json({ error: "Ad, soyad ve şehir zorunlu" }, { status: 400 });

  const profile = await prisma.barberProfile.update({
    where: { userId: session.id },
    data: { name, surname, salonName: salonName || null, city, district: district || null, address: address || null, phone: phone || null, bio: bio || null },
  });
  return NextResponse.json({ success: true, profile });
}
