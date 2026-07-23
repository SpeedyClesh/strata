"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Snowflake, PlusCircle } from "lucide-react";
import type { CardBrand, CardStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardVisual } from "@/components/cards/card-visual";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

export type CardView = {
  id: string;
  brand: CardBrand;
  numberFull: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  status: CardStatus;
  balance: number;
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
    toast({ title: "Virtual card issued", description: `A new ${brand} card has been added to your account.` });
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

      {cards.map((card) => {
        const frozen = card.status === "FROZEN";
        const pending = card.status === "PENDING";
        return (
          <Card key={card.id}>
            <CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center">
              <CardVisual
                brand={card.brand}
                numberFull={card.numberFull}
                holder={holderName}
                expMonth={card.expMonth}
                expYear={card.expYear}
                cvv={card.cvv}
                frozen={frozen}
                reveal={!!revealed[card.id]}
              />
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Virtual {card.brand} card</p>
                  <p className="text-base font-medium">Ending in {card.last4}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Balance: {formatCurrency(card.balance)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => setRevealed((r) => ({ ...r, [card.id]: !r[card.id] }))}
                    className="gap-2"
                  >
                    {revealed[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {revealed[card.id] ? "Hide details" : "Reveal details"}
                  </Button>
                  <Button
                    variant={frozen ? "default" : "outline"}
                    size="sm"
                    disabled={pending || pendingId === card.id}
                    onClick={() => toggleFreeze(card.id)}
                    className="gap-2"
                  >
                    <Snowflake className="h-4 w-4" />
                    {frozen ? "Unfreeze" : "Freeze"}
                  </Button>
                </div>
                {pending && (
                  <p className="text-xs text-strata-amber-deep">
                    This card is pending approval. It will be active shortly.
                  </p>
                )}
                {frozen && (
                  <p className="text-xs text-muted-foreground">
                    This card is frozen. Purchases will be declined until you unfreeze it.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Issue a new virtual card</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => issueCard("VISA")} disabled={issuing} className="gap-2 bg-strata-green hover:bg-strata-green-deep">
            <PlusCircle className="h-4 w-4" /> Issue Visa
          </Button>
          <Button onClick={() => issueCard("MASTERCARD")} disabled={issuing} variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Issue Mastercard
          </Button>
          <Button onClick={() => issueCard("AMEX")} disabled={issuing} variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Issue Amex
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
