"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorState from "@/components/ErrorState";
import CreateProductForm from "@/components/forms/CreateProductForm";
import EditProductForm from "@/components/forms/EditProductForm";
import Modal from "@/components/Modal";
import PagerButtons from "@/components/PagerButtons";
import SearchBar from "@/components/SearchBar";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { deleteProduct, fetchCategories, fetchProducts, fetchStores } from "@/lib/api-client";
import { toCategoryOptions } from "@/lib/categories";
import { errorMessage } from "@/lib/errors";
import { formatRupiah } from "@/lib/format";
import { primaryButton, secondaryButton } from "@/lib/ui";
import type { Product } from "@/types";

export default function ProductsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const listLoader = useCallback(() => fetchProducts({ page, limit: 10, search: debouncedSearch }), [page, debouncedSearch]);
  const { data, error, loading, reload } = useAsyncData(listLoader);
  const lookupLoader = useCallback(async () => {
    const [categories, stores] = await Promise.all([fetchCategories(), fetchStores()]);
    return { categoryOptions: toCategoryOptions(categories), stores };
  }, []);
  const { data: lookups } = useAsyncData(lookupLoader);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-64 flex-1 sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by name, SKU or brand..."
          />
        </div>
        <button type="button" data-testid="add-product" disabled={!lookups} onClick={() => setCreating(true)} className={primaryButton}>
          Add product
        </button>
      </div>

      {error && !data ? (
        <ErrorState title="Could not load products" message={error} onRetry={reload} />
      ) : !data ? (
        <div aria-busy="true" className="h-64 animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <p className="mb-2 text-sm text-slate-600" data-testid="product-count">
            {data.meta.total_items} {data.meta.total_items === 1 ? "product" : "products"}
          </p>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-sm" data-testid="products-table">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No products match your search.
                    </td>
                  </tr>
                )}
                {data.data.map((product) => (
                  <tr key={product.id} data-testid="product-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <Image src={product.image_url} alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded object-cover" />
                        )}
                        <div>
                          <Link href={`/products/${product.id}`} className="font-medium text-slate-900 hover:underline">
                            {product.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {product.brand}
                            {product.brand && product.sku && " · "}
                            <span className="font-mono">{product.sku}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{product.seller?.store_name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(product.price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {product.fulfillment_type === "indent" ? `Indent ${product.lead_time_days}d` : `${product.stock} ${product.unit}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" data-testid="edit-product" aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)} className={secondaryButton}>
                          Edit
                        </button>
                        <button
                          type="button"
                          data-testid="delete-product"
                          aria-label={`Delete ${product.name}`}
                          onClick={() => setDeleting(product)}
                          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <PagerButtons meta={data.meta} onPage={setPage} />
        </div>
      )}

      {creating && lookups && (
        <Modal title="Add product" wide onClose={() => setCreating(false)}>
          <CreateProductForm
            categories={lookups.categoryOptions}
            stores={lookups.stores}
            onCancel={() => setCreating(false)}
            onCreated={() => {
              setCreating(false);
              setSearch("");
              setPage(1);
              reload();
            }}
          />
        </Modal>
      )}
      {editing && lookups && (
        <Modal title={`Edit ${editing.name}`} wide onClose={() => setEditing(null)}>
          <EditProductForm
            product={editing}
            categories={lookups.categoryOptions}
            onCancel={() => setEditing(null)}
            onUpdated={() => {
              setEditing(null);
              reload();
            }}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete this product?"
          message={`"${deleting.name}" will be removed from the catalog. Products that are part of an active order cannot be deleted.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await deleteProduct(deleting.id);
            } catch (caught) {
              toast.error(errorMessage(caught));
              throw caught; // keeps the dialog open and shows the reason inside it
            }
            toast.success(`"${deleting.name}" was deleted`);
            setDeleting(null);
            reload();
          }}
        />
      )}
    </div>
  );
}