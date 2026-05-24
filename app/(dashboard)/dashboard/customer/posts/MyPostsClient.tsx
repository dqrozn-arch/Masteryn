"use client";

import { useState } from "react";
import PostCard from "@/components/posts/PostCard";
import ReviewBarberModal from "@/components/reviews/ReviewBarberModal";

interface Post {
  id: string; caption?: string | null; createdAt: string;
  images: { id: string; url: string; order: number }[];
  customer: { id: string; name: string; surname: string; avatar?: string | null };
  barber:   { id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null };
}

export default function MyPostsClient({ profileId, posts: initial }: { profileId: string; posts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initial);
  const [reviewBarber, setReview] = useState<Post["barber"] | null>(null);

  async function refresh() {
    const res = await fetch(`/api/posts?customerId=${profileId}`);
    if (res.ok) setPosts(await res.json());
  }

  if (posts.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <p className="text-4xl mb-4">📷</p>
        <p className="text-zinc-400 font-medium">Henüz paylaşım yok</p>
        <p className="text-zinc-600 text-sm mt-1">Sol menüden "Yeni Paylaşım" ile başlayabilirsin.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {posts.map((p) => (
          <div key={p.id} className="relative group/card">
            <PostCard post={p} showCustomer={false} showBarber />
            <button
              onClick={() => setReview(p.barber)}
              className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm hover:bg-amber-400 hover:text-zinc-900 text-white text-xs px-2.5 py-1 rounded-xl opacity-0 group-hover/card:opacity-100 transition-all font-medium"
            >
              ★ Değerlendir
            </button>
          </div>
        ))}
      </div>
      {reviewBarber && (
        <ReviewBarberModal
          barber={reviewBarber}
          onClose={() => setReview(null)}
          onSuccess={() => { setReview(null); refresh(); }}
        />
      )}
    </>
  );
}
