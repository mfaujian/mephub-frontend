import Link from "next/link";
import type { ReactNode } from "react";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 text-sm">
        <p className="text-slate-500">
          Catalog <span aria-hidden="true">/</span>{" "}
          <Link href="/products" className="font-medium text-brand hover:underline">
            All products
          </Link>
        </p>
        <p className="text-slate-500">Industrial and manufacturing supplies from verified suppliers</p>
      </div>
      {children}
    </div>
  );
}
