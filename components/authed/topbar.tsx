"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, ChevronDown, KeyRound, LogOut, Receipt, Settings, ShieldCheck, Headphones, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Topbar({
  userName,
  userEmail,
  accountType,
  unreadCount = 0,
  avatarUrl,
  onMenuClick,
}: {
  userName: string;
  userEmail: string;
  accountType: string;
  unreadCount?: number;
  avatarUrl?: string | null;
  onMenuClick?: () => void;
}) {
  const initials = userName.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-input transition-colors hover:bg-secondary lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-strata-green text-primary-foreground">
              <StrataMark />
            </span>
            <span className="font-serif text-lg font-semibold">Strata</span>
          </Link>
        </div>
        <div className="hidden lg:block">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-strata-green text-primary-foreground">
              <StrataMark />
            </span>
            <span className="font-serif text-lg font-semibold text-strata-green">Strata</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-input transition-colors hover:bg-secondary"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="inline-flex items-center gap-2 rounded-full border border-input py-1.5 pl-1.5 pr-3 transition-colors hover:bg-secondary/60">
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-strata-green text-primary-foreground">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold">{initials}</span>
                  )}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-medium leading-tight">{userName}</p>
                  <p className="text-[10px] text-muted-foreground">{accountType}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className={cn(
                  "z-50 w-72 overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-card"
                )}
              >
                <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-strata-green text-primary-foreground">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">{initials}</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                    <span className="mt-1 inline-flex rounded-md bg-background px-2 py-0.5 text-[10px]">{accountType}</span>
                  </div>
                </div>

                <div className="my-2 h-px bg-border" />

                <MenuItem href="/profile" icon={Settings} title="Account Settings" subtitle="Manage your profile" />
                <MenuItem href="/profile#security" icon={ShieldCheck} title="Security & PIN" subtitle="Update your PIN" />
                <MenuItem href="/transactions" icon={Receipt} title="Transaction History" subtitle="View all activities" />
                <MenuItem href="/support" icon={Headphones} title="Support Center" subtitle="Get help" />
                <MenuItem
                  href="/profile#security"
                  icon={KeyRound}
                  title="Change PIN"
                  subtitle="Set a new PIN"
                />
                <div className="my-2 h-px bg-border" />
                <DropdownMenu.Item asChild>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-sm text-destructive outline-none hover:bg-destructive/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium">Log Out</p>
                      <p className="text-xs text-destructive/70">Sign out of your account</p>
                    </div>
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ href, icon: Icon, title, subtitle }: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        className="flex items-start gap-3 rounded-xl px-3 py-2 text-sm outline-none hover:bg-secondary/60"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-strata-green-soft text-strata-green">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-medium leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </Link>
    </DropdownMenu.Item>
  );
}

function StrataMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
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
