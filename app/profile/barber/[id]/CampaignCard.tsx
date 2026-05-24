"use client";

interface Campaign {
  id: string;
  title: string;
  body?: string | null;
  service?: string | null;
  discount?: number | null;
  imageUrl?: string | null;
  validUntil?: string | null;
  createdAt: string;
}

function timeLeft(validUntil: string): string {
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return "Süresi doldu";
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} gün kaldı`;
  if (h > 0) return `${h} saat kaldı`;
  return "Bugün son gün!";
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const urgent = campaign.validUntil
    ? new Date(campaign.validUntil).getTime() - Date.now() < 24 * 3600000
    : false;

  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1a1200 0%, #1a1000 50%, #0f0a00 100%)",
        border: "1px solid rgba(201,169,110,0.25)",
        boxShadow: "0 4px 24px rgba(201,169,110,0.06)",
      }}>

      {/* Arka plan süsleme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5"
          style={{ background: "var(--gold)" }} />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full opacity-5"
          style={{ background: "var(--gold)" }} />
      </div>

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* İndirim rozeti */}
          {campaign.discount && (
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
              style={{ background: "var(--gold)", boxShadow: "0 4px 12px rgba(201,169,110,0.3)" }}>
              <span className="text-xl font-black text-zinc-900 leading-none">%{campaign.discount}</span>
              <span className="text-[9px] font-bold text-zinc-900/70 mt-0.5">İNDİRİM</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(201,169,110,0.15)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.2)" }}>
                ⚡ KAMPANYA
              </span>
              {urgent && campaign.validUntil && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  🔥 {timeLeft(campaign.validUntil)}
                </span>
              )}
            </div>

            <h4 className="text-white font-bold text-sm leading-snug">{campaign.title}</h4>

            {campaign.body && (
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{campaign.body}</p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {campaign.service && (
                <span className="text-xs text-zinc-500">
                  🎯 <span className="text-zinc-400">{campaign.service}</span>
                </span>
              )}
              {campaign.validUntil && !urgent && (
                <span className="text-xs text-zinc-600">
                  📅 {timeLeft(campaign.validUntil)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
