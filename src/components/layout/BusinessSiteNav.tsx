"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * Sprint 5D-3: Header and Footer are now async Server Components.
 * They cannot be directly imported by a Client Component (would break server-only).
 * Solution: receive them as React.ReactNode props from the server-side layout.
 * BottomNav is a Client Component and can still be directly imported.
 */
export function BusinessSiteNav({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header:   React.ReactNode;
  footer:   React.ReactNode;
}) {
  const pathname  = usePathname();
  const isFactory = pathname.startsWith("/factory");

  if (isFactory) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="pb-20 sm:pb-0">{children}</main>
      {footer}
      <BottomNav />
    </>
  );
}
