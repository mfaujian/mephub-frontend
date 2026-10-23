"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FormError, SelectField, TextField } from "@/components/forms/Fields";
import { createCategory } from "@/lib/api-client";
import { errorMessage } from "@/lib/errors";
import { primaryButton } from "@/lib/ui";
import { validateCategory, type CategoryValues, type FieldErrors } from "@/lib/validation";
import type { CategoryOption } from "@/types";

interface CreateCategoryFormProps {
  /** Top-level categories a new category can be placed under. */
  parents: CategoryOption[];
  onCreated: () => void;
}

const emptyValues: CategoryValues = { name: "", description: "", parentId: "" };

export default function CreateCategoryForm({ parents, onCreated }: CreateCategoryFormProps) {
  const [values, setValues] = useState<CategoryValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<keyof CategoryValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof CategoryValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateCategory(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const category = await createCategory({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        parent_id: values.parentId ? Number(values.parentId) : undefined,
      });
      toast.success(`Category "${category.name}" created`);
      setValues(emptyValues);
      onCreated();
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3" data-testid="create-category-form">
      <FormError message={formError} />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField id="category-name" label="Category name" value={values.name} onChange={(e) => update("name", e.target.value)} error={errors.name} required />
        <TextField id="category-description" label="Description (optional)" value={values.description} onChange={(e) => update("description", e.target.value)} />
        <SelectField id="category-parent" label="Place under" value={values.parentId} onChange={(e) => update("parentId", e.target.value)}>
          <option value="">Top-level category</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </SelectField>
      </div>
      <button type="submit" disabled={submitting} className={primaryButton}>
        {submitting ? "Creating..." : "Create category"}
      </button>
    </form>
  );
}