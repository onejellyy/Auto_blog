import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { slugify } from "./slug";

const POSTS_ROOT = path.join(process.cwd(), "content", "posts");

type Status = "draft" | "published";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  series?: string;
  status: Status;
}

export interface PostItem {
  meta: PostMeta;
  rawContent: string;
  filePath: string;
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const out: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkFiles(full));
      continue;
    }

    if (full.endsWith(".md") || full.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

function parsePost(filePath: string): PostItem {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  const fileSlug = path.basename(filePath).replace(/\.mdx?$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");

  const meta: PostMeta = {
    slug: fileSlug,
    title: String(parsed.data.title ?? fileSlug),
    description: String(parsed.data.description ?? ""),
    date: String(parsed.data.date ?? "1970-01-01"),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    series: parsed.data.series ? String(parsed.data.series) : undefined,
    status: parsed.data.status === "draft" ? "draft" : "published",
  };

  return {
    meta,
    rawContent: parsed.content,
    filePath,
  };
}

export function getAllPosts(options?: { includeDraft?: boolean }): PostMeta[] {
  const includeDraft = options?.includeDraft ?? false;

  return walkFiles(POSTS_ROOT)
    .map(parsePost)
    .filter((post) => (includeDraft ? true : post.meta.status === "published"))
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
    .map((post) => post.meta);
}

export function getAllPostSlugs(): string[] {
  return walkFiles(POSTS_ROOT)
    .map(parsePost)
    .map((p) => p.meta.slug);
}

export function getPostBySlug(slug: string): PostItem | null {
  for (const file of walkFiles(POSTS_ROOT)) {
    const post = parsePost(file);
    if (post.meta.slug === slug) return post;
  }
  return null;
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts({ includeDraft: false }).filter((post) => post.tags.includes(tag));
}

function extractToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const toc: TocItem[] = [];

  visit(tree, "heading", (node: any) => {
    if (node.depth !== 2 && node.depth !== 3) return;
    const text = toString(node).trim();
    if (!text) return;

    toc.push({
      id: slugify(text),
      text,
      depth: node.depth,
    });
  });

  return toc;
}

export async function renderPost(markdown: string) {
  const toc = extractToc(markdown);

  const compiled = await compileMDX({
    source: markdown,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: "github-dark",
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });

  return {
    content: compiled.content,
    toc,
  };
}
