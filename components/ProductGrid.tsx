"use client";

import { useState } from "react";
import AddProductForm from "@/components/AddProductForm";
import CartSummary from "@/components/CartSummary";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { useCart } from "@/hooks/useCart";
import type { CategoryOption, Product } from "@/types";

interface ProductGridProps {
  initialProducts: Product[];
  categories: CategoryOption[];
}

export default function ProductGrid({ initialProducts, categories }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const { cart, add, remove, clear, itemCount, total } = useCart();

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const handleAddProduct = (product: Product) =>
    setProducts((previous) => [product, ...previous]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="space-y-4 lg:col-span-3">
        <SearchBar value={query} onChange={setQuery} />

        {visibleProducts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No products match &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={add} />
            ))}
          </div>
        )}
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
