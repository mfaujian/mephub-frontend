"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import SearchBar from "@/components/SearchBar";
import { inputClass } from "@/lib/ui";
import type { Brand, CategoryWithCount } from "@/types";

interface ProductsToolbarProps {
  categories: CategoryWithCount[];
  brands: Brand[];
}

const SORT_OPTIONS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

export default function ProductsToolbar({ categories, brands }: ProductsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlBrand = searchParams.get("brand") ?? "";
  const urlSort = searchParams.get("sort") ?? "";
  const urlInStock = searchParams.get("in_stock") === "1";

  // The input keeps its own text while the user types; the URL only changes after a short pause.
  const [query, setQuery] = useState(urlQuery);
  const lastPushed = useRef(urlQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Back/forward buttons or "Clear filters" change the URL from outside: copy it into the input.
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
    params.delete("page"); // a new filter always starts on page 1
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

  const hasFilters = Boolean(urlQuery || urlCategory || urlBrand || urlSort || urlInStock);

  return (
    <div className="space-y-2">
      <SearchBar value={query} onChange={handleSearchChange} placeholder="Search by product name, part number (SKU) or brand..." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="category-filter" className="sr-only">
            Filter by category
          </label>
          <select
            id="category-filter"
            value={urlCategory}
            onChange={(event) => pushParams({ category: event.target.value || undefined })}
            className={inputClass}
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
        <div>
          <label htmlFor="brand-filter" className="sr-only">
            Filter by brand
          </label>
          <select
            id="brand-filter"
            value={urlBrand}
            onChange={(event) => pushParams({ brand: event.target.value || undefined })}
            className={inputClass}
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.name} value={brand.name}>
                {brand.name} ({brand.count})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort-by" className="sr-only">
            Sort products
          </label>
          <select
            id="sort-by"
            value={urlSort}
            onChange={(event) => pushParams({ sort: event.target.value || undefined })}
            className={inputClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={urlInStock}
            onChange={(event) => pushParams({ in_stock: event.target.checked ? "1" : undefined })}
          />
          Orderable now (in stock or made to order)
        </label>
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