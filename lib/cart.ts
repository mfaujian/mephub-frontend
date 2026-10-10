import type { CartItem, Product } from "@/types";

export function addToCart(
  cart: CartItem[],
  product: Product,
  quantity: number,
): CartItem[] {
  const existing = cart.find((item) => item.product.id === product.id);

  if (existing) {
    return cart.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
        : item,
    );
  }

  return [...cart, { product, quantity: Math.min(quantity, product.stock) }];
}

export function removeFromCart(cart: CartItem[], productId: number): CartItem[] {
  return cart.filter((item) => item.product.id !== productId);
}

export function getCartTotals(cart: CartItem[]): {
  itemCount: number;
  total: number;
} {
  return cart.reduce(
    (totals, item) => ({
      itemCount: totals.itemCount + item.quantity,
      total: totals.total + item.product.price * item.quantity,
    }),
    { itemCount: 0, total: 0 },
  );
}
