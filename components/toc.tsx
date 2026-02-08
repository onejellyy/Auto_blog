import Link from "next/link";
import type { TocItem } from "@/lib/posts";

export function Toc({ items }: { items: TocItem[] }) {
  if (!items.length) return null;

  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted">목차</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
            <Link href={`#${item.id}`}>{item.text}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
