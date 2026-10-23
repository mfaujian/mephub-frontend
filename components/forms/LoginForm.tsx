"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FormError, TextField } from "@/components/forms/Fields";
import { useAuth } from "@/hooks/useAuth";
import { errorMessage } from "@/lib/errors";
import { getPostLoginPath } from "@/lib/format";
import { primaryButton } from "@/lib/ui";
import { validateLogin, type FieldErrors, type LoginValues } from "@/lib/validation";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof LoginValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof LoginValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.full_name}!`);
      // admins land on the dashboard, customers on the home page (or where they were heading)
      router.replace(getPostLoginPath(user.role, searchParams.get("next")));
    } catch (error) {
      const message = errorMessage(error, "Could not log in. Please try again.");
      setFormError(message);
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" data-testid="login-form">
      <FormError message={formError} />
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
        autoComplete="current-password"
        value={values.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
        required
      />
      <button type="submit" disabled={submitting} className={`${primaryButton} w-full`}>
        {submitting ? "Logging in..." : "Log in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        New to MEPhub?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}