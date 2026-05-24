import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerNav from "./CustomerNav";

export default async function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.id },
    select: { id: true, name: true, surname: true, avatar: true },
  });
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Sidebar — masaüstü */}
      <aside className="hidden md:flex w-56 flex-col fixed top-0 left-0 h-screen border-r border-white/5 bg-[#0a0a0a] z-30">
        <CustomerNav profile={profile} />
      </aside>

      {/* İçerik */}
      <div className="flex-1 md:ml-56 pb-20 md:pb-0">
        {children}
      </div>

      {/* Alt nav — mobil */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#0a0a0a] border-t border-white/5 z-30">
        <CustomerNav profile={profile} mobile />
      </div>
    </div>
  );
}
