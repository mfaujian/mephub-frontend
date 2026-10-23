"use client";

import { useContext } from "react";
import { CartContext, type CartContextValue } from "@/context/CartContext";

/** Access the shopping cart (saved in localStorage) and its actions. */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}