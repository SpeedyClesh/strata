"use client";

import * as React from "react";
import { MapPinned, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Location = {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  flagUrl: string;
};

type Status = "loading" | "ready" | "error";

export function LocationCard() {
  const [status, setStatus] = React.useState<Status>("loading");
  const [location, setLocation] = React.useState<Location | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/profile/location");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.location) {
        setErrorMessage(data?.error ?? "Couldn't detect your location.");
        setStatus("error");
        return;
      }
      setLocation(data.location);
      setStatus("ready");
    } catch {
      setErrorMessage("Couldn't reach the location service.");
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-strata-green-soft text-strata-green">
            <MapPinned className="h-4 w-4" />
          </span>
          Detected Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex items-center gap-3 rounded-xl border border-border p-4">
            <div className="h-9 w-12 animate-pulse rounded bg-secondary" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-40 animate-pulse rounded bg-secondary" />
              <div className="h-2.5 w-24 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button size="sm" variant="outline" className="gap-2" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {status === "ready" && location && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div className="flex items-center gap-4">
              {location.flagUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={location.flagUrl}
                  alt={`${location.country} flag`}
                  className="h-9 w-12 rounded-md border border-border object-cover"
                />
              ) : (
                <span className="flex h-9 w-12 items-center justify-center rounded-md border border-border bg-secondary text-xs text-muted-foreground">
                  —
                </span>
              )}
              <div>
                <p className="text-sm font-semibold">
                  {location.region ? `${location.region}, ${location.country}` : location.country}
                </p>
                <p className="text-xs text-muted-foreground">
                  {location.city ? `${location.city} · ` : ""}Detected from IP {location.ip}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Based on the public IP address of the device you&apos;re currently using. This can vary if you&apos;re on a VPN or mobile network.
        </p>
      </CardContent>
    </Card>
  );
}
