import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { LoanType } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES: LoanType[] = ["PERSONAL", "AUTOMOBILE", "BUSINESS", "MORTGAGE", "OVERDRAFT", "HEALTH"];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const type = String(body?.type ?? "").toUpperCase() as LoanType;
  const amount = Number(body?.amount);
  const termMonths = Number(body?.termMonths);
  const purpose = String(body?.purpose ?? "").trim();

  if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: "Invalid loan type." }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  if (!Number.isFinite(termMonths) || termMonths <= 0) return NextResponse.json({ error: "Invalid term." }, { status: 400 });
  if (!purpose) return NextResponse.json({ error: "Purpose is required." }, { status: 400 });

  const existing = await prisma.loan.findFirst({
    where: { userId: session.user.id, status: { in: ["PENDING", "APPROVED", "ACTIVE"] } },
  });
  if (existing) return NextResponse.json({ error: "You already have an active loan." }, { status: 400 });

  await prisma.loan.create({
    data: {
      userId: session.user.id,
      type,
      amount,
      termMonths,
      purpose,
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      kind: "INFO",
      title: "Loan application received",
      body: `Your ${type.toLowerCase()} loan application for $${amount.toFixed(2)} is under review.`,
    },
  });

  return NextResponse.json({ ok: true });
}
