"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorState from "@/components/ErrorState";
import AddressForm from "@/components/forms/AddressForm";
import Modal from "@/components/Modal";
import { useAsyncData } from "@/hooks/useAsyncData";
import { deleteAddress, fetchAddresses, updateAddress } from "@/lib/api-client";
import { errorMessage } from "@/lib/errors";
import { primaryButton, secondaryButton } from "@/lib/ui";
import type { Address } from "@/types";

export default function AddressesView() {
  const loader = useCallback(() => fetchAddresses(), []);
  const { data, error, reload } = useAsyncData(loader);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  async function makeDefault(address: Address) {
    try {
      await updateAddress(address.id, { is_default: true });
      toast.success(`"${address.label}" is now your default address`);
      reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  }

  if (error && !data) return <ErrorState title="Could not load your addresses" message={error} onRetry={reload} />;
  if (!data) return <div aria-busy="true" className="h-32 animate-pulse rounded-lg bg-slate-200" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => setEditing("new")} className={primaryButton} data-testid="add-address">
          Add address
        </button>
      </div>
      {data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No saved addresses yet. Add your workshop or project sites to check out faster.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((address) => (
            <Card key={address.id} className="space-y-1 p-4 text-sm" >
              <div data-testid="address-card" className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{address.label}</h2>
                  {address.is_default && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Default</span>}
                </div>
                <p>
                  {address.recipient_name} · {address.phone}
                </p>
                <p className="text-slate-600">
                  {address.address_line}, {address.city}, {address.province} {address.postal_code}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" onClick={() => setEditing(address)} className={secondaryButton}>
                    Edit
                  </button>
                  {!address.is_default && (
                    <button type="button" onClick={() => makeDefault(address)} className={secondaryButton}>
                      Make default
                    </button>
                  )}
                  <button type="button" onClick={() => setDeleting(address)} className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add address" : "Edit address"} onClose={() => setEditing(null)}>
          <AddressForm
            initial={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete this address?"
          message={`"${deleting.label}" will be removed from your saved addresses. Past orders keep their delivery address.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await deleteAddress(deleting.id);
            setDeleting(null);
            toast.success("Address deleted");
            reload();
          }}
        />
      )}
    </div>
  );
}