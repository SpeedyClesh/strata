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

  const updated = await prisma.card.update({
    where: { id: card.id },
    data: { frozen: !card.frozen },
  });

  return NextResponse.json({ ok: true, frozen: updated.frozen });
}
