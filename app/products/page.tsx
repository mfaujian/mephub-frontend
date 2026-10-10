import type { Metadata } from "next";
import { Suspense } from "react";
import Pagination from "@/components/Pagination";
import ProductGrid from "@/components/ProductGrid";
import ProductsToolbar from "@/components/ProductsToolbar";
import { getCatalogCategories, getCategories, getProducts } from "@/lib/api";
import { findCategoryName, toCategoryOptions } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Products",
};

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | undefined): number | undefined {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

const PAGE_SIZE = 9;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = firstValue(params.q)?.trim() ?? "";
  const categoryId = toPositiveInt(firstValue(params.category));
  const page = toPositiveInt(firstValue(params.page)) ?? 1;

  // Independent requests run at the same time instead of one after another.
  const [result, catalogCategories, allCategories] = await Promise.all([
    getProducts({ page, limit: PAGE_SIZE, search, categoryId }),
    getCatalogCategories(),
    getCategories(),
  ]);

  const activeCategoryName = categoryId ? findCategoryName(allCategories, categoryId) : undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-brand">Products</h1>
        <p className="mt-1 text-sm text-slate-600" aria-live="polite">
          {result.meta.total_items} {result.meta.total_items === 1 ? "product" : "products"}
          {search && <> matching &quot;{search}&quot;</>}
          {activeCategoryName && <> in {activeCategoryName}</>}
        </p>
      </div>

      <ProductGrid
        products={result.data}
        categories={toCategoryOptions(allCategories)}
        searchText={search}
        toolbar={
          <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-slate-200" />}>
            <ProductsToolbar categories={catalogCategories} />
          </Suspense>
        }
        pagination={
          <Pagination
            meta={result.meta}
            basePath="/products"
            params={{ q: search || undefined, category: categoryId ? String(categoryId) : undefined }}
          />
        }
      />
    </div>
  );
}
