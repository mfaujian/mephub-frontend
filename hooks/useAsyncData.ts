"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { errorMessage } from "@/lib/errors";

interface Result<T> {
  source: object;
  data?: T;
  error?: string;
}

/**
 * Run an async `loader` when the component appears and again whenever `loader` changes (wrap it in useCallback).
 * While a new request is running, the previous data stays on screen so tables do not flash.
 */
export function useAsyncData<T>(loader: () => Promise<T>) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  // a fresh object for every load: lets us tell "this answer belongs to the current request" from an old one
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const source = useMemo(() => ({}), [loader, reloadCount]);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => {
        if (!cancelled) setResult({ source, data });
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ source, error: errorMessage(error, "Could not load data.") });
      });
    return () => {
      cancelled = true;
    };
  }, [loader, source]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const settled = result?.source === source;
  return {
    data: result?.data ?? null,
    error: settled ? (result?.error ?? null) : null,
    loading: !settled,
    reload,
  };
}