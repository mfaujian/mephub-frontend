import "server-only";

import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { getApiBaseUrl } from "@/lib/config";
import { ApiError } from "@/lib/errors";
import type {
  Brand,
  Category,
  CategoryListResponse,
  CategoryWithCount,
  Product,
  ProductListResponse,
  ProductResponse,
} from "@/types";

/**
 * Server-side API access for the PUBLIC catalog (products, categories, brands).
 * Pages that need the logged-in user's token (cart, orders, dashboard) are client components and use lib/api-client.ts.
 */
type QueryParams = Record<string, string | number | boolean | undefined>;

async function apiFetch<T>(path: string, query: QueryParams = {}): Promise<T> {
  // Development only: slow every API call down so loading.tsx is easy to screenshot
  const delay = Number(process.env.API_DEMO_DELAY_MS ?? 0);
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const url = new URL(`${getApiBaseUrl()}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && value !== false) {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch (error) {
    // Next.js uses thrown signals for control flow; they must not be swallowed
    unstable_rethrow(error);
    throw new ApiError("Could not reach the MEPhub API", 0);
  }

  if (!response.ok) {
    throw new ApiError(`API request failed (${response.status})`, response.status);
  }
  return (await response.json()) as T;
}

// ---------- Products ----------
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brand?: string;
  sort?: string;
  inStock?: boolean;
}

export function getProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>("/products", {
    page: query.page,
    limit: query.limit,
    search: query.search?.trim() || undefined,
    category_id: query.categoryId,
    brand: query.brand,
    sort: query.sort,
    in_stock: query.inStock,
  });
}

export const getProduct = cache(async (id: number): Promise<Product | null> => {
  try {
    const data = await apiFetch<ProductResponse>(`/products/${id}`);
    return data.product;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  const data = await apiFetch<{ brands: Brand[] }>("/products/brands");
  return data.brands;
});

// ---------- Categories ----------
export const getCategories = cache(async (): Promise<Category[]> => {
  const data = await apiFetch<CategoryListResponse>("/categories");
  return data.categories;
});

/** Top-level categories with their product counts; empty ones are left out. */
export async function getCatalogCategories(): Promise<CategoryWithCount[]> {
  const categories = await getCategories();
  const counts = await Promise.all(
    categories.map(async (category) => {
      const result = await getProducts({ categoryId: category.id, limit: 1 });
      return result.meta.total_items;
    }),
  );
  return categories
    .map((category, index) => ({ ...category, productCount: counts[index] }))
    .filter((category) => category.productCount > 0);
}