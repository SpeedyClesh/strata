import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import type { TransactionView } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TransactionsTable({ transactions }: { transactions: TransactionView[] }) {
  if (transactions.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <span
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
                    (tx.direction === "in" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground")
                  }
                >
                  {tx.direction === "in" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <p className="font-medium leading-none">{tx.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{tx.counterpartyLabel}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {tx.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </TableCell>
            <TableCell
              className={"text-right font-medium " + (tx.direction === "in" ? "text-accent" : "text-foreground")}
            >
              {tx.direction === "in" ? "+" : "−"}
              {formatCurrency(tx.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
