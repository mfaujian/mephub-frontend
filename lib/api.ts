import "server-only";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { clearDemoToken, getDemoToken } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/config";
import { ApiError } from "@/lib/errors";
import type {
  Category,
  CategoryListResponse,
  CategoryWithCount,
  OrderListResponse,
  Product,
  ProductListResponse,
  ProductResponse,
} from "@/types";

type QueryParams = Record<string, string | number | undefined>;

interface ApiFetchOptions {
  query?: QueryParams;
  token?: string;
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const delay = Number(process.env.API_DEMO_DELAY_MS ?? 0);
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const url = new URL(`${getApiBaseUrl()}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    throw new ApiError("Could not reach the RevoShop API", 0);
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
}

export function getProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>("/products", {
    query: {
      page: query.page,
      limit: query.limit,
      name: query.search?.trim() || undefined,
      category_id: query.categoryId,
    },
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

// ---------- Categories ----------
export const getCategories = cache(async (): Promise<Category[]> => {
  const data = await apiFetch<CategoryListResponse>("/categories");
  return data.categories;
});

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

// ---------- Orders (needs a token) ----------
export async function getMyOrders(
  query: { page?: number; limit?: number } = {},
): Promise<OrderListResponse> {
  const request = async () =>
    apiFetch<OrderListResponse>("/orders", {
      token: await getDemoToken(),
      query: { page: query.page, limit: query.limit },
    });

  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearDemoToken();
      return request();
    }
    throw error;
  }
}
