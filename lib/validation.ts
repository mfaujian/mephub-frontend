export interface ProductFormValues {
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  description: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export const emptyProductForm: ProductFormValues = {
  name: "",
  price: "",
  stock: "",
  categoryId: "",
  description: "",
};

/** Returns an object of error messages. An empty object means the form is valid. */
export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  const name = values.name.trim();
  if (name.length < 3) {
    errors.name = "Product name must be at least 3 characters.";
  } else if (name.length > 255) {
    errors.name = "Product name must be 255 characters or fewer.";
  }

  const price = Number(values.price);
  if (values.price.trim() === "" || Number.isNaN(price) || price <= 0) {
    errors.price = "Enter a price greater than 0.";
  }

  const stock = Number(values.stock);
  if (values.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) {
    errors.stock = "Stock must be a whole number, 0 or more.";
  }

  if (!values.categoryId) {
    errors.categoryId = "Choose a category.";
  }

  return errors;
}