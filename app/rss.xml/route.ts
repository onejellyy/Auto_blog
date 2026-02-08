import { getAllPosts } from "@/lib/posts";

export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const posts = getAllPosts({ includeDraft: false });

  const items = posts
    .map(
      (post) => `\n  <item>\n    <title><![CDATA[${post.title}]]></title>\n    <link>${siteUrl}/posts/${post.slug}</link>\n    <guid>${siteUrl}/posts/${post.slug}</guid>\n    <pubDate>${new Date(post.date).toUTCString()}</pubDate>\n    <description><![CDATA[${post.description}]]></description>\n  </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n  <title>Engineering Notes</title>\n  <link>${siteUrl}</link>\n  <description>실무 중심 개발 블로그</description>${items}\n</channel>\n</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
