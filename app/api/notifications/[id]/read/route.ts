import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const n = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!n || n.userId !== session.user.id) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.notification.update({ where: { id: n.id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
