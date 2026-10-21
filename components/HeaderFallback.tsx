/** Shown for a split second while the real Header (which reads the URL) is being prepared. */
export default function HeaderFallback() {
  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3 font-bold tracking-tight">
        <span className="mr-2 inline-block h-6 w-6 rounded bg-accent" aria-hidden="true" />
        MEPhub <span className="ml-1 font-normal text-slate-300">Industrial</span>
      </div>
    </header>
  );
}