import type { AddressInput } from "@/types";

/** A form's error messages by field. An empty object means the form is valid. */
export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Login ----------
export interface LoginValues {
  email: string;
  password: string;
}

export function validateLogin(values: LoginValues): FieldErrors<keyof LoginValues> {
  const errors: FieldErrors<keyof LoginValues> = {};
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Password is required.";
  return errors;
}

// ---------- Register ----------
export interface RegisterValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegister(values: RegisterValues): FieldErrors<keyof RegisterValues> {
  const errors: FieldErrors<keyof RegisterValues> = {};
  if (values.fullName.trim().length < 3) errors.fullName = "Full name must be at least 3 characters.";
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.password.length < 6) errors.password = "Password must be at least 6 characters.";
  else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = "Password must contain at least one letter and one number.";
  }
  if (!values.confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

// ---------- Category ----------
export interface CategoryValues {
  name: string;
  description: string;
  parentId: string;
}

export function validateCategory(values: CategoryValues): FieldErrors<keyof CategoryValues> {
  const errors: FieldErrors<keyof CategoryValues> = {};
  const name = values.name.trim();
  if (!name) errors.name = "Category name is required.";
  else if (name.length < 2) errors.name = "Category name must be at least 2 characters.";
  else if (name.length > 100) errors.name = "Category name must be 100 characters or fewer.";
  return errors;
}

// ---------- Product ----------
export interface TierRow {
  minQty: string;
  unitPrice: string;
}

export interface ProductFormValues {
  name: string;
  sku: string;
  brand: string;
  categoryId: string;
  sellerId: string;
  price: string;
  stock: string;
  unit: string;
  minOrderQty: string;
  tkdnPercent: string;
  fulfillmentType: "stock" | "indent";
  leadTimeDays: string;
  datasheetUrl: string;
  imageUrl: string;
  description: string;
  tiers: TierRow[];
}

export type ProductFormErrors = FieldErrors<keyof ProductFormValues>;

export const emptyProductForm: ProductFormValues = {
  name: "",
  sku: "",
  brand: "",
  categoryId: "",
  sellerId: "",
  price: "",
  stock: "0",
  unit: "pcs",
  minOrderQty: "1",
  tkdnPercent: "",
  fulfillmentType: "stock",
  leadTimeDays: "",
  datasheetUrl: "",
  imageUrl: "",
  description: "",
  tiers: [],
};

function isWholeNumber(text: string, min: number): boolean {
  const value = Number(text);
  return text.trim() !== "" && Number.isInteger(value) && value >= min;
}

export function validateProduct(values: ProductFormValues, options: { requireSeller: boolean }): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const name = values.name.trim();
  if (name.length < 3) errors.name = "Product name must be at least 3 characters.";
  else if (name.length > 255) errors.name = "Product name must be 255 characters or fewer.";
  if (values.sku.trim().length > 64) errors.sku = "SKU must be 64 characters or fewer.";
  if (!values.categoryId) errors.categoryId = "Choose a category.";
  if (options.requireSeller && !values.sellerId) errors.sellerId = "Choose the supplier who sells this product.";
  const price = Number(values.price);
  if (values.price.trim() === "" || Number.isNaN(price) || price <= 0) errors.price = "Enter a price greater than 0.";
  if (!isWholeNumber(values.stock, 0)) errors.stock = "Stock must be a whole number, 0 or more.";
  if (!values.unit.trim()) errors.unit = "Unit is required (for example pcs, roll, box).";
  if (!isWholeNumber(values.minOrderQty, 1)) errors.minOrderQty = "Minimum order must be a whole number, 1 or more.";
  if (values.tkdnPercent.trim() !== "") {
    const tkdn = Number(values.tkdnPercent);
    if (Number.isNaN(tkdn) || tkdn < 0 || tkdn > 100) errors.tkdnPercent = "TKDN must be between 0 and 100.";
  }
  if (values.fulfillmentType === "indent" && !isWholeNumber(values.leadTimeDays, 1)) {
    errors.leadTimeDays = "Lead time (days) is required for made-to-order products.";
  }
  if (values.datasheetUrl.trim() && !/^https?:\/\//i.test(values.datasheetUrl.trim())) {
    errors.datasheetUrl = "Datasheet link must start with http:// or https://";
  }
  if (values.imageUrl.trim() && !/^https?:\/\//i.test(values.imageUrl.trim())) {
    errors.imageUrl = "Image link must start with http:// or https://";
  }
  if (values.tiers.length > 0) {
    const sorted: { qty: number; price: number }[] = [];
    let tierError: string | null = null;
    for (const row of values.tiers) {
      const qty = Number(row.minQty);
      const tierPrice = Number(row.unitPrice);
      if (!isWholeNumber(row.minQty, 2) || row.unitPrice.trim() === "" || Number.isNaN(tierPrice) || tierPrice < 0) {
        tierError = "Each price tier needs a whole minimum quantity of 2 or more and a price.";
        break;
      }
      sorted.push({ qty, price: tierPrice });
    }
    if (!tierError) {
      sorted.sort((a, b) => a.qty - b.qty);
      let previous = Number.isNaN(price) ? Infinity : price;
      for (const tier of sorted) {
        if (tier.price >= previous) {
          tierError = "Each price tier must be cheaper than the one before it and the base price.";
          break;
        }
        previous = tier.price;
      }
      if (new Set(sorted.map((tier) => tier.qty)).size !== sorted.length) {
        tierError = "Price tiers cannot repeat the same minimum quantity.";
      }
    }
    if (tierError) errors.tiers = tierError;
  }
  return errors;
}

