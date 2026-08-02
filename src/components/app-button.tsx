import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const appButtonClass =
  "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-3 py-2 h-auto text-sm font-medium shadow-sm";

export function AppButton({
  className,
  ...props
}: ButtonProps) {
  return <Button className={cn(appButtonClass, className)} {...props} />;
}
