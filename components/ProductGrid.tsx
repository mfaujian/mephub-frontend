"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import AddProductForm from "@/components/AddProductForm";
import CartSummary from "@/components/CartSummary";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import type { CategoryOption, Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  categories: CategoryOption[];
  searchText?: string;
  toolbar?: ReactNode;
  pagination?: ReactNode;
}

export default function ProductGrid({
  products,
  categories,
  searchText = "",
  toolbar,
  pagination,
}: ProductGridProps) {
  const [drafts, setDrafts] = useState<Product[]>([]);
  const { cart, add, remove, clear, itemCount, total } = useCart();

  const handleAddProduct = (product: Product) =>
    setDrafts((previous) => [product, ...previous]);

  const needle = searchText.trim().toLowerCase();
  const visibleDrafts = drafts.filter((draft) => draft.name.toLowerCase().includes(needle));
  const allProducts = [...visibleDrafts, ...products];

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="space-y-4 lg:col-span-3">
        {/* Wrapped in its own div: in development React mistakes a server-rendered element that
            sits directly beside other children for a list item without a key and warns. */}
        <div>{toolbar}</div>

        {allProducts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No products found. Try a different search or category.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={add} />
            ))}
          </div>
        )}

        {pagination}
      </div>

      <div className="space-y-4">
        <CartSummary
          cart={cart}
          itemCount={itemCount}
          total={total}
          onRemove={remove}
          onClear={clear}
        />
        <AddProductForm categories={categories} onAddProduct={handleAddProduct} />
      </div>
    </div>
  );
}
