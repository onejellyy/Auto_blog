import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <p className="mb-2 text-sm text-muted">{post.date}</p>
      <h2 className="mb-2 text-xl font-semibold">
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="mb-3 text-sm text-muted">{post.description}</p>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link key={tag} className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-100" href={`/tags/${encodeURIComponent(tag)}`}>
            #{tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
