"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import GuardSkeleton from "@/components/guards/GuardSkeleton";
import { useAuth } from "@/hooks/useAuth";

/** Only logged-in users may see the children. Everyone else is sent to /login and brought back afterwards. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/login?next=${next}`);
    }
  }, [isReady, user, router]);

  if (!isReady || !user) return <GuardSkeleton />;
  return <>{children}</>;
}