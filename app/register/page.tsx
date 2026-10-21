import type { Metadata } from "next";
import Card from "@/components/Card";
import RegisterForm from "@/components/forms/RegisterForm";
import PublicOnlyRoute from "@/components/guards/PublicOnlyRoute";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-brand">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">One account for personal purchases and company orders.</p>
      </div>
      <Card className="p-6">
        <PublicOnlyRoute>
          <RegisterForm />
        </PublicOnlyRoute>
      </Card>
    </div>
  );
}