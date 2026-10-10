"use client";

import { useState } from "react";
import { addToCart, getCartTotals, removeFromCart } from "@/lib/cart";
import type { CartItem, Product } from "@/types";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const add = (product: Product, quantity: number = 1) =>
    setCart((previous) => addToCart(previous, product, quantity));

  const remove = (productId: number) =>
    setCart((previous) => removeFromCart(previous, productId));

  const clear = () => setCart([]);

  const { itemCount, total } = getCartTotals(cart);

  return { cart, add, remove, clear, itemCount, total };
}
