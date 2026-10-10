import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return <h1 className="text-2xl font-bold text-brand">Categories</h1>;
}
