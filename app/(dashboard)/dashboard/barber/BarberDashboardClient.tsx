"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReviewCustomerModal from "@/components/reviews/ReviewCustomerModal";

interface Review {
  id: string; visualFidelity: number; technicalSkill: number;
  processTransparency: number; expectationMgmt: number; compensationScore: number;
  comment?: string | null; createdAt: string | Date;
  customer: { id: string; name: string; surname: string };
}

interface Props { profileId: string; receivedReviews: Review[]; reviewCount: number; }

export default function BarberDashboardClient({ receivedReviews, reviewCount }: Props) {
  const router = useRouter();
  const [showReviewModal, setShowReviewModal] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {/* Son değerlendirmeler */}
      {receivedReviews.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1e1e1e" }}>
            <p className="text-white font-semibold text-sm">Son Değerlendirmeler</p>
            <div className="flex items-center gap-3">
              <span className="text-zinc-600 text-xs">{reviewCount} toplam</span>
              <button onClick={() => setShowReviewModal(true)}
                className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
                style={{ background: "#161616", border: "1px solid #252525" }}>
                + Müşteri Değerlendir
              </button>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
            {receivedReviews.slice(0, 4).map((r) => {
              const avg = ((r.visualFidelity + r.technicalSkill + r.processTransparency + r.expectationMgmt + r.compensationScore) / 5 * 2).toFixed(1);
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "#1e1e1e", border: "1px solid #252525" }}>
                    {r.customer.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{r.customer.name} {r.customer.surname}</p>
                    <p className="text-zinc-600 text-xs">{new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: parseFloat(avg) >= 8 ? "var(--gold)" : "var(--copper)" }}>
                    {avg}/10
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Çıkış */}
      <button onClick={handleLogout}
        className="w-full py-3 rounded-2xl text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
        style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
        Çıkış Yap
      </button>

      {showReviewModal && (
        <ReviewCustomerModal onClose={() => setShowReviewModal(false)} onSuccess={() => setShowReviewModal(false)} />
      )}
    </>
  );
}
