import type { Metadata } from "next";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { getMyOrders } from "@/lib/api";
import { formatDate, formatRupiah, shortId } from "@/lib/format";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrdersPage() {
  const { orders, meta } = await getMyOrders({ limit: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">
          {meta.total_items} {meta.total_items === 1 ? "order" : "orders"}
        </p>
      </div>

      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
        Showing the orders of a demo buyer account.
      </p>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No orders yet.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} as="article" className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
                <div>
                  <h2 className="font-semibold text-slate-900">Order #{shortId(order.id)}</h2>
                  <p className="text-xs text-slate-500">Placed {formatDate(order.created_at)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-2 font-medium">Product</th>
                    <th className="px-2 py-2 text-right font-medium">Qty</th>
                    <th className="px-2 py-2 text-right font-medium">Unit price</th>
                    <th className="px-5 py-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.order_items.map((item) => (
                    <tr key={item.product_id}>
                      <td className="px-5 py-2 text-slate-800">
                        {item.product_name ?? `Product #${item.product_id}`}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{item.quantity}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{formatRupiah(item.unit_price)}</td>
                      <td className="px-5 py-2 text-right tabular-nums">
                        {formatRupiah(item.subtotal ?? item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-200 px-5 py-3 text-sm">
                <p className="max-w-md text-slate-500">Ship to: {order.shipping_address}</p>
                <p className="font-bold text-brand">Total {formatRupiah(order.total_amount)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
