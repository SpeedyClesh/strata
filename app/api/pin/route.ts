import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const currentPin: string | null = body?.currentPin ?? null;
  const newPin: string = String(body?.newPin ?? "");
  if (newPin.length < 4 || newPin.length > 8 || !/^\d+$/.test(newPin)) {
    return NextResponse.json({ error: "PIN must be 4–8 digits." }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (user.pinHash) {
    if (!currentPin) return NextResponse.json({ error: "Current PIN required." }, { status: 400 });
    const ok = await bcrypt.compare(currentPin, user.pinHash);
    if (!ok) return NextResponse.json({ error: "Current PIN is incorrect." }, { status: 400 });
  }

  const pinHash = await bcrypt.hash(newPin, 10);
  await prisma.user.update({ where: { id: user.id }, data: { pinHash } });
  return NextResponse.json({ ok: true });
}
