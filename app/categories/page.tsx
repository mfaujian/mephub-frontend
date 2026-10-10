import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/Card";
import { getCatalogCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const categories = await getCatalogCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse the catalog by product family. Every category links to the filtered product list.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} as="section" className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-slate-900">{category.name}</h2>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {category.productCount} products
              </span>
            </div>
            {category.description && (
              <p className="mt-1 text-sm text-slate-600">{category.description}</p>
            )}

            {category.subcategories.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {category.subcategories.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/products?category=${child.id}`}
                      className="text-slate-700 hover:text-brand hover:underline"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={`/products?category=${category.id}`}
              className="mt-auto pt-4 text-sm font-medium text-brand hover:underline"
            >
              View all {category.name} &rarr;
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
