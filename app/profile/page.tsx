import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Mail, Phone, MapPin, UserRound, Calendar, Globe, Wallet, Briefcase, ShieldCheck, LogOut } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePinButton } from "@/components/profile/change-pin";
import { PasswordButton } from "@/components/profile/change-password";
import { SignOutAllButton } from "@/components/profile/signout-all";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sidebarUser = await getSidebarUser(session.user.id);
  const unread = await getUnreadNotificationCount(session.user.id);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { accounts: true },
  });
  const account = user.accounts[0];
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-5xl">
        {/* Profile hero */}
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-strata-green to-strata-green-deep text-primary-foreground">
                <span className="font-serif text-2xl">{initials}</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-semibold">{user.name}</h1>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">Savings Account</span>
                </div>
                <p className="text-sm text-muted-foreground">Account #{account?.accountNumber}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                  {user.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {user.phone}</span>}
                  {user.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.country}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <ChangePinButton />
              <PasswordButton />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-strata-green-soft text-strata-green">
                <UserRound className="h-4 w-4" />
              </span>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadRow icon={UserRound} label="Full Name" value={user.name} />
              <ReadRow icon={Calendar} label="Date of Birth" value={user.dob ? user.dob.toDateString() : "—"} />
              <ReadRow icon={Mail} label="Email Address" value={user.email} />
              <ReadRow icon={Phone} label="Phone Number" value={user.phone ?? "—"} />
              <ReadRow icon={Globe} label="Country" value={user.country ?? "—"} />
              <ReadRow icon={MapPin} label="City Address" value={user.city ?? "—"} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6" id="security">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-strata-green-soft text-strata-green">
                <ShieldCheck className="h-4 w-4" />
              </span>
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <SettingsRow
              icon={Wallet}
              title="Currency Preference"
              subtitle="Default transaction currency"
              right={<span className="rounded-md border border-border px-3 py-1 font-mono text-sm">$</span>}
            />
            <SettingsRow
              icon={Briefcase}
              title="Account Type"
              subtitle="Your banking tier"
              right={<span className="rounded-md bg-secondary px-3 py-1 text-sm">Savings Account</span>}
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <LogOut className="h-4 w-4" />
              </span>
              Session Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/5 p-4">
              <div>
                <p className="font-semibold">Logout from all devices</p>
                <p className="text-xs text-muted-foreground">End all active sessions and require re-authentication.</p>
              </div>
              <SignOutAllButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthedShell>
  );
}

function ReadRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function SettingsRow({ icon: Icon, title, subtitle, right }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}
