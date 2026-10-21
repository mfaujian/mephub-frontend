"use client";

import { useState } from "react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

/**
 * A number box with - and + buttons. B2B buyers order 50 or 500 units, so typing a number must work too.
 * The typed text is only "committed" (clamped to min/max) when the box loses focus or Enter is pressed.
 */
export default function QuantityInput({ value, onChange, min = 1, max = 100000, label = "Quantity" }: QuantityInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(value);

  function commit(text: string) {
    const parsed = Math.floor(Number(text));
    const next = Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), Math.max(max, min)) : value;
    setDraft(null);
    if (next !== value) onChange(next);
  }

  const stepButton =
    "px-3 py-1.5 text-lg leading-none text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent";

  return (
    <div className="inline-flex items-center rounded-md border border-slate-300 bg-white" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" className={stepButton} disabled={value <= min} onClick={() => commit(String(value - 1))}>
        &minus;
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={shown}
        onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ""))}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit((event.target as HTMLInputElement).value);
          }
        }}
        className="w-16 border-x border-slate-300 py-1.5 text-center text-sm font-medium tabular-nums focus:outline-none"
      />
      <button type="button" aria-label="Increase quantity" className={stepButton} disabled={value >= max} onClick={() => commit(String(value + 1))}>
        +
      </button>
    </div>
  );
}