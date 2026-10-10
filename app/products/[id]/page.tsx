import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import { getProduct } from "@/lib/api";
import { formatRupiah, parseDescription } from "@/lib/format";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

function parseId(id: string): number | null {
  const number = Number(id);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseId(id);
  const product = productId ? await getProduct(productId) : null;

  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.name} from ${product.seller?.store_name ?? "a RevoShop supplier"}, ${formatRupiah(product.price)}.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const productId = parseId(id);
  if (!productId) notFound();

  const product = await getProduct(productId);
  if (!product) notFound();

  const { specs, notes } = parseDescription(product.description);
  const inStock = product.stock > 0;

  return (
    <div className="space-y-4">
      <Link href="/products" className="text-sm font-medium text-brand hover:underline">
        &larr; Back to products
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="overflow-hidden self-start">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={600}
              height={600}
              unoptimized
              priority
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-400">
              No image
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {product.category && (
              <Link
                href={`/products?category=${product.category.id}`}
                className="rounded-full bg-slate-100 px-3 py-0.5 text-slate-700 hover:bg-slate-200"
              >
                {product.category.name}
              </Link>
            )}
            <span
              className={`rounded-full px-3 py-0.5 font-medium ${
                inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {inStock ? `${product.stock.toLocaleString("id-ID")} in stock` : "Out of stock"}
            </span>
          </div>

          <h1 className="text-2xl font-bold leading-snug text-slate-900">{product.name}</h1>
          <p className="text-3xl font-bold text-brand">{formatRupiah(product.price)}</p>

          {product.seller && (
            <p className="text-sm text-slate-600">
              Supplier: <span className="font-medium text-slate-900">{product.seller.store_name}</span>
            </p>
          )}

          {notes.map((note) => (
            <p key={note} className="text-slate-700">
              {note}
            </p>
          ))}

          {specs.length > 0 && (
            <Card className="overflow-hidden">
              <h2 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                Specifications
              </h2>
              <dl className="divide-y divide-slate-100 text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-3 gap-2 px-4 py-2">
                    <dt className="text-slate-500">{spec.label}</dt>
                    <dd className="col-span-2 font-medium text-slate-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
