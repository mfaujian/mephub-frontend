"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FormError, TextAreaField, TextField } from "@/components/forms/Fields";
import { createAddress, updateAddress } from "@/lib/api-client";
import { errorMessage } from "@/lib/errors";
import { primaryButton, secondaryButton } from "@/lib/ui";
import { emptyAddress, validateAddress, type AddressValues, type FieldErrors } from "@/lib/validation";
import type { Address } from "@/types";

interface AddressFormProps {
  /** Pass an address to edit it; leave empty to create a new one. */
  initial?: Address;
  onSaved: (address: Address) => void;
  onCancel?: () => void;
}

export default function AddressForm({ initial, onSaved, onCancel }: AddressFormProps) {
  const [values, setValues] = useState<AddressValues>(
    initial
      ? {
          label: initial.label,
          recipient_name: initial.recipient_name,
          phone: initial.phone,
          address_line: initial.address_line,
          city: initial.city,
          province: initial.province,
          postal_code: initial.postal_code,
        }
      : emptyAddress,
  );
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false);
  const [errors, setErrors] = useState<FieldErrors<keyof AddressValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof AddressValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    setFormError(null);
    const found = validateAddress(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const trimmed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as AddressValues;
      const saved = initial
        ? await updateAddress(initial.id, { ...trimmed, is_default: isDefault })
        : await createAddress({ ...trimmed, is_default: isDefault });
      toast.success(initial ? "Address updated" : "Address saved");
      onSaved(saved);
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3" data-testid="address-form">
      <FormError message={formError} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField id="label" label="Label" placeholder="Workshop, Site A..." value={values.label} onChange={(e) => update("label", e.target.value)} error={errors.label} required />
        <TextField id="recipient_name" label="Recipient name" value={values.recipient_name} onChange={(e) => update("recipient_name", e.target.value)} error={errors.recipient_name} required />
        <TextField id="phone" label="Phone" type="tel" value={values.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} required />
        <TextField id="postal_code" label="Postal code" inputMode="numeric" value={values.postal_code} onChange={(e) => update("postal_code", e.target.value)} error={errors.postal_code} required />
      </div>
      <TextAreaField id="address_line" label="Street address" rows={2} value={values.address_line} onChange={(e) => update("address_line", e.target.value)} error={errors.address_line} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField id="city" label="City" value={values.city} onChange={(e) => update("city", e.target.value)} error={errors.city} required />
        <TextField id="province" label="Province" value={values.province} onChange={(e) => update("province", e.target.value)} error={errors.province} required />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
        Use as my default address
      </label>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className={primaryButton}>
          {submitting ? "Saving..." : initial ? "Save changes" : "Save address"}
        </button>
      </div>
    </form>
  );
}