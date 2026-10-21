// ---------- Products ----------
export interface CategorySummary {
  id: number;
  name: string;
}

export interface SellerSummary {
  id: number;
  store_name: string;
}

export interface PriceTier {
  min_qty: number;
  unit_price: number;
}

export type FulfillmentType = "stock" | "indent";

export interface Product {
  id: number;
  category_id: number;
  seller_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  sku: string | null;
  brand: string | null;
  unit: string;
  min_order_qty: number;
  tkdn_percent: number | null;
  datasheet_url: string | null;
  fulfillment_type: FulfillmentType;
  lead_time_days: number | null;
  price_tiers: PriceTier[];
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  category?: CategorySummary;
  seller?: SellerSummary;
}

// ---------- Categories ----------
export interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  subcategories: Category[];
}

export interface CategoryWithCount extends Category {
  productCount: number;
}

/** Minimal shape used by <select> dropdowns */
export interface CategoryOption {
  id: number;
  name: string;
}

export interface Brand {
  name: string;
  count: number;
}

// ---------- API envelopes ----------
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProductListResponse {
  message: string;
  data: Product[];
  meta: PaginationMeta;
}

export interface ProductResponse {
  message: string;
  product: Product;
}

export interface CategoryListResponse {
  message: string;
  categories: Category[];
}

export interface CategoryResponse {
  message: string;
  category: Category;
}

export interface Store {
  id: number;
  store_name: string;
}

// ---------- Orders ----------
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "bank_transfer" | "request_terms";
export type PaymentStatus = "unpaid" | "paid" | "terms_requested" | "terms_approved";

export interface OrderItem {
  product_id: number;
  sku: string | null;
  product_name: string | null;
  unit: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: number;
  seller_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  po_number: string | null;
  notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  requested_delivery_date: string | null;
  buyer: { id: number; full_name: string; email: string } | null;
  seller: { id: number; store_name: string } | null;
  order_items: OrderItem[];
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderListResponse {
  message: string;
  orders: Order[];
  meta: PaginationMeta;
}

export interface CreateOrderPayload {
  items: { product_id: number; quantity: number }[];
  shipping_address_id?: number;
  shipping_address?: string;
  po_number?: string;
  notes?: string;
  payment_method: PaymentMethod;
  requested_delivery_date?: string;
}

// ---------- Addresses ----------
export interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export type AddressInput = Omit<Address, "id">;

// ---------- Auth ----------
export type UserRole = "admin" | "user";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// ---------- Cart (kept in localStorage) ----------
/** Just enough product data to draw the cart without another request. The server re-checks everything at checkout. */
export interface CartProductSnapshot {
  name: string;
  sku: string | null;
  brand: string | null;
  unit: string;
  price: number;
  image_url: string | null;
  stock: number;
  min_order_qty: number;
  fulfillment_type: FulfillmentType;
  lead_time_days: number | null;
  price_tiers: PriceTier[];
  seller_id: number;
  seller_name: string | null;
}

export interface CartItem {
  productId: number;
  quantity: number;
  snapshot: CartProductSnapshot;
}