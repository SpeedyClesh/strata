import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { HandCoins } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GRANTS = [
  { title: "Small Business Growth Grant", body: "Up to $25,000 for eligible small businesses.", deadline: "Rolling" },
  { title: "Community Impact Grant", body: "$5,000 – $15,000 for community programs.", deadline: "Quarterly" },
  { title: "Green Energy Grant", body: "For sustainability and energy-efficiency projects.", deadline: "Annual" },
];

export default async function GrantsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
  ]);

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-semibold">Grant Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Apply for one of the grant programs Strata supports.</p>

        <div className="mt-8 grid gap-4">
          {GRANTS.map((g) => (
            <Card key={g.title}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-amber-soft text-strata-amber-deep">
                    <HandCoins className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{g.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">Deadline: {g.deadline}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Apply</Button>
              </CardHeader>
              <CardContent>
                <CardDescription>{g.body}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AuthedShell>
  );
}
