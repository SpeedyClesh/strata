import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { cardId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const card = await prisma.card.findUnique({
    where: { id: params.cardId },
    include: { account: true },
  });
  if (!card || card.account.userId !== session.user.id) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }
  if (card.status === "PENDING") {
    return NextResponse.json({ error: "Card is pending activation." }, { status: 400 });
  }

  const next = card.status === "FROZEN" ? "ACTIVE" : "FROZEN";
  const updated = await prisma.card.update({
    where: { id: card.id },
    data: { status: next },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
