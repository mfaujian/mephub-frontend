import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import Card from "@/components/Card";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  showSupplier?: boolean;
}

function availability(product: Product): { text: string; classes: string } {
  if (product.fulfillment_type === "indent") {
    return { text: `Made to order · ${product.lead_time_days ?? "?"} days`, classes: "bg-indigo-100 text-indigo-700" };
  }
  if (product.stock === 0) return { text: "Out of stock", classes: "bg-red-100 text-red-700" };
  if (product.stock <= 5) return { text: `Only ${product.stock} left`, classes: "bg-amber-100 text-amber-700" };
  return { text: `${product.stock.toLocaleString("id-ID")} in stock`, classes: "bg-green-100 text-green-700" };
}

export default function ProductCard({ product, showSupplier = true }: ProductCardProps) {
  const status = availability(product);
  const bestTier = product.price_tiers.length > 0 ? product.price_tiers[product.price_tiers.length - 1] : null;
  return (
    <Card as="article" className="flex flex-col overflow-hidden" >
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
        <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-sm text-slate-400">No image</div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.classes}`}>{status.text}</span>
          {product.tkdn_percent !== null && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">TKDN {product.tkdn_percent}%</span>
          )}
        </div>
        {(product.brand || product.sku) && (
          <p className="text-xs text-slate-500">
            {product.brand}
            {product.brand && product.sku && " · "}
            {product.sku && <span className="font-mono">{product.sku}</span>}
          </p>
        )}
        <h3 className="font-semibold leading-snug text-slate-900">
          <Link href={`/products/${product.id}`} className="hover:text-brand-light hover:underline">
            {product.name}
          </Link>
        </h3>
        {showSupplier && product.seller && <p className="text-xs text-slate-500">Supplier: {product.seller.store_name}</p>}
        <div className="mt-auto pt-2">
          <p className="text-lg font-bold text-brand">
            {formatRupiah(product.price)} <span className="text-xs font-normal text-slate-500">/ {product.unit}</span>
          </p>
          {bestTier && (
            <p className="text-xs font-medium text-green-700">
              {formatRupiah(bestTier.unit_price)} at {bestTier.min_qty}+ {product.unit}
            </p>
          )}
          {product.min_order_qty > 1 && (
            <p className="text-xs text-slate-500">
              Min. order {product.min_order_qty} {product.unit}
            </p>
          )}
        </div>
        <AddToCartButton product={product} />
      </div>
    </Card>
  );
}