import Card from "@/components/Card";
import { formatRupiah } from "@/lib/format";
import type { CartItem } from "@/types";

interface CartSummaryProps {
  cart: CartItem[];
  itemCount: number;
  total: number;
  onRemove: (productId: number) => void;
  onClear: () => void;
}

export default function CartSummary({
  cart,
  itemCount,
  total,
  onRemove,
  onClear,
}: CartSummaryProps) {
  return (
    <Card as="aside" className="p-4">
      <h2 className="border-b border-slate-200 pb-2 font-semibold text-slate-900">Cart Summary</h2>

      {cart.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">Your cart is empty.</p>
      ) : (
        <ul className="divide-y divide-slate-100 py-2 text-sm">
          {cart.map((item) => (
            <li key={item.product.id} className="flex items-start justify-between gap-2 py-2">
              <div>
                <p className="font-medium text-slate-800">{item.product.name}</p>
                <p className="text-xs text-slate-500">
                  {item.quantity} x {formatRupiah(item.product.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.product.id)}
                className="text-xs text-red-600 hover:underline"
                aria-label={`Remove ${item.product.name} from cart`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <dl className="space-y-1 border-t border-slate-200 pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Items</dt>
          <dd className="font-medium text-slate-900">{itemCount} items</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Total</dt>
          <dd className="font-bold text-brand">{formatRupiah(total)}</dd>
        </div>
      </dl>

      {cart.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 w-full rounded-md border border-slate-300 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Clear cart
        </button>
      )}
    </Card>
  );
}
