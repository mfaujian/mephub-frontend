"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import AddressForm from "@/components/forms/AddressForm";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/forms/Fields";
import WhatsAppLink from "@/components/WhatsAppLink";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCart } from "@/hooks/useCart";
import { createOrder, fetchAddresses } from "@/lib/api-client";
import { toOrderItems, lineTotal } from "@/lib/cart";
import { ApiError, errorMessage } from "@/lib/errors";
import { formatRupiah } from "@/lib/format";
import { primaryButton, secondaryButton } from "@/lib/ui";
import type { PaymentMethod } from "@/types";

interface LineProblem {
  product_id: number;
  message: string;
}

export default function CheckoutView() {
  const router = useRouter();
  const { items, isReady, subtotal, clear, refresh } = useCart();
  const loadAddresses = useCallback(() => fetchAddresses(), []);
  const { data: addresses, error: addressError, reload: reloadAddresses } = useAsyncData(loadAddresses);

  const [chosenId, setChosenId] = useState<number | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  // "today" is the minimum for the delivery date picker. It is read in the browser only (empty on the server).
  const today = useSyncExternalStore(
    () => () => {},
    () => new Date().toLocaleDateString("en-CA"),
    () => "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [problems, setProblems] = useState<LineProblem[]>([]);
  const [placed, setPlaced] = useState(false);

  // Make sure prices and stock shown here are fresh.
  useEffect(() => {
    if (isReady) refresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const defaultAddress = addresses?.find((address) => address.is_default) ?? addresses?.[0];
  const selectedId = chosenId ?? defaultAddress?.id ?? null;
  const showAddressForm = addingAddress || (addresses !== null && addresses.length === 0);

  async function handleConfirm() {
    setFormError(null);
    setProblems([]);
    if (selectedId === null) {
      setFormError("Choose a delivery address or add a new one.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await createOrder({
        items: toOrderItems(items),
        shipping_address_id: selectedId,
        po_number: poNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        payment_method: paymentMethod,
        requested_delivery_date: deliveryDate || undefined,
      });
      setPlaced(true); // stops the "cart is empty" message from flashing while we redirect
      clear();
      toast.success(
        response.orders_created > 1
          ? `Order placed! It was split into ${response.orders_created} orders, one per supplier.`
          : "Order placed successfully!",
      );
      router.push("/orders");
    } catch (error) {
      const message = errorMessage(error, "Could not place your order.");
      setFormError(message);
      if (error instanceof ApiError && error.status === 422 && Array.isArray(error.details)) {
        setProblems(error.details as LineProblem[]);
        refresh().catch(() => undefined);
      }
      toast.error(message);
      setSubmitting(false);
    }
  }

  if (!isReady) return <div aria-busy="true" className="h-48 animate-pulse rounded-lg bg-slate-200" />;

  if (items.length === 0 && !placed) {
    return (
      <Card className="p-10 text-center">
        <p className="text-lg font-semibold text-slate-800">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-600">Add products to your cart before checking out.</p>
        <Link href="/products" className={`${primaryButton} mt-4 inline-block`}>
          Browse products
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold text-slate-900">1. Delivery address</h2>
          {addressError && !addresses ? (
            <p role="alert" className="text-sm text-red-600">
              {addressError}{" "}
              <button type="button" onClick={reloadAddresses} className="font-medium underline">
                Try again
              </button>
            </p>
          ) : !addresses ? (
            <div aria-busy="true" className="h-16 animate-pulse rounded bg-slate-100" />
          ) : (
            <>
              {addresses.length > 0 && (
                <fieldset className="space-y-2">
                  <legend className="sr-only">Saved addresses</legend>
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm ${
                        selectedId === address.id ? "border-brand bg-slate-50" : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedId === address.id}
                        onChange={() => setChosenId(address.id)}
                        aria-label={`Deliver to ${address.label}`}
                      />
                      <span>
                        <span className="font-medium text-slate-900">{address.label}</span>
                        {address.is_default && <span className="ml-2 text-xs text-green-700">Default</span>}
                        <span className="block text-slate-600">
                          {address.recipient_name} · {address.phone}
                        </span>
                        <span className="block text-slate-600">
                          {address.address_line}, {address.city}, {address.province} {address.postal_code}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
              {showAddressForm ? (
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-800">
                    {addresses.length === 0 ? "Add your first delivery address" : "New address"}
                  </p>
                  <AddressForm
                    onCancel={addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                    onSaved={(saved) => {
                      setAddingAddress(false);
                      setChosenId(saved.id);
                      reloadAddresses();
                    }}
                  />
                </div>
              ) : (
                <button type="button" onClick={() => setAddingAddress(true)} className={secondaryButton}>
                  Use a different address
                </button>
              )}
            </>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold text-slate-900">2. Order details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="po_number" label="PO number (optional)" value={poNumber} maxLength={60} onChange={(e) => setPoNumber(e.target.value)} hint="Your company's purchase order reference." />
            <TextField id="delivery_date" label="Requested delivery date (optional)" type="date" min={today} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </div>
          <TextAreaField id="notes" label="Notes for the supplier (optional)" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <SelectField id="payment_method" label="Payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            <option value="bank_transfer">Bank transfer (pay now)</option>
            <option value="request_terms">Request payment terms (invoice, for companies)</option>
          </SelectField>
          {paymentMethod === "request_terms" && (
            <p className="text-xs text-slate-600">An administrator reviews payment-terms requests before the order is processed.</p>
          )}
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-4 space-y-4 p-5">
          <h2 className="font-semibold text-slate-900">3. Review and confirm</h2>
          <ul className="divide-y divide-slate-100 text-sm" data-testid="checkout-items">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3 py-2">
                <span>
                  {item.snapshot.name}
                  <span className="block text-xs text-slate-500">
                    {item.quantity} {item.snapshot.unit}
                  </span>
                </span>
                <span className="tabular-nums">{formatRupiah(lineTotal(item))}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
            <span className="font-medium text-slate-700">Total</span>
            <span className="text-xl font-bold text-brand" data-testid="checkout-total">
              {formatRupiah(subtotal)}
            </span>
          </div>
          <FormError message={formError} />
          {problems.length > 0 && (
            <ul role="alert" className="list-inside list-disc rounded-md bg-amber-50 p-3 text-xs text-amber-800" data-testid="line-problems">
              {problems.map((problem) => (
                <li key={`${problem.product_id}-${problem.message}`}>{problem.message}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            data-testid="confirm-order"
            onClick={handleConfirm}
            disabled={submitting || items.length === 0 || selectedId === null}
            className={`${primaryButton} w-full py-2.5`}
          >
            {submitting ? "Placing order..." : "Confirm order"}
          </button>
          <WhatsAppLink
            className="w-full justify-center"
            message={`Hello MEPhub, I am about to order ${items.length} ${items.length === 1 ? "item" : "items"} (total ${formatRupiah(subtotal)}) and would like to confirm stock and price.`}
          />
          <Link href="/cart" className="block text-center text-sm font-medium text-brand hover:underline">
            &larr; Back to cart
          </Link>
        </Card>
      </div>
    </div>
  );
}