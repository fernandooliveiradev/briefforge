"use client";

import dynamic from "next/dynamic";

const SonnerToaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export function ClientToaster() {
  return <SonnerToaster />;
}