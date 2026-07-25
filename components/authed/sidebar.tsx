"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Download,
  Building2,
  Globe,
  ArrowLeftRight,
  Receipt,
  FileText,
  CreditCard,
  LineChart,
  HandCoins,
  Repeat,
  Headphones,
  UserCog,
  LogOut,
  PiggyBank,
  Plus,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deposits", label: "Deposits", icon: Download },
  { href: "/transfer/local", label: "Local Transfer", icon: Building2 },
  { href: "/transfer/international", label: "International Transfer", icon: Globe },
  { href: "/transfer/internal", label: "Internal Transfer", icon: ArrowLeftRight },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/account-statement", label: "Account Statement", icon: FileText },
  { href: "/cards", label: "Virtual Cards", icon: CreditCard },
  { href: "/investments", label: "Investments", icon: LineChart },
  { href: "/grants", label: "Grant Applications", icon: HandCoins },
  { href: "/crypto/swap", label: "Crypto Swap", icon: Repeat },
];

const SETTINGS = [
  { href: "/support", label: "Customer Support", icon: Headphones },
  { href: "/profile", label: "Profile Settings", icon: UserCog },
];

export type SidebarUser = {
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
  currency: string;
  accountType: string;
};

export function Sidebar({
  user,
  open = false,
  onClose,
}: {
  user: SidebarUser;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  // Auto-close the mobile drawer whenever the user navigates to a new page.
  React.useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop — only relevant below the lg breakpoint */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-border/60 bg-card transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:flex lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 p-6 lg:hidden">
          <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-border/60 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-strata-green text-primary-foreground">
            <span className="font-serif text-lg">{user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-secondary-foreground">
              # {user.accountNumber}
            </span>
            <p className="mt-1 text-[11px] text-muted-foreground">{user.accountType}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Available Balance
        </p>
        <p className="mt-1 font-serif text-3xl font-semibold">{formatCurrency(user.balance, user.currency)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button asChild size="sm" className="gap-1 rounded-lg bg-strata-green text-primary-foreground hover:bg-strata-green-deep">
            <Link href="/deposits">
              <Plus className="h-3.5 w-3.5" />
              Deposit
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1 rounded-lg">
            <Link href="/loans">
              <PiggyBank className="h-3.5 w-3.5" />
              Loan
            </Link>
          </Button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        <ul className="space-y-1">
          {MENU.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-strata-green-soft font-medium text-strata-green"
                      : "text-foreground/80 hover:bg-secondary/60"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <ul className="space-y-1">
          {SETTINGS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-strata-green-soft font-medium text-strata-green"
                      : "text-foreground/80 hover:bg-secondary/60"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
    </>
  );
}
