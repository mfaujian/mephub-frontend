"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorState from "@/components/ErrorState";
import StatusBadge, { PaymentBadge } from "@/components/StatusBadge";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { fetchOrder, lookupProducts, updateOrderStatus, updatePaymentStatus } from "@/lib/api-client";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatRupiah, labelize, shortId } from "@/lib/format";
import { primaryButton, secondaryButton } from "@/lib/ui";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function paymentActions(order: Order): PaymentStatus[] {
  if (order.payment_method === "request_terms") {
    return (["terms_approved", "paid"] as PaymentStatus[]).filter((status) => status !== order.payment_status);
  }
  return (["paid", "unpaid"] as PaymentStatus[]).filter((status) => status !== order.payment_status);
}

export default function OrderDetailView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { addItem } = useCart();
  const orderId = params.id;
  const loader = useCallback(() => fetchOrder(orderId), [orderId]);
  const { data: order, error, reload } = useAsyncData(loader);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  if (error && !order) {
    return <ErrorState title="Could not load this order" message={error} onRetry={reload} />;
  }
  if (!order) return <div aria-busy="true" className="h-64 animate-pulse rounded-lg bg-slate-200" />;

  const isBuyer = user?.id === order.user_id;
  const canCancelAsBuyer = isBuyer && !isAdmin && order.status === "pending";

  async function changeStatus(status: OrderStatus) {
    setBusy(true);
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function changePayment(status: PaymentStatus) {
    setBusy(true);
    try {
      await updatePaymentStatus(orderId, status);
      toast.success(`Payment marked as ${labelize(status)}`);
      reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function reorder(current: Order) {
    setBusy(true);
    try {
      const products = await lookupProducts({ ids: current.order_items.map((item) => item.product_id) });
      let added = 0;
      for (const item of current.order_items) {
        const product = products.find((candidate) => candidate.id === item.product_id);
        if (product) {
          addItem(product, item.quantity);
          added += 1;
        }
      }
      if (added === 0) {
        toast.error("None of these products are available any more.");
        return;
      }
      toast.success(`${added} ${added === 1 ? "item" : "items"} added to your cart`);
      if (added < current.order_items.length) {
        toast(`${current.order_items.length - added} item(s) are no longer available and were skipped.`);
      }
      router.push("/cart");
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="order-print space-y-4">
      {/* Only visible on paper */}
      <div className="hidden items-center justify-between border-b-2 border-black pb-3 print:flex">
        <p className="text-lg font-bold">MEPhub Industrial</p>
        <p className="text-sm font-semibold uppercase tracking-wide">Order confirmation / delivery note</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={isAdmin ? "/dashboard/orders" : "/orders"} className="text-sm font-medium text-brand hover:underline">
          &larr; Back to orders
        </Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className={secondaryButton}>
            Print
          </button>
          {isBuyer && (
            <button type="button" disabled={busy} onClick={() => reorder(order)} data-testid="reorder" className={primaryButton}>
              Order again
            </button>
          )}
          {canCancelAsBuyer && (
            <button
              type="button"
              data-testid="cancel-order"
              onClick={() => setConfirmCancel(true)}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Cancel order
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-brand" data-testid="order-title">
          Order #{shortId(order.id)}
        </h1>
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.payment_status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        <Card className="space-y-2 p-4 text-sm">
          <h2 className="font-semibold text-slate-800">Order details</h2>
          <p>
            <span className="text-slate-500">Placed:</span> {formatDate(order.created_at)}
          </p>
          <p>
            <span className="text-slate-500">Supplier:</span> {order.seller?.store_name ?? "-"}
          </p>
          {order.buyer && (
            <p>
              <span className="text-slate-500">Buyer:</span> {order.buyer.full_name} ({order.buyer.email})
            </p>
          )}
          <p>
            <span className="text-slate-500">PO number:</span> {order.po_number ?? "-"}
          </p>
          <p>
            <span className="text-slate-500">Requested delivery:</span> {formatDate(order.requested_delivery_date)}
          </p>
          <p>
            <span className="text-slate-500">Payment:</span> {order.payment_method === "request_terms" ? "Payment terms (invoice)" : "Bank transfer"}
          </p>
          {order.notes && (
            <p>
              <span className="text-slate-500">Notes:</span> {order.notes}
            </p>
          )}
        </Card>
        <Card className="space-y-2 p-4 text-sm">
          <h2 className="font-semibold text-slate-800">Deliver to</h2>
          <p className="whitespace-pre-line text-slate-700" data-testid="shipping-address">
            {order.shipping_address}
          </p>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 text-right font-medium">Qty</th>
              <th className="px-4 py-3 text-right font-medium">Unit price</th>
              <th className="px-4 py-3 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.order_items.map((item) => (
              <tr key={item.product_id} data-testid="order-item">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{item.product_name}</p>
                  {item.sku && <p className="font-mono text-xs text-slate-500">{item.sku}</p>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(item.unit_price)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={3} className="px-4 py-3 text-right font-medium">
                Total
              </td>
              <td className="px-4 py-3 text-right text-lg font-bold text-brand" data-testid="order-total">
                {formatRupiah(order.total_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {isAdmin && (
        <Card className="space-y-3 border-amber-300 bg-amber-50 p-4 print:hidden" data-testid="admin-actions">
          <h2 className="font-semibold text-slate-800">Admin actions</h2>
          <div className="flex flex-wrap gap-2">
            {NEXT_STATUSES[order.status].map((status) => (
              <button key={status} type="button" disabled={busy} onClick={() => changeStatus(status)} className={secondaryButton}>
                Mark {status}
              </button>
            ))}
            {paymentActions(order).map((status) => (
              <button key={status} type="button" disabled={busy} onClick={() => changePayment(status)} className={secondaryButton}>
                Payment: {labelize(status)}
              </button>
            ))}
            {NEXT_STATUSES[order.status].length === 0 && <p className="text-sm text-slate-600">This order is closed: no further status changes.</p>}
          </div>
        </Card>
      )}

      {confirmCancel && (
        <ConfirmDialog
          title="Cancel this order?"
          message="The supplier will be told and the reserved stock is released. This cannot be undone."
          confirmLabel="Yes, cancel order"
          onCancel={() => setConfirmCancel(false)}
          onConfirm={async () => {
            await updateOrderStatus(orderId, "cancelled");
            setConfirmCancel(false);
            toast.success("Order cancelled");
            reload();
          }}
        />
      )}
    </div>
  );
}