"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Products", exact: true },
  { href: "/dashboard/categories", label: "Categories", exact: false },
  { href: "/dashboard/orders", label: "Orders", exact: false },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard navigation" className="flex gap-2 md:flex-col">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}