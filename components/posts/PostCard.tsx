"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface PostImage { id: string; url: string; order: number; }
interface ProfileSnap { id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null; }

interface Props {
  post: {
    id: string; caption?: string | null; createdAt: string | Date;
    images: PostImage[];
    customer: ProfileSnap;
    barber: ProfileSnap & { salonName?: string | null };
  };
  showCustomer?: boolean;
  showBarber?: boolean;
}

export default function PostCard({ post, showCustomer = true, showBarber = true }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = post.images;
  const date = new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <div className="group glass rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
      {images.length > 0 && (
        <div className="relative aspect-square bg-zinc-900">
          <Image src={images[imgIdx].url} alt={post.caption ?? "Paylaşım"} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {images.length > 1 && (
            <>
              <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs backdrop-blur-sm transition-all">‹</button>
              <button onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs backdrop-blur-sm transition-all">›</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === imgIdx ? "bg-white w-2.5" : "bg-white/40"}`} />)}
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center gap-1 text-xs text-zinc-500 flex-wrap">
          {showCustomer && (
            <Link href={`/profile/customer/${post.customer.id}`} className="font-medium text-zinc-300 hover:text-white transition-colors">
              {post.customer.name} {post.customer.surname}
            </Link>
          )}
          {showCustomer && showBarber && <span className="text-zinc-700">→</span>}
          {showBarber && (
            <Link href={`/profile/barber/${post.barber.id}`} className="font-medium text-zinc-300 hover:text-white transition-colors">
              {post.barber.salonName ?? `${post.barber.name} ${post.barber.surname}`}
            </Link>
          )}
          <span className="ml-auto text-zinc-700">{date}</span>
        </div>
        {post.caption && <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{post.caption}</p>}
      </div>
    </div>
  );
}
