import type { Metadata } from "next";
import CategoriesManager from "@/components/CategoriesManager";

export const metadata: Metadata = {
  title: "Dashboard: categories",
};

export default function DashboardCategoriesPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-brand">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">Organise the catalog. A category with products or subcategories cannot be deleted.</p>
      </div>
      <CategoriesManager />
    </>
  );
}