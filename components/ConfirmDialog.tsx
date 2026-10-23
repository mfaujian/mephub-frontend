"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { errorMessage } from "@/lib/errors";
import { dangerButton, secondaryButton } from "@/lib/ui";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Throw (or reject) to keep the dialog open and show the error inside it. */
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-700">{message}</p>
      {error && (
        <div
          role="alert"
          data-testid="confirm-error"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button type="button" onClick={handleConfirm} disabled={busy} className={dangerButton}>
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}