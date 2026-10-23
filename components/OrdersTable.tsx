import Link from "next/link";
import Card from "@/components/Card";
import StatusBadge, { PaymentBadge } from "@/components/StatusBadge";
import { formatDate, formatRupiah, shortId } from "@/lib/format";
import type { Order } from "@/types";

export default function OrdersTable({ orders, showBuyer = false }: { orders: Order[]; showBuyer?: boolean }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[48rem] text-sm" data-testid="orders-table">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Date</th>
            {showBuyer && <th className="px-4 py-3 font-medium">Buyer</th>}
            <th className="px-4 py-3 font-medium">Supplier</th>
            <th className="px-4 py-3 text-right font-medium">Items</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} data-testid="order-row">
              <td className="px-4 py-3">
                <Link href={`/orders/${order.id}`} className="font-mono font-medium text-brand hover:underline">
                  #{shortId(order.id)}
                </Link>
                {order.po_number && <p className="text-xs text-slate-500">PO {order.po_number}</p>}
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(order.created_at)}</td>
              {showBuyer && (
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{order.buyer?.full_name ?? "-"}</p>
                  <p className="text-xs text-slate-500">{order.buyer?.email}</p>
                </td>
              )}
              <td className="px-4 py-3 text-slate-600">{order.seller?.store_name ?? "-"}</td>
              <td className="px-4 py-3 text-right tabular-nums">{order.order_items.length}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRupiah(order.total_amount)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                <PaymentBadge status={order.payment_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}