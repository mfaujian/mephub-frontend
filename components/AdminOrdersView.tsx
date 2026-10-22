"use client";

import { useCallback, useState } from "react";
import ErrorState from "@/components/ErrorState";
import OrdersTable from "@/components/OrdersTable";
import PagerButtons from "@/components/PagerButtons";
import SearchBar from "@/components/SearchBar";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchAllOrders } from "@/lib/api-client";
import { inputClass } from "@/lib/ui";

const STATUSES = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

/** Read-only overview of every order from every buyer. Open an order to see its details. */
export default function AdminOrdersView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const loader = useCallback(
    () => fetchAllOrders({ page, limit: 10, status, search: debouncedSearch }),
    [page, status, debouncedSearch],
  );
  const { data, error, loading, reload } = useAsyncData(loader);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-64 flex-1 sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by buyer name, email or PO number..."
          />
        </div>
        <div>
          <label htmlFor="admin-order-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="admin-order-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={`${inputClass} sm:w-52`}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value ? value[0].toUpperCase() + value.slice(1) : "All statuses"}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && !data ? (
        <ErrorState title="Could not load orders" message={error} onRetry={reload} />
      ) : !data ? (
        <div aria-busy="true" className="h-64 animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <p className="mb-2 text-sm text-slate-600" data-testid="order-count">
            {data.meta.total_items} {data.meta.total_items === 1 ? "order" : "orders"}
          </p>
          {data.orders.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">No orders match your filters.</p>
          ) : (
            <OrdersTable orders={data.orders} showBuyer />
          )}
          <PagerButtons meta={data.meta} onPage={setPage} />
        </div>
      )}
    </div>
  );
}