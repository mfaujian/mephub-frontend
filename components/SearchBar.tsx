"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** A controlled input: the parent owns `value`. */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search products by name...",
}: SearchBarProps) {
  return (
    <div className="w-full">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
