import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCatalogCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: { absolute: "MEPhub Industrial | Industrial & Manufacturing Supplies" },
};

export default async function HomePage() {
  const [latest, categories] = await Promise.all([
    getProducts({ limit: 5 }),
    getCatalogCategories(),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-xl bg-brand px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          B2B marketplace
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          Industrial and manufacturing supplies, sourced in one place
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Electrical, mechanical, pneumatic, safety and tooling products from multiple suppliers.
          Compare part numbers and specs, check stock, and order in the quantities your plant needs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-slate-900 hover:brightness-95"
          >
            Browse {latest.meta.total_items} products
          </Link>
          <Link
            href="/categories"
            className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
          >
            Shop by category
          </Link>
        </div>
      </section>

      <section aria-labelledby="latest-heading">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="latest-heading" className="text-xl font-bold text-brand">
            Latest products
          </h2>
          <Link href="/products" className="text-sm font-medium text-brand hover:underline">
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {latest.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-4 text-xl font-bold text-brand">
          Shop by category
        </h2>
        <ul className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.id}`}
                className="inline-block rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-700 hover:border-brand hover:text-brand"
              >
                {category.name}{" "}
                <span className="text-slate-400">({category.productCount})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
