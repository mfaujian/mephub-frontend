"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import SearchBar from "@/components/SearchBar";
import type { CategoryWithCount } from "@/types";

interface ProductsToolbarProps {
  categories: CategoryWithCount[];
}

export default function ProductsToolbar({ categories }: ProductsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const lastPushed = useRef(urlQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function pushParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const trimmed = value.trim();
      lastPushed.current = trimmed;
      pushParams({ q: trimmed || undefined });
    }, 400);
  }

  const hasFilters = Boolean(urlQuery || urlCategory);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={query} onChange={handleSearchChange} />
        <div>
          <label htmlFor="category-filter" className="sr-only">
            Filter by category
          </label>
          <select
            id="category-filter"
            value={urlCategory}
            onChange={(event) => pushParams({ category: event.target.value || undefined })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:w-72"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <optgroup key={category.id} label={category.name}>
                <option value={category.id}>
                  All {category.name} ({category.productCount})
                </option>
                {category.subcategories.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="flex min-h-5 items-center gap-3 text-xs text-slate-500">
        {isPending && <span>Updating results...</span>}
        {hasFilters && !isPending && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              lastPushed.current = "";
              router.push(pathname, { scroll: false });
            }}
            className="font-medium text-brand hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
