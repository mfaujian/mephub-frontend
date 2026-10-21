import { labelize } from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/types";

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentClasses: Record<PaymentStatus, string> = {
  unpaid: "bg-slate-100 text-slate-700",
  paid: "bg-green-100 text-green-800",
  terms_requested: "bg-amber-100 text-amber-800",
  terms_approved: "bg-teal-100 text-teal-800",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      data-testid="order-status"
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      data-testid="payment-status"
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${paymentClasses[status]}`}
    >
      {labelize(status)}
    </span>
  );
}