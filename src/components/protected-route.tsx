/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: string; // changed: accept any role string
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setRedirectTo(null);
      return;
    }

    if (!isAuthenticated) {
      setRedirectTo("/login");
      return;
    }

    if (requiredRole) {
      const hasRole =
        !!user &&
        ((Array.isArray((user as any).roles) && (user as any).roles.includes(requiredRole)) ||
          (user as any).role === requiredRole);

      if (!hasRole) {
        const isAdmin = Array.isArray((user as any).roles)
          ? (user as any).roles.includes("admin")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (user as any).role === "admin";
        setRedirectTo(isAdmin ? "/admin" : "/dashboard");
        return;
      }
    }

    setRedirectTo(null);
  }, [isLoading, isAuthenticated, user, requiredRole]);

  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (redirectTo) return null;

  return <>{children}</>;
}
