"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, Menu, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-green text-primary-foreground">
            <StrataMark />
          </span>
          <div className="leading-tight">
            <p className="font-serif text-xl font-semibold tracking-tight text-strata-green">Strata</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Trust · Belief · Reliability
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  active ? "text-strata-green" : "text-foreground/80 hover:text-strata-green"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded bg-strata-green" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            asChild
            className="hidden gap-2 rounded-full bg-strata-green px-5 text-primary-foreground hover:bg-strata-green-deep sm:inline-flex"
          >
            <Link href="/login">
              <UserRound className="h-4 w-4" />
              E-Banking
            </Link>
          </Button>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/60 md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary/60"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-2 gap-2 rounded-full bg-strata-green">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <UserRound className="h-4 w-4" />
                E-Banking
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function StrataMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-6 w-6", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4L34 12V22C34 29 27.5 34.5 20 36C12.5 34.5 6 29 6 22V12L20 4Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M20 12C22 16.5 25 19 29 20C25 21 22 23.5 20 28C18 23.5 15 21 11 20C15 19 18 16.5 20 12Z"
        fill="currentColor"
      />
    </svg>
  );
}
