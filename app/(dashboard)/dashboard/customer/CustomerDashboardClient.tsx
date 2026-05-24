"use client";

import { useState } from "react";
import PostCard from "@/components/posts/PostCard";
import CreatePostModal from "@/components/posts/CreatePostModal";
import ReviewBarberModal from "@/components/reviews/ReviewBarberModal";

interface ReviewFromBarber {
  id: string; appointmentLoyalty: number; processCooperation: number;
  communicationRespect: number; feedbackHonesty: number;
  comment?: string | null; createdAt: string;
  barber: { id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null };
}

interface Post {
  id: string; caption?: string | null; createdAt: string;
  images: { id: string; url: string; order: number }[];
  customer: { id: string; name: string; surname: string; avatar?: string | null };
  barber: { id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null };
}

interface Props {
  profile: { id: string; name: string; surname: string };
  posts: Post[];
  reviews: ReviewFromBarber[];
}

export default function CustomerDashboardClient({ profile, posts: initialPosts, reviews }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [reviewBarber, setReviewBarber] = useState<Post["barber"] | null>(null);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  async function refreshPosts() {
    const res = await fetch(`/api/posts?customerId=${profile.id}`);
    if (res.ok) setPosts(await res.json());
  }

  return (
    <>
      {/* Yeni Paylaşım */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full glass border border-white/8 hover:border-white/15 text-white font-semibold py-4 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 mb-8 group"
      >
        <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/15 flex items-center justify-center text-sm transition-colors">+</span>
        Yeni Paylaşım Ekle
      </button>

      {/* Paylaşımlar */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Paylaşımlarım</h2>
          <span className="text-zinc-600 text-sm">{posts.length} paylaşım</span>
        </div>
        {posts.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📷</p>
            <p className="text-zinc-400 text-sm font-medium">Henüz paylaşım yok</p>
            <p className="text-zinc-600 text-xs mt-1">Gittiğin ustayı etiketleyerek ilk paylaşımını yap!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((p) => (
              <div key={p.id} className="relative group/card">
                <PostCard post={p} showCustomer={false} showBarber />
                <button
                  onClick={() => setReviewBarber(p.barber)}
                  className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm hover:bg-amber-400 hover:text-zinc-900 text-white text-xs px-2.5 py-1 rounded-xl opacity-0 group-hover/card:opacity-100 transition-all font-medium"
                >
                  ★ Değerlendir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Usta Yorumları */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Bana Yapılan Yorumlar</h2>
          <span className="text-zinc-600 text-sm">{reviews.length} yorum</span>
        </div>
        {reviews.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-zinc-600 text-sm">Henüz bir usta seni değerlendirmedi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-4 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {r.barber.name[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{r.barber.salonName ?? `${r.barber.name} ${r.barber.surname}`}</p>
                      <p className="text-zinc-600 text-xs">{new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${((r.appointmentLoyalty+r.processCooperation+r.communicationRespect+r.feedbackHonesty)/4) >= 4 ? "text-green-400" : "text-amber-400"}`}>
                    {((r.appointmentLoyalty+r.processCooperation+r.communicationRespect+r.feedbackHonesty)/4).toFixed(1)}/5
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {([["Randevu",r.appointmentLoyalty],["İş Birliği",r.processCooperation],["Nezaket",r.communicationRespect],["Dürüstlük",r.feedbackHonesty]] as [string,number][]).map(([l,v]) => (
                    <div key={l} className="flex justify-between text-xs bg-white/3 rounded-lg px-2 py-1">
                      <span className="text-zinc-600">{l}</span>
                      <span className="text-amber-400">{"★".repeat(v)}<span className="text-zinc-800">{"★".repeat(5-v)}</span></span>
                    </div>
                  ))}
                </div>
                {r.comment && <p className="text-zinc-500 text-xs mt-2 leading-relaxed">"{r.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && <CreatePostModal onClose={() => setShowModal(false)} onSuccess={refreshPosts} />}
      {reviewBarber && <ReviewBarberModal barber={reviewBarber} onClose={() => setReviewBarber(null)} onSuccess={() => setReviewBarber(null)} />}
    </>
  );
}
