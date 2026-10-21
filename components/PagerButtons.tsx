"use client";

import type { PaginationMeta } from "@/types";
import { secondaryButton } from "@/lib/ui";

/** Previous / Next buttons for lists that keep their page number in React state (the dashboard tables). */
export default function PagerButtons({ meta, onPage }: { meta: PaginationMeta; onPage: (page: number) => void }) {
  if (meta.total_pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between pt-3">
      <button type="button" className={secondaryButton} disabled={!meta.has_prev} onClick={() => onPage(meta.current_page - 1)}>
        &larr; Previous
      </button>
      <p className="text-sm text-slate-600">
        Page {meta.current_page} of {meta.total_pages}
      </p>
      <button type="button" className={secondaryButton} disabled={!meta.has_next} onClick={() => onPage(meta.current_page + 1)}>
        Next &rarr;
      </button>
    </nav>
  );
}