"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

interface NavItem {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isReady, isAdmin, logout } = useAuth();
  const { lineCount } = useCart();

  const links: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    { href: "/quick-order", label: "Quick order" },
  ];
  if (user) {
    links.push({ href: "/orders", label: "Orders" });
    if (!isAdmin) links.push({ href: "/account/addresses", label: "Addresses" });
  }
  if (isAdmin) links.push({ href: "/dashboard", label: "Dashboard" });

  function handleLogout() {
    logout();
    toast.success("You have been logged out.");
    router.push("/");
  }

  const linkClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 transition-colors ${
      active ? "bg-white/15 font-medium text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="bg-brand text-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="inline-block h-6 w-6 rounded bg-accent" aria-hidden="true" />
          MEPhub <span className="font-normal text-slate-300">Industrial</span>
        </Link>

        <nav aria-label="Main navigation" className="flex flex-wrap gap-1 text-sm">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <Link href="/cart" data-testid="cart-link" aria-label="Shopping cart" className={`relative ${linkClass(isActive(pathname, "/cart"))}`}>
            Cart
            {lineCount > 0 && (
              <span
                data-testid="cart-count"
                className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-slate-900"
              >
                {lineCount}
              </span>
            )}
          </Link>
          {!isReady ? (
            <span aria-hidden="true" className="inline-block h-8 w-36" />
          ) : user ? (
            <>
              <span data-testid="user-name" title={user.email} className="max-w-40 truncate rounded-md bg-white/10 px-3 py-1.5">
                {user.full_name}
                {isAdmin && <span className="ml-2 rounded bg-accent px-1.5 text-xs font-bold text-slate-900">Admin</span>}
              </span>
              <button
                type="button"
                data-testid="logout-button"
                onClick={handleLogout}
                className="rounded-md border border-white/30 px-3 py-1.5 hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass(isActive(pathname, "/login"))}>
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-accent px-3 py-1.5 font-semibold text-slate-900 hover:brightness-95">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}