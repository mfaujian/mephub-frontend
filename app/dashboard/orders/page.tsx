import type { Metadata } from "next";
import AdminOrdersView from "@/components/AdminOrdersView";

export const metadata: Metadata = {
  title: "Dashboard: orders",
};

export default function DashboardOrdersPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-brand">All orders</h1>
        <p className="mt-1 text-sm text-slate-600">Read-only overview of every order across all buyers and suppliers.</p>
      </div>
      <AdminOrdersView />
    </>
  );
}