"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Card from "@/components/Card";
import {
  emptyProductForm,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/lib/validation";
import type { CategoryOption, Product } from "@/types";

interface AddProductFormProps {
  categories: CategoryOption[];
  onAddProduct: (product: Product) => void;
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function AddProductForm({ categories, onAddProduct }: AddProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyProductForm);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [success, setSuccess] = useState("");

  // One handler for every field: field name -> new value (a new object each time)
  const handleChange =
    (field: keyof ProductFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
      setErrors((previous) => ({ ...previous, [field]: undefined }));
      setSuccess("");
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateProductForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const category = categories.find((option) => option.id === Number(values.categoryId));
    const newProduct: Product = {
      id: -Date.now(),
      category_id: Number(values.categoryId),
      seller_id: 0,
      name: values.name.trim(),
      slug: `draft-${Date.now()}`,
      description: values.description.trim() || null,
      price: Number(values.price),
      stock: Number(values.stock),
      image_url: null,
      is_active: true,
      created_at: null,
      updated_at: null,
      category: category ? { id: category.id, name: category.name } : undefined,
      isDraft: true,
    };

    onAddProduct(newProduct);
    setValues(emptyProductForm);
    setErrors({});
    setSuccess(`"${newProduct.name}" was added to the list (draft, not saved to the API).`);
  };

  return (
    <Card className="p-4">
      <h2 className="font-semibold text-slate-900">Add a product (draft)</h2>
      <p className="mt-1 text-xs text-slate-500">
        Saved only in this page&apos;s state.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-slate-700">
            Product name
          </label>
          <input
            id="product-name"
            type="text"
            value={values.name}
            onChange={handleChange("name")}
            aria-invalid={Boolean(errors.name)}
            className={inputClass}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="product-price" className="mb-1 block text-sm font-medium text-slate-700">
              Price (IDR)
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              value={values.price}
              onChange={handleChange("price")}
              aria-invalid={Boolean(errors.price)}
              className={inputClass}
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="product-stock" className="mb-1 block text-sm font-medium text-slate-700">
              Stock
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              value={values.stock}
              onChange={handleChange("stock")}
              aria-invalid={Boolean(errors.stock)}
              className={inputClass}
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="product-category" className="mb-1 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="product-category"
            value={values.categoryId}
            onChange={handleChange("categoryId")}
            aria-invalid={Boolean(errors.categoryId)}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
        </div>

        <div>
          <label htmlFor="product-description" className="mb-1 block text-sm font-medium text-slate-700">
            Description (optional)
          </label>
          <textarea
            id="product-description"
            rows={2}
            value={values.description}
            onChange={handleChange("description")}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-accent py-2 text-sm font-semibold text-slate-900 hover:brightness-95"
        >
          Add product
        </button>
        {success && (
          <p role="status" className="text-sm text-green-700">
            {success}
          </p>
        )}
      </form>
    </Card>
  );
}
