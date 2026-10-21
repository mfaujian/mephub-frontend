"use client";

import { getApiBaseUrl } from "@/lib/config";
import { ApiError } from "@/lib/errors";
import { readJson, STORAGE_KEYS } from "@/lib/storage";
import type {
    Address,
    AddressInput,
    AuthSession,
    Brand,
    Category,
    CategoryListResponse,
    CategoryResponse,
    CreateOrderPayload,
    LoginResponse,
    Order,
    OrderListResponse,
    OrderStatus,
    PaymentStatus,
    Product,
    ProductListResponse,
    ProductResponse,
    Store,
} from "@/types";

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    query?: Record<string, QueryValue>;
    /** Attach the logged-in user's token (default true). Login and register pass false. */
    auth?: boolean;
}

let unauthorizedHandler: (() => void) | null = null;

/** AuthContext registers a function here that logs the user out when the API says the token is no longer valid. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
    unauthorizedHandler = handler;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, query, auth = true } = options;
    const url = new URL(`${getApiBaseUrl()}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }

    const token = auth ? readJson<AuthSession>(STORAGE_KEYS.auth)?.token : undefined;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
        response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
        });
    } catch {
        throw new ApiError("Could not reach the MEPhub server. Check your connection and try again.", 0);
    }

    let data: unknown = null;
    try {
        data = await response.json();
    } catch {
        // empty or non-JSON body
    }

    if (!response.ok) {
        const payload = (data ?? {}) as { error?: string; message?: string; details?: unknown; code?: string };
        if (response.status === 401 && token && unauthorizedHandler) unauthorizedHandler();
        throw new ApiError(payload.error ?? payload.message ?? `Request failed (${response.status})`, response.status, {
        details: payload.details,
        code: payload.code,
        });
    }
    return data as T;
    }

// ---------- Auth ----------
export const loginRequest = (email: string, password: string) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false });

export const registerRequest = (input: { email: string; full_name: string; password: string }) =>
    apiRequest<{ message: string }>("/users", { method: "POST", body: input, auth: false });

// ---------- Catalog ----------
export interface ProductListQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    brand?: string;
    sort?: string;
}

export const fetchProducts = (query: ProductListQuery = {}) =>
    apiRequest<ProductListResponse>("/products", {
        auth: false,
        query: {
        page: query.page,
        limit: query.limit,
        search: query.search?.trim(),
        category_id: query.categoryId,
        brand: query.brand,
        sort: query.sort,
        },
    });

export const lookupProducts = (params: { ids?: number[]; skus?: string[] }) =>
    apiRequest<{ data: Product[] }>("/products/lookup", {
        auth: false,
        query: { ids: params.ids?.join(","), skus: params.skus?.join(",") },
    }).then((res) => res.data);

export const fetchBrands = () =>
    apiRequest<{ brands: Brand[] }>("/products/brands", { auth: false }).then((res) => res.brands);

export const fetchCategories = () =>
    apiRequest<CategoryListResponse>("/categories", { auth: false }).then((res) => res.categories);

export const fetchStores = () =>
    apiRequest<{ stores: Store[] }>("/sellers", { auth: false }).then((res) => res.stores);

// ---------- Admin: products ----------
export type ProductWriteBody = Record<string, unknown>;

export const createProduct = (body: ProductWriteBody) =>
    apiRequest<ProductResponse>("/products", { method: "POST", body }).then((res) => res.product);

export const updateProduct = (id: number, body: ProductWriteBody) =>
    apiRequest<ProductResponse>(`/products/${id}`, { method: "PUT", body }).then((res) => res.product);

export const deleteProduct = (id: number) => apiRequest<{ message: string }>(`/products/${id}`, { method: "DELETE" });

// ---------- Admin: categories ----------
export const createCategory = (body: { name: string; description?: string; parent_id?: number }) =>
    apiRequest<CategoryResponse>("/categories", { method: "POST", body }).then((res) => res.category);

export const updateCategory = (id: number, body: { name?: string; description?: string }) =>
    apiRequest<CategoryResponse>(`/categories/${id}`, { method: "PUT", body }).then((res) => res.category);

export const deleteCategory = (id: number) => apiRequest<{ message: string }>(`/categories/${id}`, { method: "DELETE" });

export type { Category };

// ---------- Orders ----------
export const fetchMyOrders = (query: { page?: number; limit?: number; status?: string } = {}) =>
    apiRequest<OrderListResponse>("/orders", { query });

export const fetchAllOrders = (query: { page?: number; limit?: number; status?: string; search?: string } = {}) =>
    apiRequest<OrderListResponse>("/orders/all", { query });

export const fetchOrder = (id: string) =>
    apiRequest<{ order: Order }>(`/orders/${id}`).then((res) => res.order);

export const createOrder = (payload: CreateOrderPayload) =>
    apiRequest<{ message: string; orders_created: number; orders: Order[] }>("/orders", {
        method: "POST",
        body: payload,
    });

export const updateOrderStatus = (id: string, status: OrderStatus) =>
    apiRequest<{ order: Order }>(`/orders/${id}/status`, { method: "PUT", body: { status } }).then((res) => res.order);

export const updatePaymentStatus = (id: string, payment_status: PaymentStatus) =>
    apiRequest<{ order: Order }>(`/orders/${id}/payment`, { method: "PUT", body: { payment_status } }).then(
        (res) => res.order,
    );

// ---------- Addresses ----------
export const fetchAddresses = () =>
    apiRequest<{ addresses: Address[] }>("/addresses").then((res) => res.addresses);

export const createAddress = (input: AddressInput) =>
    apiRequest<{ address: Address }>("/addresses", { method: "POST", body: input }).then((res) => res.address);

export const updateAddress = (id: number, input: Partial<AddressInput>) =>
    apiRequest<{ address: Address }>(`/addresses/${id}`, { method: "PUT", body: input }).then((res) => res.address);

export const deleteAddress = (id: number) => apiRequest<{ message: string }>(`/addresses/${id}`, { method: "DELETE" });