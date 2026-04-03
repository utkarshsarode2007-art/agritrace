import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ROLE_CONFIG } from "../lib/supply-chain-types";
import type { Transaction } from "../lib/supply-chain-types";

interface TransactionLogProps {
  transactions: Transaction[];
  highlightFarmerPayment?: boolean;
}

function truncateHash(hash: string): string {
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function TransactionLog({
  transactions,
  highlightFarmerPayment = true,
}: TransactionLogProps) {
  if (transactions.length === 0) {
    return (
      <div
        data-ocid="transactions.empty_state"
        className="text-center py-10 text-muted-foreground"
      >
        No transactions recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx, i) => {
        const isFarmerTx =
          tx.from === "farmer" &&
          tx.to === "supplier" &&
          tx.status === "completed";
        return (
          <div
            key={tx.id}
            data-ocid={`transactions.item.${i + 1}`}
            className={[
              "rounded-xl border transition-colors overflow-hidden",
              isFarmerTx && highlightFarmerPayment
                ? "border-green-300 bg-green-50/60"
                : "border-border bg-muted/40 hover:border-primary/30",
            ].join(" ")}
          >
            {/* Farmer Paid banner */}
            {isFarmerTx && highlightFarmerPayment && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border-b border-green-200">
                <span className="text-green-600 text-base">✅</span>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Farmer Paid
                </span>
                <Badge className="ml-auto text-[10px] py-0 bg-green-600 text-white border-0">
                  Payment Received
                </Badge>
              </div>
            )}

            {/* Main transaction row */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <span>{ROLE_CONFIG[tx.from].icon}</span>
                    <span className="text-foreground">
                      {ROLE_CONFIG[tx.from].label}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="flex items-center gap-1">
                    <span>{ROLE_CONFIG[tx.to].icon}</span>
                    <span className="text-foreground">
                      {ROLE_CONFIG[tx.to].label}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={[
                      "font-bold text-sm",
                      isFarmerTx && highlightFarmerPayment
                        ? "text-green-700"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(tx.timestamp))}
                  </div>
                </div>
                <Badge
                  className={
                    tx.status === "completed"
                      ? "bg-accent text-accent-foreground text-[10px] py-0"
                      : "bg-muted text-muted-foreground text-[10px] py-0"
                  }
                >
                  {tx.status}
                </Badge>
              </div>
            </div>

            {/* Blockchain verification row */}
            {tx.txHash && (
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 border-t border-border">
                <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-[11px] font-medium text-primary">
                  Verified on Blockchain
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground bg-background border border-border rounded px-2 py-0.5">
                  {truncateHash(tx.txHash)}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 border-primary/30 text-primary"
                >
                  Immutable Record
                </Badge>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
