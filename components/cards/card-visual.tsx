import { cn } from "@/lib/utils";
import type { CardBrand } from "@prisma/client";

export function CardVisual({
  brand,
  numberFull,
  holder,
  expMonth,
  expYear,
  cvv,
  frozen,
  reveal,
}: {
  brand: CardBrand;
  numberFull: string;
  holder: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  frozen: boolean;
  reveal: boolean;
}) {
  const maskedNumber = "•••• •••• •••• " + numberFull.slice(-4);
  return (
    <div
      className={cn(
        "relative flex aspect-[1.586/1] w-full max-w-sm flex-col justify-between overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-soft transition-opacity",
        frozen ? "opacity-70" : "",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest">Strata</span>
        <span className="text-xs font-semibold uppercase tracking-widest">{brand}</span>
      </div>
      <div className="mt-6">
        <p className="font-mono text-xl tracking-widest">{reveal ? numberFull : maskedNumber}</p>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Cardholder</p>
          <p className="text-sm font-semibold uppercase tracking-wide">{holder}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Exp</p>
          <p className="font-mono text-sm">
            {String(expMonth).padStart(2, "0")}/{String(expYear).slice(-2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60">CVV</p>
          <p className="font-mono text-sm">{reveal ? cvv : "•••"}</p>
        </div>
      </div>
      {frozen && (
        <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur">
          Frozen
        </span>
      )}
    </div>
  );
}
