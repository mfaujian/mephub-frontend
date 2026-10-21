"use client";

import { useEffect, useId, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ title, onClose, children, wide = false }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`my-8 w-full rounded-lg bg-white p-6 shadow-xl ${wide ? "max-w-3xl" : "max-w-lg"}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-bold text-brand">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}