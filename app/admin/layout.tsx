import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // Login sayfasında kontrol yapma
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {session && <AdminSidebar name={session.name} />}
      <main className={`flex-1 overflow-auto ${session ? "ml-0" : ""}`}>{children}</main>
    </div>
  );
}
