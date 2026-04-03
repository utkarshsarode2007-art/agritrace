import { cn } from "@/lib/utils";
import { ROLE_CONFIG, STAGE_ORDER } from "../lib/supply-chain-types";
import type { UserRole } from "../lib/supply-chain-types";

interface SupplyChainFlowProps {
  currentStage: UserRole;
  className?: string;
}

export function SupplyChainFlow({
  currentStage,
  className,
}: SupplyChainFlowProps) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {STAGE_ORDER.map((stage, idx) => {
        const config = ROLE_CONFIG[stage];
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <div key={stage} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all",
                  isCompleted && "bg-primary border-primary",
                  isCurrent &&
                    "bg-primary border-primary ring-4 ring-primary/20 scale-110",
                  isFuture && "bg-muted border-border",
                )}
              >
                <span className={cn(isFuture && "opacity-40")}>
                  {config.icon}
                </span>
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium text-center leading-tight max-w-[64px]",
                  (isCompleted || isCurrent) && "text-primary",
                  isFuture && "text-muted-foreground opacity-60",
                )}
              >
                {config.label.split(" / ")[0]}
              </span>
            </div>
            {idx < STAGE_ORDER.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  idx < currentIdx ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
