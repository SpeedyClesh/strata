import type { ReactNode } from "react";

import { Sidebar, type SidebarUser } from "@/components/authed/sidebar";
import { Topbar } from "@/components/authed/topbar";

export function AuthedShell({
  user,
  unreadCount,
  children,
}: {
  user: SidebarUser;
  unreadCount: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-secondary/30">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={user.name}
          userEmail={user.email}
          accountType={user.accountType}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-x-hidden px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
