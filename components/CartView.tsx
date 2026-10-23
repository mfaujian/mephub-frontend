"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import QuantityInput from "@/components/QuantityInput";
import { useCart } from "@/hooks/useCart";
import { lineTotal, unitPriceFor } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { primaryButton, secondaryButton } from "@/lib/ui";

export default function CartView() {
  const router = useRouter();
  const { items, isReady, subtotal, setQuantity, removeItem, clear, refresh } = useCart();
  const [notices, setNotices] = useState<string[]>([]);

  // On arrival, ask the server for current prices and stock and tell the buyer what changed.
  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    refresh()
      .then((result) => {
        if (cancelled) return;
        const messages = [
          ...result.removed.map((name) => `"${name}" is no longer available and was removed.`),
          ...result.changed.map((name) => `"${name}" changed (price or available stock). Please review it.`),
        ];
        setNotices(messages);
      })
      .catch(() => {
        // offline or server asleep: keep the saved snapshot, the server checks again at checkout
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  if (!isReady) {
    return <div aria-busy="true" className="h-40 animate-pulse rounded-lg bg-slate-200" />;
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center" >
        <div data-testid="empty-cart">
          <p className="text-lg font-semibold text-slate-800">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-600">Browse the catalog, or paste a list of part numbers into Quick order.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/products" className={primaryButton}>
              Browse products
            </Link>
            <Link href="/quick-order" className={secondaryButton}>
              Quick order
            </Link>
          </div>
          <button type="button" disabled data-testid="checkout-button" className={`${primaryButton} mt-6`}>
            Proceed to checkout
          </button>
        </div>
      </Card>
    );
  }

  const suppliers = new Set(items.map((item) => item.snapshot.seller_id)).size;

  return (
    <div className="space-y-4">
      {notices.length > 0 && (
        <div role="status" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ul className="list-inside list-disc">
            {notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </div>
      )}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm" data-testid="cart-table">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Unit price</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const { snapshot } = item;
              const unitPrice = unitPriceFor(snapshot, item.quantity);
              const discounted = unitPrice < snapshot.price;
              return (
                <tr key={item.productId} data-testid="cart-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {snapshot.image_url && (
                        <Image src={snapshot.image_url} alt="" width={48} height={48} unoptimized className="h-12 w-12 rounded object-cover" />
                      )}
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-medium text-slate-900 hover:underline">
                          {snapshot.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {snapshot.sku && <span className="font-mono">{snapshot.sku}</span>}
                          {snapshot.sku && snapshot.seller_name && " · "}
                          {snapshot.seller_name}
                        </p>
                        {snapshot.fulfillment_type === "indent" && (
                          <p className="text-xs text-indigo-700">Made to order · {snapshot.lead_time_days} days</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRupiah(unitPrice)}
                    <span className="text-xs text-slate-500"> / {snapshot.unit}</span>
                    {discounted && <p className="text-xs font-medium text-green-700">Volume price applied</p>}
                  </td>
                  <td className="px-4 py-3">
                    <QuantityInput
                      value={item.quantity}
                      onChange={(quantity) => setQuantity(item.productId, quantity)}
                      min={snapshot.min_order_qty}
                      max={snapshot.fulfillment_type === "stock" ? Math.max(snapshot.stock, snapshot.min_order_qty) : 100000}
                      label={`Quantity for ${snapshot.name}`}
                    />
                    {snapshot.min_order_qty > 1 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Min. {snapshot.min_order_qty} {snapshot.unit}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums" data-testid="line-total">
                    {formatRupiah(lineTotal(item))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      data-testid="remove-item"
                      aria-label={`Remove ${snapshot.name} from cart`}
                      onClick={() => {
                        removeItem(item.productId);
                        toast.success(`${snapshot.name} removed from cart`);
                      }}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => {
            clear();
            toast.success("Cart cleared");
          }}
          className={secondaryButton}
        >
          Clear cart
        </button>
        <Card className="w-full space-y-3 p-4 sm:max-w-sm">
          <div className="flex justify-between text-sm text-slate-600">
            <span>
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
            <span>
              {suppliers} {suppliers === 1 ? "supplier" : "suppliers"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-slate-700">Subtotal</span>
            <span className="text-xl font-bold text-brand" data-testid="cart-subtotal">
              {formatRupiah(subtotal)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Prices are confirmed again at checkout. Orders are split per supplier. Shipping is arranged by each supplier.
          </p>
          <button type="button" data-testid="checkout-button" onClick={() => router.push("/checkout")} className={`${primaryButton} w-full`}>
            Proceed to checkout
          </button>
        </Card>
      </div>
    </div>
  );
}