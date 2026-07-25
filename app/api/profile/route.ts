import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Max size for an avatar data URL. Client resizes images before upload, but
// this is a hard backstop so no one can push an enormous payload into the DB.
const MAX_AVATAR_BYTES = 1_500_000; // ~1.5MB, comfortably covers a compressed 320x320 JPEG

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (name.length > 120) {
    return NextResponse.json({ error: "Full name is too long." }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";

  let dob: Date | null = null;
  if (typeof body.dob === "string" && body.dob.trim() !== "") {
    const parsed = new Date(body.dob);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Date of birth is invalid." }, { status: 400 });
    }
    if (parsed > new Date()) {
      return NextResponse.json({ error: "Date of birth can't be in the future." }, { status: 400 });
    }
    dob = parsed;
  }

  // avatarUrl: undefined = leave unchanged, null = remove photo, string = new photo
  let avatarUrl: string | null | undefined = undefined;
  if (body.avatarUrl === null) {
    avatarUrl = null;
  } else if (typeof body.avatarUrl === "string" && body.avatarUrl.length > 0) {
    if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(body.avatarUrl)) {
      return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
    }
    if (body.avatarUrl.length > MAX_AVATAR_BYTES) {
      return NextResponse.json({ error: "Image is too large. Try a smaller photo." }, { status: 400 });
    }
    avatarUrl = body.avatarUrl;
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone || null,
      country: country || null,
      city: city || null,
      dob,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
    select: {
      name: true,
      phone: true,
      country: true,
      city: true,
      dob: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ ok: true, user });
}
