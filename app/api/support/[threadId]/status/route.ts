import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { SupportStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { threadId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const status = String(body?.status ?? "").toUpperCase() as SupportStatus;
  if (status !== "OPEN" && status !== "RESOLVED") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.supportThread.update({
    where: { id: params.threadId },
    data: { status },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
