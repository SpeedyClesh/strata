"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutAllButton() {
  return (
    <Button
      variant="outline"
      className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-4 w-4" /> Logout
    </Button>
  );
}
