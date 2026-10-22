"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorState from "@/components/ErrorState";
import CreateCategoryForm from "@/components/forms/CreateCategoryForm";
import EditCategoryForm from "@/components/forms/EditCategoryForm";
import Modal from "@/components/Modal";
import { useAsyncData } from "@/hooks/useAsyncData";
import { deleteCategory, fetchCategories } from "@/lib/api-client";
import { errorMessage } from "@/lib/errors";
import { secondaryButton } from "@/lib/ui";
import type { Category } from "@/types";

interface Row {
  category: Category;
  depth: number;
}

function flatten(categories: Category[]): Row[] {
  return categories.flatMap((category) => [
    { category, depth: 0 },
    ...category.subcategories.map((child) => ({ category: child, depth: 1 })),
  ]);
}

export default function CategoriesManager() {
  const loader = useCallback(() => fetchCategories(), []);
  const { data, error, reload } = useAsyncData(loader);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  if (error && !data) return <ErrorState title="Could not load categories" message={error} onRetry={reload} />;
  if (!data) return <div aria-busy="true" className="h-64 animate-pulse rounded-lg bg-slate-200" />;

  const rows = flatten(data);

  return (
    <div className="space-y-6">
      <Card className="space-y-3 p-5">
        <h2 className="font-semibold text-slate-900">Add a category</h2>
        <CreateCategoryForm parents={data.map((category) => ({ id: category.id, name: category.name }))} onCreated={reload} />
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm" data-testid="categories-table">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ category, depth }) => (
              <tr key={category.id} data-testid="category-row">
                <td className={`px-4 py-3 ${depth === 0 ? "font-semibold text-slate-900" : "pl-10 text-slate-700"}`}>
                  {depth > 0 && <span aria-hidden="true">↳ </span>}
                  {category.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{category.description ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" aria-label={`Edit ${category.name}`} onClick={() => setEditing(category)} className={secondaryButton}>
                      Edit
                    </button>
                    <button
                      type="button"
                      data-testid="delete-category"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => setDeleting(category)}
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

      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <EditCategoryForm
            category={editing}
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
          title="Delete this category?"
          message={`"${deleting.name}" will be removed. A category that still has products or subcategories cannot be deleted.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await deleteCategory(deleting.id);
            } catch (caught) {
              toast.error(errorMessage(caught));
              throw caught;
            }
            toast.success(`Category "${deleting.name}" deleted`);
            setDeleting(null);
            reload();
          }}
        />
      )}
    </div>
  );
}