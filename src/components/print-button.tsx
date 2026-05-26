"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button type="button" className="rounded-xl print:hidden" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
