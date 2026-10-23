export default function GuardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="h-40 animate-pulse rounded-lg bg-slate-200" />
    </div>
  );
}