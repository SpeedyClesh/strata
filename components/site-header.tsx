import Link from "next/link";
import { CloudCog } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CloudCog className="h-4 w-4" />
          </span>
          <span>Strata</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
