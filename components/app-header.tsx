"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CloudCog, CreditCard, LayoutDashboard, LifeBuoy, LogOut, Send } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transfer", label: "Transfer", icon: Send },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

export function AppHeader({ userName, unreadCount = 0 }: { userName: string; unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CloudCog className="h-4 w-4" />
          </span>
          <span>Strata</span>
        </Link>

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
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-input transition-colors hover:bg-secondary"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
