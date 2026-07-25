import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type GeoResult = {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  flagUrl: string;
};

function extractClientIp(request: Request): string | null {
  // Vercel (and most proxies) set x-forwarded-for as "client, proxy1, proxy2, ..."
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function isPrivateOrLoopback(ip: string): boolean {
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.3")
  );
}

async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const ip = extractClientIp(request);

  if (!ip || isPrivateOrLoopback(ip)) {
    return NextResponse.json(
      { error: "Couldn't determine a public IP for this connection (likely a local/dev environment)." },
      { status: 422 }
    );
  }

  try {
    const res = await fetchWithTimeout(`https://ipwho.is/${encodeURIComponent(ip)}`, 6000);
    const data = await res.json();

    if (!data || data.success === false) {
      throw new Error(data?.message ?? "Lookup failed");
    }

    const result: GeoResult = {
      ip: data.ip ?? ip,
      country: data.country ?? "Unknown",
      countryCode: (data.country_code ?? "").toLowerCase(),
      region: data.region ?? "",
      city: data.city ?? "",
      flagUrl:
        data.flag?.img ??
        (data.country_code ? `https://flagcdn.com/w80/${String(data.country_code).toLowerCase()}.png` : ""),
    };

    return NextResponse.json({ ok: true, location: result });
  } catch {
    return NextResponse.json({ error: "Location lookup is temporarily unavailable." }, { status: 502 });
  }
}
