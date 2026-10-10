"use client";

interface QuantityCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** A controlled + / - counter. The parent owns the number. */
export default function QuantityCounter({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityCounterProps) {
  const buttonClass =
    "px-3 py-1 text-lg leading-none text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent";

  return (
    <div
      className="inline-flex items-center rounded-md border border-slate-300"
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
      >
        &minus;
      </button>
      <span className="min-w-8 px-2 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
