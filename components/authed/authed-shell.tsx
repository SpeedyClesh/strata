import type { ReactNode } from "react";

import { DashboardChrome } from "@/components/authed/dashboard-chrome";
import type { SidebarUser } from "@/components/authed/sidebar";

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
    <DashboardChrome user={user} unreadCount={unreadCount}>
      {children}
    </DashboardChrome>
  );
}
