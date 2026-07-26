import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type PinCheckResult = { ok: true } | { ok: false; error: string; status: number };

/**
 * Verifies a transaction PIN against the signed-in user's stored pinHash.
 * Use this at the top of any route that moves money before doing the
 * actual transaction logic.
 */
export async function verifyPin(userId: string, pin: unknown): Promise<PinCheckResult> {
  if (typeof pin !== "string" || !/^\d{4,8}$/.test(pin)) {
    return { ok: false, error: "Enter your 4–8 digit PIN to confirm.", status: 400 };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinHash: true },
  });

  if (!user?.pinHash) {
    return {
      ok: false,
      error: "You haven't set a transaction PIN yet. Set one in Profile → Change PIN first.",
      status: 400,
    };
  }

  const valid = await bcrypt.compare(pin, user.pinHash);
  if (!valid) {
    return { ok: false, error: "Incorrect PIN.", status: 400 };
  }

  return { ok: true };
}
