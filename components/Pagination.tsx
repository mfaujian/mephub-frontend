import Link from "next/link";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  basePath: string;
  params: Record<string, string | undefined>;
}

export default function Pagination({ meta, basePath, params }: PaginationProps) {
  if (meta.total_pages <= 1) return null;

  const hrefForPage = (page: number): string => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    if (page > 1) search.set("page", String(page));
    const queryString = search.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const linkClass =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50";
  const disabledClass =
    "rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-300 cursor-not-allowed";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between pt-2">
      {meta.has_prev ? (
        <Link href={hrefForPage(meta.current_page - 1)} className={linkClass}>
          &larr; Previous
        </Link>
      ) : (
        <span className={disabledClass}>&larr; Previous</span>
      )}
      <p className="text-sm text-slate-600">
        Page {meta.current_page} of {meta.total_pages}
      </p>
      {meta.has_next ? (
        <Link href={hrefForPage(meta.current_page + 1)} className={linkClass}>
          Next &rarr;
        </Link>
      ) : (
        <span className={disabledClass}>Next &rarr;</span>
      )}
    </nav>
  );
}
