// ---------- Products ----------
export interface CategorySummary {
  id: number;
  name: string;
}

export interface SellerSummary {
  id: number;
  store_name: string;
}

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
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  category?: CategorySummary;
  seller?: SellerSummary;
  isDraft?: boolean;
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

// ---------- Orders ----------
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product_id: number;
  product_name: string | null;
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
  order_items: OrderItem[];
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderListResponse {
  message: string;
  orders: Order[];
  meta: PaginationMeta;
}

// ---------- Auth ----------
export interface LoginResponse {
  message: string;
  token: string;
}

// ---------- Cart ----------
export interface CartItem {
  product: Product;
  quantity: number;
}
