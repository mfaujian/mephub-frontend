"use client";

import toast from "react-hot-toast";
import ProductForm from "@/components/forms/ProductForm";
import { createProduct } from "@/lib/api-client";
import { emptyProductForm, toProductBody } from "@/lib/validation";
import type { CategoryOption, Product, Store } from "@/types";

interface CreateProductFormProps {
  categories: CategoryOption[];
  stores: Store[];
  onCreated: (product: Product) => void;
  onCancel: () => void;
}

export default function CreateProductForm({ categories, stores, onCreated, onCancel }: CreateProductFormProps) {
  return (
    <ProductForm
      initialValues={emptyProductForm}
      categories={categories}
      stores={stores}
      submitLabel="Create product"
      onCancel={onCancel}
      onSubmit={async (values) => {
        const product = await createProduct(toProductBody(values, { includeSeller: true }));
        toast.success(`"${product.name}" was created`);
        onCreated(product);
      }}
    />
  );
}