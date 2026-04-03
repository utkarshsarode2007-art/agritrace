import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Clock,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  ThermometerSun,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { SupplyChainFlow } from "../components/SupplyChainFlow";
import { useSupplyChain } from "../context/SupplyChainContext";
import { calcTotalPrice, getPricePerKg, parseQuantityKg } from "../lib/pricing";
import {
  ROLE_CONFIG,
  STAGE_ORDER,
  getFarmerPayment,
} from "../lib/supply-chain-types";
import type { StageUpdate, UserRole } from "../lib/supply-chain-types";

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateHash(hash: string): string {
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

type StageStatus = "completed" | "in-progress" | "pending";

function getStageStatus(stage: UserRole, currentStage: UserRole): StageStatus {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const stageIdx = STAGE_ORDER.indexOf(stage);
  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) return "in-progress";
  return "pending";
}

function StageUpdateCard({ update }: { update: StageUpdate }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{update.action}</span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTimestamp(update.timestamp)}
        </span>
      </div>
      <p className="text-muted-foreground leading-snug">{update.details}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
        {update.handler && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            {update.handler}
          </span>
        )}
        {update.location && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {update.location}
          </span>
        )}
        {update.temperature && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ThermometerSun className="w-3 h-3" />
            {update.temperature}
          </span>
        )}
      </div>
      {update.notes && (
        <p className="text-xs text-accent-foreground bg-accent/30 rounded px-2 py-1 mt-1">
          {update.notes}
        </p>
      )}
    </div>
  );
}

