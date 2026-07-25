"use client";

import * as React from "react";
import type { ReactNode } from "react";

import { Sidebar, type SidebarUser } from "@/components/authed/sidebar";
import { Topbar } from "@/components/authed/topbar";

export function DashboardChrome({
  user,
  unreadCount,
  children,
}: {
  user: SidebarUser;
  unreadCount: number;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <Sidebar user={user} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={user.name}
          userEmail={user.email}
          accountType={user.accountType}
          unreadCount={unreadCount}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setNavOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
