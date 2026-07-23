import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { maskAccountNumber } from "@/lib/utils";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferForm } from "@/components/transfer/transfer-form";

const METHODS: Record<
  string,
  { title: string; description: string; kind: "bank" | "wallet" }
> = {
  local: { title: "Local Transfer", description: "Send money to another bank account in the same country.", kind: "bank" },
  wire: { title: "Wire Transfer", description: "Send a bank wire to a recipient — domestic or international.", kind: "bank" },
  international: { title: "International Transfer", description: "Cross-border bank transfer with SWIFT settlement.", kind: "bank" },
  internal: { title: "Internal Transfer", description: "Send instantly to another Strata account.", kind: "bank" },
  paypal: { title: "PayPal Transfer", description: "Send funds to a PayPal recipient by email.", kind: "wallet" },
  skrill: { title: "Skrill Transfer", description: "Send to a Skrill wallet by email.", kind: "wallet" },
  "google-pay": { title: "Google Pay", description: "Send to a Google Pay contact by phone or email.", kind: "wallet" },
  "western-union": { title: "Western Union", description: "Send funds for cash pickup at a Western Union location.", kind: "wallet" },
  wise: { title: "Wise Transfer", description: "Low-fee international transfer via Wise.", kind: "wallet" },
  payoneer: { title: "Payoneer", description: "Send to a Payoneer business or freelancer account.", kind: "wallet" },
};

export default async function TransferMethodPage({ params }: { params: { method: string } }) {
  const meta = METHODS[params.method];
  if (!meta) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sidebarUser = await getSidebarUser(session.user.id);
  const unread = await getUnreadNotificationCount(session.user.id);
  const account = await prisma.account.findFirstOrThrow({ where: { userId: session.user.id } });

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-semibold">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Send</CardTitle>
            <CardDescription>
              Sending from {maskAccountNumber(account.accountNumber)}. Available balance:{" "}
              {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(
                Number(account.balance)
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransferForm
              currentBalance={Number(account.balance)}
              currency={account.currency}
              recipientLabel={
                meta.kind === "wallet" ? "Recipient email or wallet ID" : "Recipient account number"
              }
              method={meta.title}
            />
          </CardContent>
        </Card>
      </div>
    </AuthedShell>
  );
}
