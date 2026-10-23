"use client";

import toast from "react-hot-toast";
import ProductForm from "@/components/forms/ProductForm";
import { updateProduct } from "@/lib/api-client";
import { productToFormValues, toProductBody } from "@/lib/validation";
import type { CategoryOption, Product } from "@/types";

interface EditProductFormProps {
  product: Product;
  categories: CategoryOption[];
  onUpdated: (product: Product) => void;
  onCancel: () => void;
}

export default function EditProductForm({ product, categories, onUpdated, onCancel }: EditProductFormProps) {
  return (
    <ProductForm
      initialValues={productToFormValues(product)}
      categories={categories}
      supplierName={product.seller?.store_name}
      submitLabel="Save changes"
      onCancel={onCancel}
      onSubmit={async (values) => {
        const updated = await updateProduct(product.id, toProductBody(values, { includeSeller: false }));
        toast.success(`"${updated.name}" was updated`);
        onUpdated(updated);
      }}
    />
  );
}