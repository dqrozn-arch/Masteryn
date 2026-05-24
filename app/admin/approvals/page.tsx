export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApprovalClient from "./ApprovalClient";

export default async function ApprovalsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const barbers = await prisma.barberProfile.findMany({
    where: { status: { in: ["PENDING", "APPROVED", "REJECTED"] } },
    orderBy: [{ status: "asc" }, { user: { createdAt: "desc" } }],
    include: { user: { select: { email: true, createdAt: true } } },
  });

  const pending  = barbers.filter((b) => b.status === "PENDING");
  const approved = barbers.filter((b) => b.status === "APPROVED");
  const rejected = barbers.filter((b) => b.status === "REJECTED");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Usta Onayları</h1>
        <p className="text-zinc-400 text-sm mt-1">
          <span className="text-amber-400 font-semibold">{pending.length}</span> bekliyor ·{" "}
          <span className="text-green-400 font-semibold">{approved.length}</span> onaylı ·{" "}
          <span className="text-red-400 font-semibold">{rejected.length}</span> reddedildi
        </p>
      </div>

      <ApprovalClient pending={pending} approved={approved} rejected={rejected} />
    </div>
  );
}
