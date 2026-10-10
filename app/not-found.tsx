import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-1 text-slate-600">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light"
      >
        Back to home
      </Link>
    </div>
  );
}
