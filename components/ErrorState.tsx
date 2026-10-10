interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We could not load this page. Please check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-lg font-semibold text-red-700">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}
