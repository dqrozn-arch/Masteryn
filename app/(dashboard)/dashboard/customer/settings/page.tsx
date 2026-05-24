import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerPasswordClient from "./CustomerPasswordClient";

export default async function CustomerSettingsPage() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">Ayarlar</h1>
      <CustomerPasswordClient />
    </div>
  );
}
