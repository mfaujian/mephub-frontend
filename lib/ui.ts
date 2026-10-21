/** Tailwind classes for a primary action button that can be disabled (for example "Add to cart" when out of stock). */
export function getButtonClasses(enabled: boolean): string {
    return enabled
        ? "rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand/40"
        : "rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed";
}

export const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-slate-100";

export const primaryButton =
    "rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500";

export const secondaryButton =
    "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:text-slate-300";

export const dangerButton =
    "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:bg-red-300";