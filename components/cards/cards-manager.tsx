"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Snowflake, PlusCircle } from "lucide-react";
import type { CardBrand } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardVisual } from "@/components/cards/card-visual";
import { useToast } from "@/components/ui/use-toast";

export type CardView = {
  id: string;
  brand: CardBrand;
  numberFull: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  frozen: boolean;
};

export function CardsManager({ cards, holderName }: { cards: CardView[]; holderName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [issuing, setIssuing] = React.useState(false);

  async function toggleFreeze(cardId: string) {
    setPendingId(cardId);
    const res = await fetch(`/api/cards/${cardId}/freeze`, { method: "POST" });
    setPendingId(null);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Something went wrong", description: err.error ?? "Please try again." });
      return;
    }
    router.refresh();
  }

  async function issueCard(brand: CardBrand) {
    setIssuing(true);
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand }),
    });
    setIssuing(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Could not issue card", description: err.error ?? "Please try again." });
      return;
    }
    toast({ title: "Virtual card issued", description: `A new simulated ${brand} card has been added to your account.` });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {cards.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You don&apos;t have any virtual cards yet. Issue one below.
          </CardContent>
        </Card>
      )}

      {cards.map((card) => (
        <Card key={card.id}>
          <CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center">
            <CardVisual
              brand={card.brand}
              numberFull={card.numberFull}
              holder={holderName}
              expMonth={card.expMonth}
              expYear={card.expYear}
              cvv={card.cvv}
              frozen={card.frozen}
              reveal={!!revealed[card.id]}
            />
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Virtual {card.brand} card</p>
                <p className="text-base font-medium">Ending in {card.last4}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevealed((r) => ({ ...r, [card.id]: !r[card.id] }))}
                  className="gap-2"
                >
                  {revealed[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {revealed[card.id] ? "Hide details" : "Reveal details"}
                </Button>
                <Button
                  variant={card.frozen ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFreeze(card.id)}
                  disabled={pendingId === card.id}
                  className="gap-2"
                >
                  <Snowflake className="h-4 w-4" />
                  {card.frozen ? "Unfreeze" : "Freeze"}
                </Button>
              </div>
              {card.frozen && (
                <p className="text-xs text-muted-foreground">
                  This card is frozen. Simulated purchases will be declined until you unfreeze it.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Issue a new virtual card</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => issueCard("VISA")} disabled={issuing} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Issue Visa
          </Button>
          <Button onClick={() => issueCard("MASTERCARD")} disabled={issuing} variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Issue Mastercard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
