"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import { useCart } from "@/hooks/useCart";
import { lookupProducts } from "@/lib/api-client";
import { clampQuantity, isOrderable, toSnapshot, unitPriceFor } from "@/lib/cart";
import { errorMessage } from "@/lib/errors";
import { formatRupiah } from "@/lib/format";
import { parseQuickOrder } from "@/lib/quick-order";
import { inputClass, primaryButton, secondaryButton } from "@/lib/ui";
import type { Product } from "@/types";

interface ResolvedLine {
  sku: string;
  requested: number;
  product: Product | null;
  quantity: number;
  note: string | null;
}

export default function QuickOrderView() {
  const { addItem } = useCart();
  const [text, setText] = useState("");
  const [lines, setLines] = useState<ResolvedLine[] | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleLookup() {
    const parsed = parseQuickOrder(text);
    setInvalid(parsed.invalid);
    if (parsed.lines.length === 0) {
      setLines([]);
      toast.error("Paste at least one part number, for example: EZ9F34110, 24");
      return;
    }
    setBusy(true);
    try {
      const products = await lookupProducts({ skus: parsed.lines.map((line) => line.sku) });
      const bySku = new Map(products.map((product) => [product.sku?.toUpperCase(), product]));
      setLines(
        parsed.lines.map(({ sku, quantity }) => {
          const product = bySku.get(sku) ?? null;
          if (!product) return { sku, requested: quantity, product: null, quantity, note: "Part number not found" };
          const snapshot = toSnapshot(product);
          if (!isOrderable(snapshot)) return { sku, requested: quantity, product, quantity, note: "Out of stock" };
          const adjusted = clampQuantity(snapshot, quantity);
          const note =
            adjusted > quantity
              ? `Raised to the minimum order of ${product.min_order_qty} ${product.unit}`
              : adjusted < quantity
                ? `Reduced to the ${adjusted} ${product.unit} in stock`
                : null;
          return { sku, requested: quantity, product, quantity: adjusted, note };
        }),
      );
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const addable = (lines ?? []).filter((line) => line.product && isOrderable(toSnapshot(line.product)));

  function addAll() {
    for (const line of addable) addItem(line.product as Product, line.quantity);
    toast.success(`${addable.length} ${addable.length === 1 ? "item" : "items"} added to your cart`);
    setLines(null);
    setText("");
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-5">
        <label htmlFor="quick-order-text" className="block text-sm font-medium text-slate-700">
          Part numbers and quantities
        </label>
        <textarea
          id="quick-order-text"
          rows={6}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"EZ9F34110, 24\nLC1E0910M5 10\n6205-2RS  20"}
          className={`${inputClass} font-mono`}
        />
        <p className="text-xs text-slate-500">One part number per line. Separate the quantity with a comma, a space or a tab. Pasting from Excel works.</p>
        <div className="flex gap-3">
          <button type="button" onClick={handleLookup} disabled={busy || !text.trim()} className={primaryButton} data-testid="quick-order-lookup">
            {busy ? "Looking up..." : "Look up parts"}
          </button>
          {text && (
            <button type="button" onClick={() => { setText(""); setLines(null); setInvalid([]); }} className={secondaryButton}>
              Clear
            </button>
          )}
        </div>
      </Card>

      {invalid.length > 0 && (
        <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Could not read these lines: {invalid.join(" | ")}
        </p>
      )}

      {lines && lines.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm" data-testid="quick-order-results">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Part no.</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Unit price</th>
                <th className="px-4 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.sku} data-testid="quick-order-row" className={line.product && !line.note?.startsWith("Out") ? "" : "bg-red-50"}>
                  <td className="px-4 py-3 font-mono">{line.sku}</td>
                  <td className="px-4 py-3">
                    {line.product ? (
                      <Link href={`/products/${line.product.id}`} className="hover:underline">
                        {line.product.name}
                      </Link>
                    ) : (
                      <span className="text-red-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{line.product ? `${line.quantity} ${line.product.unit}` : line.requested}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {line.product ? formatRupiah(unitPriceFor(toSnapshot(line.product), line.quantity)) : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{line.note ?? "OK"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <p className="text-sm text-slate-600">
              {addable.length} of {lines.length} lines can be added
            </p>
            <button type="button" onClick={addAll} disabled={addable.length === 0} className={primaryButton} data-testid="quick-order-add-all">
              Add {addable.length} to cart
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}