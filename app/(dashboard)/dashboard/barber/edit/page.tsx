export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BarberEditClient from "./BarberEditClient";
import Link from "next/link";

export default async function BarberEditPage() {
  const session = await getSession();
  if (!session || session.userType !== "BARBER") redirect("/login");

  const profile = await prisma.barberProfile.findUnique({
    where: { userId: session.id },
    include: {
      workplaces:    { orderBy: [{ isCurrent: "desc" }, { startYear: "desc" }] },
      certificates:  { orderBy: { createdAt: "desc" } },
    },
  });
  const user = await prisma.user.findUnique({
    where: { id: session.id }, select: { email: true },
  });
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/barber" className="w-8 h-8 rounded-full glass flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-sm">←</Link>
          <div>
            <h1 className="text-xl font-bold text-white">Profili Düzenle</h1>
            <p className="text-zinc-600 text-xs">Bilgilerini güncelle</p>
          </div>
        </div>

        <BarberEditClient profile={{
          id: profile.id, name: profile.name, surname: profile.surname,
          salonName: profile.salonName, city: profile.city, district: profile.district,
          address: profile.address, phone: profile.phone, bio: profile.bio,
          avatar: profile.avatar, specialties: profile.specialties,
          workplaces: profile.workplaces,
          certificates: profile.certificates,
          username: profile.username,
          email: user?.email ?? "",
        }} />
      </div>
    </div>
  );
}
