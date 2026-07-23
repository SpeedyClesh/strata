import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const users = await prisma.user.findMany({
    where: { role: "USER", email: { not: "system@internal.strata.sim" } },
    orderBy: { createdAt: "asc" },
    include: {
      accounts: true,
      _count: { select: { supportThreads: true } },
    },
  });
  const openTickets = await prisma.supportThread.count({ where: { status: "OPEN" } });

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader userName={session.user.name ?? "Admin"} openTickets={openTickets} />
      <main className="container flex-1 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Click a user to view details, adjust balances, or send a message.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All customers</CardTitle>
            <CardDescription>{users.length} simulated customer accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Account #</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const acct = u.accounts[0];
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="font-mono text-xs">{acct?.accountNumber ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {acct ? formatCurrency(Number(acct.balance), acct.currency) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Manage <ArrowRight className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
