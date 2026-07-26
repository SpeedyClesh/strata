"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { LayoutDashboard, LogOut, LifeBuoy, ShieldCheck, Users, Inbox, Menu, X, UserCheck } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/signups", label: "Pending Signups", icon: UserCheck },
  { href: "/admin/transactions", label: "Transactions", icon: Inbox },
  { href: "/admin/support", label: "Support inbox", icon: LifeBuoy },
];

export function AdminHeader({ userName, openTickets = 0 }: { userName: string; openTickets?: number }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input transition-colors hover:bg-secondary md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/admin" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span>Strata Admin</span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.href === "/admin/support" && openTickets > 0 && (
                  <span className="ml-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground">
                    {openTickets}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.href === "/admin/support" && openTickets > 0 && (
                      <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground">
                        {openTickets}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
