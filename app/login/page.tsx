import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "@/components/Card";
import LoginForm from "@/components/forms/LoginForm";
import PublicOnlyRoute from "@/components/guards/PublicOnlyRoute";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-brand">Log in</h1>
        <p className="mt-1 text-sm text-slate-600">Log in to order, track your orders and manage your delivery addresses.</p>
      </div>
      <Card className="p-6">
        <PublicOnlyRoute>
          {/* LoginForm reads ?next= from the URL, which must sit inside Suspense */}
          <Suspense fallback={<div className="h-48 animate-pulse rounded bg-slate-100" />}>
            <LoginForm />
          </Suspense>
        </PublicOnlyRoute>
      </Card>
    </div>
  );
}