"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin",                 label: "Dashboard",      icon: "◼" },
  { href: "/admin/approvals",       label: "Onaylar",        icon: "✓" },
  { href: "/admin/verifications",   label: "Doğrulamalar",   icon: "✦" },
  { href: "/admin/barbers",         label: "Ustalar",        icon: "✂" },
  { href: "/admin/customers",       label: "Müşteriler",     icon: "◯" },
  { href: "/admin/posts",           label: "Paylaşımlar",    icon: "▣" },
];

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-52 bg-[#0d0d0d] border-r border-white/5 flex flex-col min-h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-zinc-900 text-xs font-black">M</span>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">masteryn</span>
        </div>
        <span className="text-zinc-700 text-xs ml-9">Admin Panel</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active ? "bg-white/8 text-white font-medium" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/4"
              }`}
            >
              <span className={`text-xs w-4 text-center ${active ? "text-white" : "text-zinc-600"}`}>{item.icon}</span>
              {item.label}
              {active && <span className="ml-auto w-1 h-1 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <div className="px-3 py-2.5 mb-1">
          <p className="text-zinc-300 text-sm font-medium">{name}</p>
          <p className="text-zinc-700 text-xs">Superadmin</p>
        </div>
        <button onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-white/4 text-sm transition-all">
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
