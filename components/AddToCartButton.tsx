"use client";

import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { isOrderable, toSnapshot } from "@/lib/cart";
import { getButtonClasses } from "@/lib/ui";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  /** Defaults to the product's minimum order quantity. */
  quantity?: number;
  className?: string;
  label?: string;
}

export default function AddToCartButton({ product, quantity, className = "", label = "Add to cart" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const quantityToAdd = quantity ?? product.min_order_qty;
  const orderable = isOrderable(toSnapshot(product));

  function handleClick() {
    if (quantityToAdd < product.min_order_qty) {
      toast.error(`Minimum order for this product is ${product.min_order_qty} ${product.unit}.`);
      return;
    }
    if (product.fulfillment_type === "stock" && quantityToAdd > product.stock) {
      toast.error(`Only ${product.stock} ${product.unit} in stock.`);
      return;
    }
    addItem(product, quantityToAdd);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <button
      type="button"
      data-testid="add-to-cart"
      disabled={!orderable}
      onClick={handleClick}
      className={`${getButtonClasses(orderable)} ${className}`}
    >
      {orderable ? label : "Out of stock"}
    </button>
  );
}