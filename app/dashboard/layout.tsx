import { Suspense, type ReactNode } from "react";
import DashboardNav from "@/components/DashboardNav";
import AdminRoute from "@/components/guards/AdminRoute";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRoute>
      <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <aside>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin dashboard</p>
          <Suspense fallback={<div className="h-24 animate-pulse rounded bg-slate-200" />}>
            <DashboardNav />
          </Suspense>
        </aside>
        <div className="min-w-0 space-y-4">{children}</div>
      </div>
    </AdminRoute>
  );
}