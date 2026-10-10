import Link from "next/link";
import { navLinks } from "@/lib/nav";

export default function Header() {
  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="inline-block h-6 w-6 rounded bg-accent" aria-hidden="true" />
          MEPhub <span className="font-normal text-slate-300">Industrial</span>
        </Link>
        <nav aria-label="Main navigation" className="flex gap-1 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
