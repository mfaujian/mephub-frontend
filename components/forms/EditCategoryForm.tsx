"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FormError, TextField } from "@/components/forms/Fields";
import { updateCategory } from "@/lib/api-client";
import { errorMessage } from "@/lib/errors";
import { primaryButton, secondaryButton } from "@/lib/ui";
import { validateCategory, type CategoryValues, type FieldErrors } from "@/lib/validation";
import type { Category } from "@/types";

interface EditCategoryFormProps {
  category: Category;
  onUpdated: () => void;
  onCancel: () => void;
}

export default function EditCategoryForm({ category, onUpdated, onCancel }: EditCategoryFormProps) {
  const [values, setValues] = useState<CategoryValues>({
    name: category.name,
    description: category.description ?? "",
    parentId: category.parent_id ? String(category.parent_id) : "",
  });
  const [errors, setErrors] = useState<FieldErrors<keyof CategoryValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateCategory(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const updated = await updateCategory(category.id, { name: values.name.trim(), description: values.description.trim() });
      toast.success(`Category "${updated.name}" updated`);
      onUpdated();
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <FormError message={formError} />
      <TextField id="edit-category-name" label="Category name" value={values.name} onChange={(e) => { setValues({ ...values, name: e.target.value }); setErrors({}); }} error={errors.name} required />
      <TextField id="edit-category-description" label="Description" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={primaryButton}>
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}