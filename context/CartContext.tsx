"use client";

import { createContext, useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { lookupProducts } from "@/lib/api-client";
import {
  addToCart,
  cartTotals,
  isValidCartItem,
  mergeFreshProducts,
  removeLine,
  setLineQuantity,
  type RefreshResult,
} from "@/lib/cart";
import { STORAGE_KEYS, writeJson } from "@/lib/storage";
import type { CartItem, Product } from "@/types";

export interface CartContextValue {
  items: CartItem[];
  isReady: boolean;
  lineCount: number;
  unitCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  /** Re-check prices, stock and availability with the server and fix the saved cart. */
  refresh: () => Promise<RefreshResult>;
}

export const CartContext = createContext<CartContextValue | null>(null);

const CART_EVENT = "mephub:cart-changed";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CART_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CART_EVENT, callback);
  };
}

function getRawCart(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.cart);
  } catch {
    return null;
  }
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isValidCartItem) : [];
  } catch {
    return [];
  }
}

function readCart(): CartItem[] {
  return parseCart(getRawCart());
}

function writeCart(items: CartItem[]): void {
  writeJson(STORAGE_KEYS.cart, items);
  window.dispatchEvent(new Event(CART_EVENT));
}

const subscribeNothing = () => () => {};

export function CartProvider({ children }: { children: ReactNode }) {
  const rawCart = useSyncExternalStore(subscribe, getRawCart, () => null);
  const isReady = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const items = useMemo(() => parseCart(rawCart), [rawCart]);
  const totals = useMemo(() => cartTotals(items), [items]);

  const addItem = useCallback((product: Product, quantity: number = product.min_order_qty) => {
    writeCart(addToCart(readCart(), product, quantity));
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    writeCart(setLineQuantity(readCart(), productId, quantity));
  }, []);

  const removeItem = useCallback((productId: number) => {
    writeCart(removeLine(readCart(), productId));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  const refresh = useCallback(async (): Promise<RefreshResult> => {
    const current = readCart();
    if (current.length === 0) return { items: current, removed: [], changed: [] };
    const fresh = await lookupProducts({ ids: current.map((item) => item.productId) });
    const result = mergeFreshProducts(current, fresh);
    if (JSON.stringify(result.items) !== JSON.stringify(current)) writeCart(result.items);
    return result;
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isReady,
      lineCount: totals.lineCount,
      unitCount: totals.unitCount,
      subtotal: totals.subtotal,
      addItem,
      setQuantity,
      removeItem,
      clear,
      refresh,
    }),
    [items, isReady, totals, addItem, setQuantity, removeItem, clear, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}