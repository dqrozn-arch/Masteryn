"use client";

import { useState } from "react";
import BarberCareerTab from "./BarberCareerTab";
import BarberFeedTab from "./BarberFeedTab";

interface Workplace {
  id: string; salonName: string; city?: string | null; role?: string | null;
  startYear: number; endYear?: number | null; isCurrent: boolean;
  isVerified: boolean; verifierName?: string | null;
}
interface Certificate {
  id: string; name: string; issuer?: string | null; year?: number | null; description?: string | null;
}
interface Post {
  id: string; caption?: string | null; createdAt: string;
  images: { url: string }[];
  customer: { name: string; surname: string };
}
interface Profile {
  id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null;
  bio?: string | null; phone?: string | null;
  specialties: string[];
  overallScore: number; reviewCount: number;
  postCount: number; favCount: number; hasVerifiedWork: boolean; memberYears: number;
  city: string;
}

interface Props {
  profile: Profile;
  workplaces: Workplace[];
  certificates: Certificate[];
  recentPosts: Post[];
  children: React.ReactNode;
}

const TABS = [
  { key: "feed",   label: "Akış",       icon: "🏠" },
  { key: "perf",   label: "Performans", icon: "📊" },
  { key: "career", label: "Kariyer",    icon: "📋" },
] as const;

type Tab = typeof TABS[number]["key"];

export default function BarberTabsWrapper({ profile, workplaces, certificates, recentPosts, children }: Props) {
  const [tab, setTab] = useState<Tab>("feed");

  return (
    <>
      {/* Sekme navigasyonu */}
      <div className="flex rounded-2xl p-1 gap-1" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
        {TABS.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}>
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* İçerik */}
      {tab === "feed" && (
        <BarberFeedTab profile={{ ...profile, city: profile.city ?? "" }} recentPosts={recentPosts} />
      )}
      {tab === "perf" && <>{children}</>}
      {tab === "career" && (
        <BarberCareerTab profile={profile} workplaces={workplaces} certificates={certificates} />
      )}
    </>
  );
}
