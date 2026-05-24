import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/posts/PostCard";
import ReviewBarberModal from "@/components/reviews/ReviewBarberModal";
import MyPostsClient from "./MyPostsClient";

export default async function MyPostsPage() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { order: "asc" } }, customer: true, barber: true },
      },
    },
  });
  if (!profile) redirect("/login");

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Paylaşımlarım</h1>
        <span className="text-zinc-600 text-sm">{profile.posts.length} paylaşım</span>
      </div>

      <MyPostsClient
        profileId={profile.id}
        posts={profile.posts as never}
      />
    </div>
  );
}
