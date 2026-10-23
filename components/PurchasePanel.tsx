"use client";

import { useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import PriceTierTable from "@/components/PriceTierTable";
import QuantityInput from "@/components/QuantityInput";
import { clampQuantity, isOrderable, toSnapshot, unitPriceFor } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/types";

/** The buy box on the product page: quantity, live price (volume tiers) and the add-to-cart button. */
export default function PurchasePanel({ product }: { product: Product }) {
  const snapshot = toSnapshot(product);
  const orderable = isOrderable(snapshot);
  const [quantity, setQuantity] = useState(clampQuantity(snapshot, product.min_order_qty));
  const unitPrice = unitPriceFor(snapshot, quantity);
  const max = product.fulfillment_type === "stock" ? Math.max(product.stock, product.min_order_qty) : 100000;

  return (
    <div className="space-y-4">
      <PriceTierTable basePrice={product.price} unit={product.unit} tiers={product.price_tiers} activeQuantity={quantity} />
      {orderable ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-4">
            <QuantityInput value={quantity} onChange={setQuantity} min={product.min_order_qty} max={max} label={`Quantity (${product.unit})`} />
            <div>
              <p className="text-xs text-slate-500">
                Unit price <span className="font-medium text-slate-900">{formatRupiah(unitPrice)}</span> / {product.unit}
              </p>
              <p className="text-lg font-bold text-brand" data-testid="line-total">
                {formatRupiah(unitPrice * quantity)}
              </p>
            </div>
          </div>
          {product.min_order_qty > 1 && (
            <p className="text-xs text-slate-500">
              Minimum order: {product.min_order_qty} {product.unit}
            </p>
          )}
          {product.fulfillment_type === "indent" && (
            <p className="text-xs text-indigo-700">
              Made to order. Estimated lead time {product.lead_time_days} days after the supplier confirms your order.
            </p>
          )}
          <AddToCartButton product={product} quantity={quantity} className="w-full py-2.5" />
        </div>
      ) : (
        <AddToCartButton product={product} className="w-full py-2.5" />
      )}
    </div>
  );
}