/** Form values -> the JSON body the API expects. */
export function toProductBody(values: ProductFormValues, options: { includeSeller: boolean }): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: values.name.trim(),
    category_id: Number(values.categoryId),
    price: Number(values.price),
    stock: Number(values.stock),
    unit: values.unit.trim(),
    min_order_qty: Number(values.minOrderQty),
    sku: values.sku.trim() || null,
    brand: values.brand.trim() || null,
    tkdn_percent: values.tkdnPercent.trim() === "" ? null : Number(values.tkdnPercent),
    fulfillment_type: values.fulfillmentType,
    lead_time_days: values.fulfillmentType === "indent" ? Number(values.leadTimeDays) : null,
    datasheet_url: values.datasheetUrl.trim() || null,
    image_url: values.imageUrl.trim() || null,
    description: values.description.trim() || null,
    price_tiers: values.tiers.map((row) => ({ min_qty: Number(row.minQty), unit_price: Number(row.unitPrice) })),
  };
  if (options.includeSeller) body.seller_id = Number(values.sellerId);
  return body;
}

// ---------- Address ----------
export type AddressValues = Omit<AddressInput, "is_default">;

export const emptyAddress: AddressValues = {
  label: "",
  recipient_name: "",
  phone: "",
  address_line: "",
  city: "",
  province: "",
  postal_code: "",
};

export function validateAddress(values: AddressValues): FieldErrors<keyof AddressValues> {
  const errors: FieldErrors<keyof AddressValues> = {};
  if (!values.label.trim()) errors.label = "Give this address a short label (for example Site A).";
  if (values.recipient_name.trim().length < 2) errors.recipient_name = "Recipient name is required.";
  if (!/^[0-9+\-\s()]{6,30}$/.test(values.phone.trim())) errors.phone = "Enter a valid phone number (6-30 digits).";
  if (values.address_line.trim().length < 5) errors.address_line = "Street address must be at least 5 characters.";
  if (values.city.trim().length < 2) errors.city = "City is required.";
  if (values.province.trim().length < 2) errors.province = "Province is required.";
  if (!/^[0-9]{4,10}$/.test(values.postal_code.trim())) errors.postal_code = "Postal code must be 4-10 digits.";
  return errors;
}

/** Existing product -> form values (for the edit form). */
export function productToFormValues(product: {
  name: string;
  sku: string | null;
  brand: string | null;
  category_id: number;
  seller_id: number;
  price: number;
  stock: number;
  unit: string;
  min_order_qty: number;
  tkdn_percent: number | null;
  fulfillment_type: "stock" | "indent";
  lead_time_days: number | null;
  datasheet_url: string | null;
  image_url: string | null;
  description: string | null;
  price_tiers: { min_qty: number; unit_price: number }[];
}): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku ?? "",
    brand: product.brand ?? "",
    categoryId: String(product.category_id),
    sellerId: String(product.seller_id),
    price: String(product.price),
    stock: String(product.stock),
    unit: product.unit,
    minOrderQty: String(product.min_order_qty),
    tkdnPercent: product.tkdn_percent === null ? "" : String(product.tkdn_percent),
    fulfillmentType: product.fulfillment_type,
    leadTimeDays: product.lead_time_days === null ? "" : String(product.lead_time_days),
    datasheetUrl: product.datasheet_url ?? "",
    imageUrl: product.image_url ?? "",
    description: product.description ?? "",
    tiers: product.price_tiers.map((tier) => ({ minQty: String(tier.min_qty), unitPrice: String(tier.unit_price) })),
  };
}