"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FormError, TextField } from "@/components/forms/Fields";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, errorMessage } from "@/lib/errors";
import { primaryButton } from "@/lib/ui";
import { validateRegister, type FieldErrors, type RegisterValues } from "@/lib/validation";

const emptyValues: RegisterValues = { fullName: "", email: "", password: "", confirmPassword: "" };

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<keyof RegisterValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof RegisterValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const user = await register({ full_name: values.fullName, email: values.email, password: values.password });
      toast.success(`Welcome to MEPhub, ${user.full_name}!`);
      router.replace("/");
    } catch (error) {
      // the API answers 409 when the email is already registered
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ email: "An account with this email already exists." });
      } else {
        setFormError(errorMessage(error, "Could not create your account. Please try again."));
      }
      toast.error(errorMessage(error, "Could not create your account."));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" data-testid="register-form">
      <FormError message={formError} />
      <TextField
        id="fullName"
        label="Full name"
        autoComplete="name"
        value={values.fullName}
        onChange={(event) => update("fullName", event.target.value)}
        error={errors.fullName}
        required
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={(event) => update("email", event.target.value)}
        error={errors.email}
        required
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 6 characters, with a letter and a number."
        value={values.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
        required
      />
      <TextField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(event) => update("confirmPassword", event.target.value)}
        error={errors.confirmPassword}
        required
      />
      <button type="submit" disabled={submitting} className={`${primaryButton} w-full`}>
        {submitting ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}