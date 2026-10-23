"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import ErrorState from "@/components/ErrorState";
import OrdersTable from "@/components/OrdersTable";
import PagerButtons from "@/components/PagerButtons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchMyOrders } from "@/lib/api-client";
import { inputClass, primaryButton } from "@/lib/ui";

const STATUSES = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function MyOrdersView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const loader = useCallback(() => fetchMyOrders({ page, limit: 10, status }), [page, status]);
  const { data, error, loading, reload } = useAsyncData(loader);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label htmlFor="order-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="order-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={`${inputClass} sm:w-56`}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value ? value[0].toUpperCase() + value.slice(1) : "All statuses"}
              </option>
            ))}
          </select>
        </div>
        {data && (
          <p className="text-sm text-slate-600" data-testid="order-count">
            {data.meta.total_items} {data.meta.total_items === 1 ? "order" : "orders"}
          </p>
        )}
      </div>

      {error && !data ? (
        <ErrorState title="Could not load your orders" message={error} onRetry={reload} />
      ) : !data ? (
        <div aria-busy="true" className="h-48 animate-pulse rounded-lg bg-slate-200" />
      ) : data.orders.length === 0 ? (
        <div data-testid="no-orders" className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
          <p className="font-semibold text-slate-800">No orders yet</p>
          <p className="mt-1 text-sm text-slate-600">When you place an order it will show up here.</p>
          <Link href="/products" className={`${primaryButton} mt-4 inline-block`}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <OrdersTable orders={data.orders} />
          <PagerButtons meta={data.meta} onPage={setPage} />
        </div>
      )}
    </div>
  );
}