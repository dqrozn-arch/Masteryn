export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VerifyClient from "./VerifyClient";
import Logo from "@/components/shared/Logo";

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const wp = await prisma.barberWorkplace.findUnique({
    where: { verificationToken: token },
    include: { barber: true },
  });

  if (!wp) notFound();

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8"><Logo size="lg" href="/" /></div>

      <VerifyClient
        token={token}
        workplace={{
          id: wp.id, salonName: wp.salonName, city: wp.city ?? "",
          role: wp.role ?? "", startYear: wp.startYear,
          endYear: wp.endYear, isCurrent: wp.isCurrent,
          isVerified: wp.isVerified, employerName: wp.employerName ?? "",
        }}
        barber={{
          name: wp.barber.name, surname: wp.barber.surname,
          salonName: wp.barber.salonName ?? "", avatar: wp.barber.avatar ?? "",
        }}
      />
    </div>
  );
}
