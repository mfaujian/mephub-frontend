"use client";

import { useEffect } from "react";
import ErrorState from "@/components/ErrorState";

export default function OrdersError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="We couldn't load your orders"
      message="The order service did not respond. Please try again in a moment."
      onRetry={retry}
    />
  );
}
