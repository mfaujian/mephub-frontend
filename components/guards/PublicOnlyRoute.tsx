"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import GuardSkeleton from "@/components/guards/GuardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { getPostLoginPath } from "@/lib/format";

/** Login and register pages: a user who is already logged in is sent to their home page instead. */
export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && user) {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(getPostLoginPath(user.role, next));
    }
  }, [isReady, user, router]);

  if (!isReady || user) return <GuardSkeleton />;
  return <>{children}</>;
}