import { PostCard } from "@/components/post-card";
import { getPostsByTag } from "@/lib/posts";

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const posts = getPostsByTag(tag);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-bold">#{tag}</h1>
      {posts.length === 0 ? <p className="text-muted">이 태그의 글이 없습니다.</p> : null}
      <div className="grid gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