function StageIndicator({ status }: { status: StageStatus }) {
  if (status === "completed") {
    return (
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
      </div>
    );
  }
  if (status === "in-progress") {
    return (
      <div className="relative w-9 h-9 flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative w-9 h-9 rounded-full bg-primary/90 border-2 border-primary flex items-center justify-center shadow-sm">
          <Clock className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full border-2 border-border bg-muted flex items-center justify-center flex-shrink-0">
      <Circle className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

export function ConsumerScan() {
  const { batchId } = useParams({ from: "/scan/$batchId" });
  const { getBatch } = useSupplyChain();
  const batch = getBatch(batchId);

  if (!batch) {
    return (
      <div
        data-ocid="consumer_scan.error_state"
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-foreground">Product not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Batch ID: {batchId}
          </p>
          <Link to="/">
            <Button className="mt-4 bg-primary text-primary-foreground">
              Back to Platform
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pricePerKg = getPricePerKg(batch.cropName);
  const quantityKg = parseQuantityKg(batch.quantity);
  const totalPrice = calcTotalPrice(batch.cropName, quantityKg);
  const farmerPayment = getFarmerPayment(batch);

  return (
    <div className="min-h-screen bg-background">
      {/* Verified Header */}
      <div className="bg-agri-green text-white">
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Verified Product</h1>
            <p className="text-white/70 text-sm">
              This product has been traced through the supply chain
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* Batch Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-5 shadow-card"
        >
          <h2 className="font-bold text-foreground text-lg mb-3">
            {batch.cropName}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">{batch.variety}</p>
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge variant="outline" className="gap-1 text-xs">
              <Package className="w-3 h-3" />
              {batch.quantity} {batch.unit}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <User className="w-3 h-3" />
              {batch.farmerName}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              {batch.farmLocation}
            </Badge>
            <Badge className="bg-accent text-accent-foreground text-xs">
              {batch.status}
            </Badge>
            {farmerPayment && (
              <Badge className="bg-green-600 text-white border-0 text-xs">
                Farmer Paid ✅
              </Badge>
            )}
          </div>

          {/* Price Breakdown Row */}
          <div
            className="flex items-stretch divide-x divide-border border border-border rounded-lg overflow-hidden"
            data-ocid="consumer_scan.price_breakdown.card"
          >
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-2 bg-muted/30">
              <span className="text-xs text-muted-foreground">Market Rate</span>
              <span className="font-bold text-foreground text-sm">
                ₹{pricePerKg}/kg
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-2 bg-muted/30">
              <span className="text-xs text-muted-foreground">Quantity</span>
              <span className="font-bold text-foreground text-sm">
                {quantityKg.toLocaleString("en-IN")} kg
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-2 bg-primary/5">
              <span className="text-xs text-muted-foreground">Total Value</span>
              <span className="font-bold text-primary text-sm">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Farmer Payment Confirmation */}
          {farmerPayment && (
            <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-green-800">
                    Payment Received: ₹
                    {farmerPayment.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <Badge className="bg-green-600 text-white border-0 text-[11px] py-0">
                  Paid ✅
                </Badge>
              </div>
              <p className="text-xs text-green-700">
                {batch.farmerName} has received fair compensation for this crop.
              </p>
              {farmerPayment.txHash && (
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-green-200">
                  <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-[11px] text-primary font-medium">
                    Verified on Blockchain
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {truncateHash(farmerPayment.txHash)}
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
          )}
        </motion.div>

        {/* Supply Chain Progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-5 shadow-card"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Supply Chain Journey
          </h3>
          <SupplyChainFlow currentStage={batch.currentStage} />
        </motion.div>

        {/* Full Stage Journey Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-5 shadow-card"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Product Journey
          </h3>

          <div className="relative">
            {STAGE_ORDER.map((stage, idx) => {
              const config = ROLE_CONFIG[stage];
              const status = getStageStatus(stage, batch.currentStage);
              const stageUpdates = batch.updates.filter(
                (u) => u.stage === stage,
              );
              const isLast = idx === STAGE_ORDER.length - 1;
              const isFarmerStage = stage === "farmer";

              return (
                <div key={stage} className="relative flex gap-4">
                  {/* Vertical connector line */}
                  {!isLast && (
                    <div
                      className={[
                        "absolute left-4 top-9 w-0.5 bottom-0 z-0",
                        status === "completed"
                          ? "bg-primary/50"
                          : status === "in-progress"
                            ? "bg-primary/20"
                            : "bg-border",
                      ].join(" ")}
                    />
                  )}

                  {/* Stage indicator column */}
                  <div className="relative z-10 flex-shrink-0">
                    <StageIndicator status={status} />
                  </div>

                  {/* Stage content */}
                  <div
                    className={["flex-1 pb-6", isLast ? "pb-0" : ""].join(" ")}
                  >
                    {/* Stage header */}
                    <div className="flex items-center gap-2 mb-1 min-h-[2.25rem]">
                      <span className="text-lg leading-none">
                        {config.icon}
                      </span>
                      <span
                        className={[
                          "font-semibold text-sm",
                          status === "pending"
                            ? "text-muted-foreground"
                            : "text-foreground",
                        ].join(" ")}
                      >
                        {config.label}
                      </span>
                      {status === "completed" && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20 ml-auto">
                          Completed
                        </Badge>
                      )}
                      {status === "in-progress" && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200 ml-auto">
                          In Progress
                        </Badge>
                      )}
                      {status === "pending" && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground ml-auto"
                        >
                          Awaiting
                        </Badge>
                      )}
                    </div>

                    {/* Updates list */}
                    {status !== "pending" && (
                      <div className="space-y-2 mt-2">
                        {stageUpdates.length > 0 ? (
                          stageUpdates.map((update) => (
                            <StageUpdateCard key={update.id} update={update} />
                          ))
                        ) : (
                          <div className="bg-muted/30 rounded-lg px-3 py-2 text-sm text-muted-foreground italic">
                            Handed off
                          </div>
                        )}

                        {/* Farmer payment confirmation in farmer stage */}
                        {isFarmerStage && farmerPayment && (
                          <div className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-xs font-semibold text-green-800">
                                Payment Received: ₹
                                {farmerPayment.amount.toLocaleString("en-IN")}
                              </span>
                              <Badge className="ml-auto bg-green-600 text-white border-0 text-[10px] py-0">
                                Farmer Paid ✅
                              </Badge>
                            </div>
                            {farmerPayment.txHash && (
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
                                <span className="text-[10px] text-primary font-medium">
                                  Verified on Blockchain
                                </span>
                                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                                  {truncateHash(farmerPayment.txHash)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pending placeholder */}
                    {status === "pending" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Not yet reached this stage
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex justify-center pb-6"
        >
          <Link to="/">
            <Button
              className="bg-primary text-primary-foreground gap-2"
              data-ocid="consumer_scan.back_button"
            >
              <Leaf className="w-4 h-4" />
              Back to Platform
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
