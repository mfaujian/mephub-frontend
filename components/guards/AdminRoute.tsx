"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import GuardSkeleton from "@/components/guards/GuardSkeleton";
import { useAuth } from "@/hooks/useAuth";

/** Only admins may see the children. Logged-out visitors go to /login, customers go home. */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isReady, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/login?next=${next}`);
    } else if (!isAdmin) {
      toast.error("That page is for administrators only.", { id: "admin-only" });
      router.replace("/");
    }
  }, [isReady, user, isAdmin, router]);

  if (!isReady || !user || !isAdmin) return <GuardSkeleton />;
  return <>{children}</>;
}