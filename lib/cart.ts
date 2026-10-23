import type { CartItem, CartProductSnapshot, Product } from "@/types";

const MAX_QUANTITY = 100_000;

export function toSnapshot(product: Product): CartProductSnapshot {
  return {
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    unit: product.unit,
    price: product.price,
    image_url: product.image_url,
    stock: product.stock,
    min_order_qty: product.min_order_qty,
    fulfillment_type: product.fulfillment_type,
    lead_time_days: product.lead_time_days,
    price_tiers: product.price_tiers ?? [],
    seller_id: product.seller_id,
    seller_name: product.seller?.store_name ?? null,
  };
}

/** The unit price for a quantity: the cheapest tier whose min_qty has been reached, else the base price. */
export function unitPriceFor(
  product: Pick<CartProductSnapshot, "price" | "price_tiers">,
  quantity: number,
): number {
  let price = product.price;
  let reached = 0;
  for (const tier of product.price_tiers) {
    if (tier.min_qty <= quantity && tier.min_qty > reached) {
      price = tier.unit_price;
      reached = tier.min_qty;
    }
  }
  return price;
}

/** Keep a quantity inside the rules: a whole number, at least the MOQ, and not above stock for stocked items. */
export function clampQuantity(
  product: Pick<CartProductSnapshot, "min_order_qty" | "stock" | "fulfillment_type">,
  quantity: number,
): number {
  const whole = Number.isFinite(quantity) ? Math.floor(quantity) : product.min_order_qty;
  const max = product.fulfillment_type === "stock" ? Math.max(product.stock, 0) : MAX_QUANTITY;
  return Math.max(product.min_order_qty, Math.min(whole, Math.max(max, product.min_order_qty)));
}

export function isOrderable(product: Pick<CartProductSnapshot, "stock" | "fulfillment_type" | "min_order_qty">): boolean {
  return product.fulfillment_type === "indent" || product.stock >= product.min_order_qty;
}

export function addToCart(items: CartItem[], product: Product, quantity: number): CartItem[] {
  const snapshot = toSnapshot(product);
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { productId: product.id, snapshot, quantity: clampQuantity(snapshot, item.quantity + quantity) }
        : item,
    );
  }
  return [...items, { productId: product.id, snapshot, quantity: clampQuantity(snapshot, quantity) }];
}

export function setLineQuantity(items: CartItem[], productId: number, quantity: number): CartItem[] {
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: clampQuantity(item.snapshot, quantity) } : item,
  );
}

export function removeLine(items: CartItem[], productId: number): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function lineTotal(item: CartItem): number {
  return unitPriceFor(item.snapshot, item.quantity) * item.quantity;
}

export function cartTotals(items: CartItem[]): { lineCount: number; unitCount: number; subtotal: number } {
  return items.reduce(
    (totals, item) => ({
      lineCount: totals.lineCount + 1,
      unitCount: totals.unitCount + item.quantity,
      subtotal: totals.subtotal + lineTotal(item),
    }),
    { lineCount: 0, unitCount: 0, subtotal: 0 },
  );
}

export interface RefreshResult {
  items: CartItem[];
  removed: string[];
  changed: string[];
}

/** Compare the saved cart with fresh product data from the API and fix what changed. */
export function mergeFreshProducts(items: CartItem[], fresh: Product[]): RefreshResult {
  const byId = new Map(fresh.map((product) => [product.id, product]));
  const removed: string[] = [];
  const changed: string[] = [];
  const next: CartItem[] = [];
  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      removed.push(item.snapshot.name);
      continue;
    }
    const snapshot = toSnapshot(product);
    const quantity = clampQuantity(snapshot, item.quantity);
    if (
      snapshot.price !== item.snapshot.price ||
      quantity !== item.quantity ||
      JSON.stringify(snapshot.price_tiers) !== JSON.stringify(item.snapshot.price_tiers)
    ) {
      changed.push(snapshot.name);
    }
    next.push({ productId: item.productId, snapshot, quantity });
  }
  return { items: next, removed, changed };
}

export function toOrderItems(items: CartItem[]): { product_id: number; quantity: number }[] {
  return items.map((item) => ({ product_id: item.productId, quantity: item.quantity }));
}

/** Runtime check for data read back from localStorage (it could have been edited by hand). */
export function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    Number.isInteger(item.productId) &&
    Number.isInteger(item.quantity) &&
    (item.quantity as number) > 0 &&
    !!item.snapshot &&
    typeof item.snapshot.name === "string" &&
    typeof item.snapshot.price === "number" &&
    Array.isArray(item.snapshot.price_tiers)
  );
}