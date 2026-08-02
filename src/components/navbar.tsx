"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, FolderOpen, Hammer } from "lucide-react";
import { AppButton } from "@/components/app-button";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Hammer className="h-6 w-6 text-foreground" />
          <span className="text-xl font-serif font-bold tracking-tight text-foreground">
            BriefForge
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Projetos</span>
          </Link>
          <AppButton asChild>
            <Link href="/projects/new">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Briefing</span>
            </Link>
          </AppButton>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
