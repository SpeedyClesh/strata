import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatAccountType } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SignupReviewActions } from "@/components/admin/signup-review-actions";

export default async function AdminSignupsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [pending, openTickets] = await Promise.all([
    prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.supportThread.count({ where: { status: "OPEN" } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader userName={session.user.name ?? "Admin"} openTickets={openTickets} />
      <main className="container flex-1 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Pending Signups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review new account applications. Approving creates their bank account; rejecting blocks their login.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Awaiting review</CardTitle>
            <CardDescription>{pending.length} application{pending.length === 1 ? "" : "s"} pending.</CardDescription>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No pending applications right now.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Requested type</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone ?? "—"}</TableCell>
                      <TableCell>{u.country ?? "—"}</TableCell>
                      <TableCell>{formatAccountType(u.requestedAccountType ?? "SAVINGS")}</TableCell>
                      <TableCell>{u.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <SignupReviewActions userId={u.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
