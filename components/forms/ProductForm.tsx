"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/forms/Fields";
import { errorMessage } from "@/lib/errors";
import { inputClass, primaryButton, secondaryButton } from "@/lib/ui";
import { validateProduct, type FieldErrors, type ProductFormValues } from "@/lib/validation";
import type { CategoryOption, Store } from "@/types";

export interface ProductFormProps {
  initialValues: ProductFormValues;
  categories: CategoryOption[];
  /** Create form: the admin picks the supplier who sells the product. */
  stores?: Store[];
  /** Edit form: the supplier is shown but cannot be changed. */
  supplierName?: string;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}

/** The shared form behind CreateProductForm and EditProductForm. */
export default function ProductForm({
  initialValues,
  categories,
  stores,
  supplierName,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<keyof ProductFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const requireSeller = Boolean(stores);

  function update<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function updateTier(index: number, field: "minQty" | "unitPrice", value: string) {
    update(
      "tiers",
      values.tiers.map((row, position) => (position === index ? { ...row, [field]: value } : row)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateProduct(values, { requireSeller });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" data-testid="product-form">
      <FormError message={formError} />
      <TextField id="name" label="Product name" value={values.name} onChange={(e) => update("name", e.target.value)} error={errors.name} required />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField id="sku" label="SKU / part number" value={values.sku} onChange={(e) => update("sku", e.target.value)} error={errors.sku} />
        <TextField id="brand" label="Brand" value={values.brand} onChange={(e) => update("brand", e.target.value)} error={errors.brand} />
        <SelectField id="categoryId" label="Category" value={values.categoryId} onChange={(e) => update("categoryId", e.target.value)} error={errors.categoryId} required>
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>
      </div>
      {stores ? (
        <SelectField id="sellerId" label="Supplier" value={values.sellerId} onChange={(e) => update("sellerId", e.target.value)} error={errors.sellerId} required>
          <option value="">Choose a supplier</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.store_name}
            </option>
          ))}
        </SelectField>
      ) : (
        supplierName && (
          <p className="text-sm text-slate-600">
            Supplier: <span className="font-medium text-slate-900">{supplierName}</span>
          </p>
        )
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        <TextField id="price" label="Price (Rp)" type="number" min="0" step="any" value={values.price} onChange={(e) => update("price", e.target.value)} error={errors.price} required />
        <TextField id="stock" label="Stock" type="number" min="0" step="1" value={values.stock} onChange={(e) => update("stock", e.target.value)} error={errors.stock} required />
        <TextField id="unit" label="Unit" value={values.unit} onChange={(e) => update("unit", e.target.value)} error={errors.unit} required />
        <TextField id="minOrderQty" label="Min. order qty" type="number" min="1" step="1" value={values.minOrderQty} onChange={(e) => update("minOrderQty", e.target.value)} error={errors.minOrderQty} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField id="fulfillmentType" label="Availability" value={values.fulfillmentType} onChange={(e) => update("fulfillmentType", e.target.value as "stock" | "indent")}>
          <option value="stock">In stock (ships from stock)</option>
          <option value="indent">Made to order (indent)</option>
        </SelectField>
        {values.fulfillmentType === "indent" && (
          <TextField id="leadTimeDays" label="Lead time (days)" type="number" min="1" step="1" value={values.leadTimeDays} onChange={(e) => update("leadTimeDays", e.target.value)} error={errors.leadTimeDays} required />
        )}
        <TextField id="tkdnPercent" label="TKDN % (optional)" type="number" min="0" max="100" step="any" value={values.tkdnPercent} onChange={(e) => update("tkdnPercent", e.target.value)} error={errors.tkdnPercent} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="imageUrl" label="Image link (optional)" value={values.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} error={errors.imageUrl} placeholder="https://..." />
        <TextField id="datasheetUrl" label="Datasheet link (optional)" value={values.datasheetUrl} onChange={(e) => update("datasheetUrl", e.target.value)} error={errors.datasheetUrl} placeholder="https://..." />
      </div>
      <TextAreaField
        id="description"
        label="Description and specifications"
        rows={5}
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
        hint='Write one specification per line as "Label: value", for example "Rated current: 10 A". They become the specifications table.'
      />

      <fieldset className="space-y-2 rounded-md border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-700">Volume pricing (optional)</legend>
        {values.tiers.map((row, index) => (
          <div key={index} className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor={`tier-qty-${index}`} className="block text-xs text-slate-600">
                From quantity
              </label>
              <input id={`tier-qty-${index}`} type="number" min="2" step="1" value={row.minQty} onChange={(e) => updateTier(index, "minQty", e.target.value)} className={`${inputClass} w-32`} />
            </div>
            <div>
              <label htmlFor={`tier-price-${index}`} className="block text-xs text-slate-600">
                Price per unit (Rp)
              </label>
              <input id={`tier-price-${index}`} type="number" min="0" step="any" value={row.unitPrice} onChange={(e) => updateTier(index, "unitPrice", e.target.value)} className={`${inputClass} w-40`} />
            </div>
            <button type="button" onClick={() => update("tiers", values.tiers.filter((_, position) => position !== index))} className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Remove
            </button>
          </div>
        ))}
        {errors.tiers && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {errors.tiers}
          </p>
        )}
        <button type="button" onClick={() => update("tiers", [...values.tiers, { minQty: "", unitPrice: "" }])} className={secondaryButton}>
          Add price tier
        </button>
      </fieldset>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={primaryButton}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}