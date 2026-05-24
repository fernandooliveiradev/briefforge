"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, FolderOpen, Hammer } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="border-b border-[hsl(38,25%,88%)] bg-[hsl(38,35%,97%)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Hammer className="h-6 w-6 text-[hsl(30,30%,45%)]" />
          <span className="text-xl font-serif font-bold tracking-tight text-[hsl(30,15%,20%)]">
            BriefForge
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-[hsl(38,30%,90%)] text-[hsl(30,25%,15%)]"
                : "text-[hsl(30,15%,35%)] hover:bg-[hsl(38,25%,92%)]"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Projetos</span>
          </Link>
          <Link
            href="/projects/new"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/projects/new"
                ? "bg-[hsl(30,40%,55%)] text-white"
                : "bg-[hsl(30,40%,45%)] text-white hover:bg-[hsl(30,40%,50%)]"
            }`}
          >
            <PenLine className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Briefing</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;