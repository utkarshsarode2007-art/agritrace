import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer, User } from "lucide-react";
import { ROLE_CONFIG } from "../lib/supply-chain-types";
import type { StageUpdate } from "../lib/supply-chain-types";

interface BatchTimelineProps {
  updates: StageUpdate[];
}

export function BatchTimeline({ updates }: BatchTimelineProps) {
  if (updates.length === 0) {
    return (
      <div
        data-ocid="timeline.empty_state"
        className="text-center py-10 text-muted-foreground"
      >
        No updates recorded yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {updates.map((update, i) => {
          const config = ROLE_CONFIG[update.stage];
          return (
            <div
              key={update.id}
              data-ocid={`timeline.item.${i + 1}`}
              className="flex gap-4 relative"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-agri-green-pale border-2 border-primary flex items-center justify-center text-base z-10">
                {config.icon}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm text-foreground">
                    {update.action}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 border-primary/30 text-primary"
                  >
                    {config.label}
                  </Badge>
                  {update.temperature && (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-1.5 gap-0.5 text-blue-600 border-blue-200"
                    >
                      <Thermometer className="w-2.5 h-2.5" />
                      {update.temperature}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-foreground/80 mb-1.5">
                  {update.details}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {update.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {update.handler}
                  </span>
                  <span>
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(update.timestamp))}
                  </span>
                </div>
                {update.notes && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Note: {update.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
