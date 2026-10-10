"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Card from "@/components/Card";
import QuantityCounter from "@/components/QuantityCounter";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  /** When provided, the card shows a quantity counter and an "Add to cart" button. */
  onAddToCart?: (product: Product, quantity: number) => void;
  showQuantity?: boolean;
  showSupplier?: boolean;
}

function stockLabel(stock: number): { text: string; classes: string } {
  if (stock === 0) {
    return { text: "Out of stock", classes: "bg-red-100 text-red-700" };
  }
  if (stock <= 5) {
    return { text: `Only ${stock} left`, classes: "bg-amber-100 text-amber-700" };
  }
  return {
    text: `${stock.toLocaleString("id-ID")} in stock`,
    classes: "bg-green-100 text-green-700",
  };
}

export default function ProductCard({
  product,
  onAddToCart,
  showQuantity = true,
  showSupplier = true,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const inStock = product.stock > 0;
  const stock = stockLabel(product.stock);

  return (
    <Card as="article" className="flex flex-col overflow-hidden">
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          width={400}
          height={400}
          unoptimized
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
          No image
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stock.classes}`}>
            {stock.text}
          </span>
          {product.category && (
            <span className="text-right text-xs text-slate-500">{product.category.name}</span>
          )}
        </div>

        <h3 className="font-semibold leading-snug text-slate-900">
          {product.isDraft ? (
            product.name
          ) : (
            <Link href={`/products/${product.id}`} className="hover:text-brand-light hover:underline">
              {product.name}
            </Link>
          )}
        </h3>

        {showSupplier && product.seller && (
          <p className="text-xs text-slate-500">Supplier: {product.seller.store_name}</p>
        )}
        {product.isDraft && (
          <p className="text-xs font-medium text-amber-700">Draft: exists only in this browser tab</p>
        )}

        <p className="mt-auto pt-2 text-lg font-bold text-brand">{formatRupiah(product.price)}</p>

        {inStock && onAddToCart && showQuantity && (
          <QuantityCounter value={quantity} onChange={setQuantity} min={1} max={product.stock} />
        )}

        {!inStock ? (
          <button
            type="button"
            disabled
            className="rounded-md bg-slate-200 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
          >
            Out of stock
          </button>
        ) : onAddToCart ? (
          <button
            type="button"
            onClick={() => onAddToCart(product, quantity)}
            className="rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-light"
          >
            Add to cart
          </button>
        ) : (
          <Link
            href={`/products/${product.id}`}
            className="rounded-md bg-brand py-2 text-center text-sm font-medium text-white hover:bg-brand-light"
          >
            View details
          </Link>
        )}
      </div>
    </Card>
  );
}
