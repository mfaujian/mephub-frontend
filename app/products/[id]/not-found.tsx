import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
      <p className="mt-1 text-slate-600">
        This product does not exist or is no longer available.
      </p>
      <Link
        href="/products"
        className="mt-5 inline-block rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light"
      >
        Browse all products
      </Link>
    </div>
  );
}
