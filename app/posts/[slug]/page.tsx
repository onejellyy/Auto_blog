import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Toc } from "@/components/toc";
import { getAllPostSlugs, getPostBySlug, renderPost } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: "article",
      publishedTime: post.meta.date,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.meta.status !== "published") {
    notFound();
  }

  const rendered = await renderPost(post.rawContent);

  return (
    <main className="grid gap-8 lg:grid-cols-[1fr_260px]">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>{post.meta.title}</h1>
        <p className="text-sm text-muted">{post.meta.date}</p>
        {rendered.content}
      </article>
      <div className="lg:sticky lg:top-8 lg:h-fit">
        <Toc items={rendered.toc} />
      </div>
    </main>
  );
}
