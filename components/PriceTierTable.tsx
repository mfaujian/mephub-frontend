import { formatRupiah } from "@/lib/format";
import type { PriceTier } from "@/types";

interface PriceTierTableProps {
  basePrice: number;
  unit: string;
  tiers: PriceTier[];
  /** Highlight the row that applies to this quantity. */
  activeQuantity?: number;
}

export default function PriceTierTable({ basePrice, unit, tiers, activeQuantity }: PriceTierTableProps) {
  if (tiers.length === 0) return null;
  const rows = [{ min_qty: 1, unit_price: basePrice }, ...tiers].map((tier, index, all) => {
    const next = all[index + 1];
    return { ...tier, max: next ? next.min_qty - 1 : null };
  });
  const activeMin =
    activeQuantity === undefined ? null : Math.max(...rows.filter((row) => row.min_qty <= activeQuantity).map((row) => row.min_qty));
  return (
    <div data-testid="price-tiers" className="overflow-hidden rounded-lg border border-slate-200">
      <h2 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">Volume pricing</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2 font-medium">Quantity ({unit})</th>
            <th className="px-4 py-2 text-right font-medium">Price per {unit}</th>
            <th className="px-4 py-2 text-right font-medium">You save</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.min_qty} className={row.min_qty === activeMin ? "bg-amber-50 font-semibold" : ""}>
              <td className="px-4 py-2">{row.max ? `${row.min_qty} - ${row.max}` : `${row.min_qty}+`}</td>
              <td className="px-4 py-2 text-right">{formatRupiah(row.unit_price)}</td>
              <td className="px-4 py-2 text-right text-green-700">
                {row.unit_price < basePrice ? `${Math.round((1 - row.unit_price / basePrice) * 100)}%` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}