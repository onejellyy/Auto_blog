import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts({ includeDraft: false });

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-bold">최신 글</h1>
      {posts.length === 0 ? <p className="text-muted">게시글이 아직 없습니다.</p> : null}
      <div className="grid gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
