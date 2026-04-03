import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, MapPin, Package, User } from "lucide-react";
import { motion } from "motion/react";
import type { Batch } from "../lib/supply-chain-types";
import { ROLE_CONFIG, getFarmerPayment } from "../lib/supply-chain-types";

interface BatchCardProps {
  batch: Batch;
  index?: number;
  showAdvance?: boolean;
}

const STATUS_STYLES: Record<Batch["status"], string> = {
  harvested: "bg-yellow-50 text-yellow-700 border-yellow-200",
  "in-transit": "bg-blue-50 text-blue-700 border-blue-200",
  stored: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-accent text-accent-foreground border-primary/20",
  processing: "bg-orange-50 text-orange-700 border-orange-200",
};

export function BatchCard({ batch, index = 0 }: BatchCardProps) {
  const navigate = useNavigate();
  const config = ROLE_CONFIG[batch.currentStage];
  const farmerPayment = getFarmerPayment(batch);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      data-ocid={`batch.item.${index + 1}`}
      className="group cursor-pointer"
      onClick={() =>
        navigate({ to: "/batch/$batchId", params: { batchId: batch.id } })
      }
    >
      <div className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-[15px] group-hover:text-primary transition-colors">
              {batch.cropName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {batch.variety}
            </p>
          </div>
          <code className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
            {batch.id}
          </code>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge
            variant="outline"
            className="text-[11px] gap-1 bg-primary/5 border-primary/30 text-primary"
          >
            <span>{config.icon}</span>
            {config.label}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-[11px]", STATUS_STYLES[batch.status])}
          >
            {batch.status}
          </Badge>
          {farmerPayment && (
            <Badge className="text-[11px] bg-green-600 text-white border-0 gap-1">
              Farmer Paid ✅
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {batch.quantity} {batch.unit}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {batch.farmerName}
          </span>
          <span className="flex items-center gap-1 col-span-2">
            <MapPin className="w-3 h-3" />
            {batch.farmLocation}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {batch.harvestDate}
          </span>
          {farmerPayment && (
            <span className="flex items-center gap-1 text-green-700 font-semibold">
              ₹{farmerPayment.amount.toLocaleString("en-IN")} received
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
