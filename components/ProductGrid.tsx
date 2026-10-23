import type { ReactNode } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  toolbar?: ReactNode;
  pagination?: ReactNode;
}

export default function ProductGrid({ products, toolbar, pagination }: ProductGridProps) {
  return (
    <div className="space-y-4">
      {/* Wrapped in its own div: in development React mistakes a server-rendered element that
          sits directly beside other children for a list item without a key and warns. */}
      <div>{toolbar}</div>
      {products.length === 0 ? (
        <p data-testid="no-products" className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No products found. Try a different search or filter.
        </p>
      ) : (
        <div data-testid="product-grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {pagination}
    </div>
  );
}