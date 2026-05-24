"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface PostImage { id: string; url: string; order: number; }
interface Person { id: string; name: string; surname: string; avatar?: string | null; }
interface Barber extends Person { salonName?: string | null; }

interface Post {
  id: string;
  caption?: string | null;
  createdAt: string;
  images: PostImage[];
  customer: Person;
  barber: Barber;
  _count: { likes: number };
}

interface Props {
  initialPosts: Post[];
  nextCursor: string | null;
  userType: "CUSTOMER" | "BARBER";
  profile: { id: string; name: string; avatar?: string | null };
}

function PostItem({ post }: { post: Post }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = post.images;
  const date = new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  const barberName = post.barber.salonName ?? `${post.barber.name} ${post.barber.surname}`;

  return (
    <article className="glass rounded-2xl overflow-hidden">
      {/* Üst bilgi */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/barber/${post.barber.id}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-white/8 group-hover:border-white/20 transition-colors">
            {post.barber.avatar ? (
              <Image src={post.barber.avatar} alt="" width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white text-sm font-bold">
                {post.barber.name[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate group-hover:text-amber-300 transition-colors">{barberName}</p>
            <p className="text-zinc-600 text-xs truncate">
              {post.customer.name} {post.customer.surname} · {date}
            </p>
          </div>
        </Link>
        {post._count.likes > 0 && (
          <span className="text-zinc-600 text-xs flex-shrink-0">♥ {post._count.likes}</span>
        )}
      </div>

      {/* Görsel */}
      {images.length > 0 && (
        <div className="relative aspect-square bg-zinc-900">
          <Image
            src={images[imgIdx].url}
            alt={post.caption ?? "Paylaşım"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 600px"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center backdrop-blur-sm transition-all text-base"
              >‹</button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center backdrop-blur-sm transition-all text-base"
              >›</button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`rounded-full transition-all ${i === imgIdx ? "bg-white w-4 h-1.5" : "bg-white/40 w-1.5 h-1.5"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Alt bilgi */}
      {post.caption && (
        <div className="px-4 py-3">
          <p className="text-zinc-400 text-sm leading-relaxed">{post.caption}</p>
        </div>
      )}
    </article>
  );
}

export default function FeedPageClient({ initialPosts, nextCursor: initialCursor, userType, profile }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  const dashboardHref = userType === "CUSTOMER" ? "/dashboard/customer" : "/dashboard/barber";

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?cursor=${cursor}`);
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={dashboardHref} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>

          <h1 className="text-white font-bold text-sm tracking-wide">Akış</h1>

          <Link href={userType === "CUSTOMER" ? `/profile/customer/${profile.id}` : `/profile/barber/${profile.id}`}
            className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
              {profile.avatar ? (
                <Image src={profile.avatar} alt="" width={28} height={28} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-white text-xs font-bold">
                  {profile.name[0]}
                </div>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* İçerik */}
      <main className="max-w-xl mx-auto px-4 py-5 space-y-4">
        {posts.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center mt-12">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-zinc-400 font-medium">Henüz paylaşım yok</p>
            <p className="text-zinc-600 text-sm mt-1">Onaylı ustalar paylaşım yaptıkça burada görünür.</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}

            {cursor ? (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full glass border border-white/8 hover:border-white/15 text-zinc-400 hover:text-white py-4 rounded-2xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Yükleniyor...
                  </span>
                ) : "Daha Fazla Gör"}
              </button>
            ) : (
              <p className="text-center text-zinc-700 text-xs pb-8">Tüm paylaşımlar gösterildi</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
